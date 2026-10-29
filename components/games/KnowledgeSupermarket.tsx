import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import confetti from 'canvas-confetti';
import { 
  ShoppingCart, ArrowRight, ArrowLeft, Volume2, VolumeX,
  RotateCcw, CheckCircle2, XCircle, Printer, Trophy,
  Star, Tag, Scissors, AlertCircle, Play, 
  Store, Package, FileText, Layers, BookOpen, Compass, Wind,
  Camera, Scan, Award, ShieldCheck, Sparkles, Check
} from 'lucide-react';
import { useAuth } from '../AuthProvider';
import html2canvas from 'html2canvas';
import { jsPDF } from 'jspdf';

// Generated Asset Paths
import parkingIntroImg from '/src/assets/images/supermarket_parking_intro_1791186344934.jpg';
import aisleHallImg from '/src/assets/images/dokan-almaarifa-02-four-depth-signs.png';
import shelvesBackdropImg from '/src/assets/images/supermarket_shelves_backdrop_1791186375322.jpg';
import cashierCheckoutImg from '/src/assets/images/supermarket_cashier_checkout_1791186385716.jpg';

// Ultra-High Quality Department Interior Images from GitHub
import deptNounsBg from '/src/assets/images/dept_nouns_bg.webp';
import deptVerbsBg from '/src/assets/images/dept_verbs_bg.png';
import deptParticlesBg from '/src/assets/images/قسم الحروف.webp';
import deptSpellingBg from '/src/assets/images/dept_spelling_bg.webp';

const DEPARTMENT_BACKGROUNDS: Record<DepartmentId, string> = {
  nouns: deptNounsBg,
  verbs: deptVerbsBg,
  particles: deptParticlesBg,
  spelling: deptSpellingBg,
};

// Immediate Eager Image Preloading to Eliminate Any Page Switching Delay
const ALL_PAGE_BACKGROUNDS = [
  parkingIntroImg,
  aisleHallImg,
  shelvesBackdropImg,
  cashierCheckoutImg,
  deptNounsBg,
  deptVerbsBg,
  deptParticlesBg,
  deptSpellingBg
];

if (typeof window !== 'undefined') {
  ALL_PAGE_BACKGROUNDS.forEach(src => {
    if (src) {
      const img = new Image();
      img.src = src;
    }
  });
}

// ============================================================================
// 1. SOUND SYNTHESIS ENGINE (Web Audio API - Zero External Dependencies)
// ============================================================================
class SupermarketAudio {
  private ctx: AudioContext | null = null;
  private soundEnabled: boolean = true;

  constructor() {
    // Lazily initialized on first user interaction
  }

  private init() {
    if (!this.ctx && typeof window !== 'undefined') {
      const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
      if (AudioCtx) {
        this.ctx = new AudioCtx();
      }
    }
    if (this.ctx && this.ctx.state === 'suspended') {
      this.ctx.resume();
    }
  }

  public setEnabled(enabled: boolean) {
    this.soundEnabled = enabled;
  }

  public getEnabled(): boolean {
    return this.soundEnabled;
  }

  // Car engine rev & gentle parking brake
  public playCarArrival() {
    if (!this.soundEnabled) return;
    try {
      this.init();
      if (!this.ctx) return;
      const now = this.ctx.currentTime;
      
      // Engine low hum
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      osc.type = 'triangle';
      osc.frequency.setValueAtTime(110, now);
      osc.frequency.exponentialRampToValueAtTime(70, now + 1.8);
      gain.gain.setValueAtTime(0.12, now);
      gain.gain.exponentialRampToValueAtTime(0.01, now + 2.0);

      osc.connect(gain);
      gain.connect(this.ctx.destination);
      osc.start(now);
      osc.stop(now + 2.0);
    } catch {
      // Audio fallback silent
    }
  }

  // Friendly double horn beep "طووط طووط!"
  public playCarHorn() {
    if (!this.soundEnabled) return;
    try {
      this.init();
      if (!this.ctx) return;
      const now = this.ctx.currentTime;

      [0, 0.22].forEach((offset) => {
        const osc1 = this.ctx!.createOscillator();
        const osc2 = this.ctx!.createOscillator();
        const gain = this.ctx!.createGain();

        osc1.type = 'sawtooth';
        osc2.type = 'sine';
        osc1.frequency.setValueAtTime(420, now + offset);
        osc2.frequency.setValueAtTime(540, now + offset);

        gain.gain.setValueAtTime(0.08, now + offset);
        gain.gain.exponentialRampToValueAtTime(0.001, now + offset + 0.16);

        osc1.connect(gain);
        osc2.connect(gain);
        gain.connect(this.ctx!.destination);

        osc1.start(now + offset);
        osc2.start(now + offset);
        osc1.stop(now + offset + 0.16);
        osc2.stop(now + offset + 0.16);
      });
    } catch {}
  }

  // Car engine shutdown sound (power down hum, pitch drop, engine stop, key click)
  public playEngineShutdown() {
    if (!this.soundEnabled) return;
    try {
      this.init();
      if (!this.ctx) return;
      const now = this.ctx.currentTime;

      // Engine pitch dropping down
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      osc.type = 'triangle';
      osc.frequency.setValueAtTime(85, now);
      osc.frequency.exponentialRampToValueAtTime(24, now + 1.2);
      gain.gain.setValueAtTime(0.18, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 1.25);

      osc.connect(gain);
      gain.connect(this.ctx.destination);
      osc.start(now);
      osc.stop(now + 1.25);

      // Light switch / ignition key click
      const clickOsc = this.ctx.createOscillator();
      const clickGain = this.ctx.createGain();
      clickOsc.type = 'square';
      clickOsc.frequency.setValueAtTime(600, now + 0.05);
      clickOsc.frequency.exponentialRampToValueAtTime(140, now + 0.14);
      clickGain.gain.setValueAtTime(0.12, now + 0.05);
      clickGain.gain.exponentialRampToValueAtTime(0.001, now + 0.14);
      clickOsc.connect(clickGain);
      clickGain.connect(this.ctx.destination);
      clickOsc.start(now + 0.05);
      clickOsc.stop(now + 0.14);
    } catch {}
  }

  // Sliding glass door opening sound
  public playDoorSlide() {
    if (!this.soundEnabled) return;
    try {
      this.init();
      if (!this.ctx) return;
      const now = this.ctx.currentTime;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(260, now);
      osc.frequency.exponentialRampToValueAtTime(440, now + 0.5);
      gain.gain.setValueAtTime(0.05, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.6);
      osc.connect(gain);
      gain.connect(this.ctx.destination);
      osc.start(now);
      osc.stop(now + 0.6);
    } catch {}
  }

  // Wooden shelf placement click
  public playShelfDrop() {
    if (!this.soundEnabled) return;
    try {
      this.init();
      if (!this.ctx) return;
      const now = this.ctx.currentTime;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(650, now);
      osc.frequency.exponentialRampToValueAtTime(220, now + 0.12);
      gain.gain.setValueAtTime(0.2, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.12);
      osc.connect(gain);
      gain.connect(this.ctx.destination);
      osc.start(now);
      osc.stop(now + 0.12);
    } catch {}
  }

  // Supermarket barcode laser scanner 'BEEP!'
  public playBarcodeScan() {
    if (!this.soundEnabled) return;
    try {
      this.init();
      if (!this.ctx) return;
      const now = this.ctx.currentTime;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(1760, now); // A6 note - high store scanner beep
      gain.gain.setValueAtTime(0.18, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.09);
      osc.connect(gain);
      gain.connect(this.ctx.destination);
      osc.start(now);
      osc.stop(now + 0.09);
    } catch {}
  }

  // Cash register opening & bell 'Ka-Ching!'
  public playKaChing() {
    if (!this.soundEnabled) return;
    try {
      this.init();
      if (!this.ctx) return;
      const now = this.ctx.currentTime;
      
      // Chime bell 1
      const osc1 = this.ctx.createOscillator();
      const gain1 = this.ctx.createGain();
      osc1.type = 'sine';
      osc1.frequency.setValueAtTime(1046.5, now); // C6
      gain1.gain.setValueAtTime(0.15, now);
      gain1.gain.exponentialRampToValueAtTime(0.001, now + 0.4);
      osc1.connect(gain1);
      gain1.connect(this.ctx.destination);
      osc1.start(now);
      osc1.stop(now + 0.4);

      // Chime bell 2 (higher harmony)
      const osc2 = this.ctx.createOscillator();
      const gain2 = this.ctx.createGain();
      osc2.type = 'sine';
      osc2.frequency.setValueAtTime(1567.98, now + 0.06); // G6
      gain2.gain.setValueAtTime(0.2, now + 0.06);
      gain2.gain.exponentialRampToValueAtTime(0.001, now + 0.6);
      osc2.connect(gain2);
      gain2.connect(this.ctx.destination);
      osc2.start(now + 0.06);
      osc2.stop(now + 0.6);
    } catch {}
  }

  // Receipt printing stepper motor hum
  public playReceiptPrint() {
    if (!this.soundEnabled) return;
    try {
      this.init();
      if (!this.ctx) return;
      const now = this.ctx.currentTime;
      for (let i = 0; i < 6; i++) {
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();
        osc.type = 'sawtooth';
        osc.frequency.setValueAtTime(320 + (i % 2) * 50, now + i * 0.08);
        gain.gain.setValueAtTime(0.05, now + i * 0.08);
        gain.gain.exponentialRampToValueAtTime(0.001, now + i * 0.08 + 0.06);
        osc.connect(gain);
        gain.connect(this.ctx.destination);
        osc.start(now + i * 0.08);
        osc.stop(now + i * 0.08 + 0.06);
      }
    } catch {}
  }

  // Realistic paper ticket tearing sound
  public playPaperTear() {
    if (!this.soundEnabled) return;
    try {
      this.init();
      if (!this.ctx) return;
      const now = this.ctx.currentTime;
      const dur = 0.22;
      const bufSize = Math.floor(this.ctx.sampleRate * dur);
      const buf = this.ctx.createBuffer(1, bufSize, this.ctx.sampleRate);
      const ch = buf.getChannelData(0);
      for (let j = 0; j < bufSize; j++) {
        ch[j] = (Math.random() * 2 - 1) * 0.35;
      }
      const src = this.ctx.createBufferSource();
      src.buffer = buf;
      const hp = this.ctx.createBiquadFilter();
      hp.type = 'bandpass';
      hp.frequency.setValueAtTime(2200, now);
      hp.Q.setValueAtTime(1.8, now);
      const g = this.ctx.createGain();
      g.gain.setValueAtTime(0.09, now);
      g.gain.exponentialRampToValueAtTime(0.001, now + dur);
      src.connect(hp);
      hp.connect(g);
      g.connect(this.ctx.destination);
      src.start(now);
      src.stop(now + dur);
    } catch {}
  }

  // Wobble boing for incorrect placement
  public playErrorWobble() {
    if (!this.soundEnabled) return;
    try {
      this.init();
      if (!this.ctx) return;
      const now = this.ctx.currentTime;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(180, now);
      osc.frequency.linearRampToValueAtTime(110, now + 0.2);
      gain.gain.setValueAtTime(0.18, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.25);
      osc.connect(gain);
      gain.connect(this.ctx.destination);
      osc.start(now);
      osc.stop(now + 0.25);
    } catch {}
  }

  // Futuristic panoramic camera focus / wake chime
  public playCameraBeep() {
    if (!this.soundEnabled) return;
    try {
      this.init();
      if (!this.ctx) return;
      const now = this.ctx.currentTime;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(1480, now);
      gain.gain.setValueAtTime(0.001, now);
      gain.gain.linearRampToValueAtTime(0.12, now + 0.01);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.14);
      osc.connect(gain);
      gain.connect(this.ctx.destination);
      osc.start(now);
      osc.stop(now + 0.15);
    } catch {}
  }

  // High-tech panoramic laser beam sweep hum & frequency drift
  public playLaserSweep() {
    if (!this.soundEnabled) return;
    try {
      this.init();
      if (!this.ctx) return;
      const now = this.ctx.currentTime;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      osc.type = 'sawtooth';
      osc.frequency.setValueAtTime(680, now);
      osc.frequency.exponentialRampToValueAtTime(2100, now + 0.25);
      osc.frequency.exponentialRampToValueAtTime(950, now + 0.55);
      gain.gain.setValueAtTime(0.001, now);
      gain.gain.linearRampToValueAtTime(0.07, now + 0.05);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.58);
      osc.connect(gain);
      gain.connect(this.ctx.destination);
      osc.start(now);
      osc.stop(now + 0.6);
    } catch {}
  }

  // Industrial metal-etching / CNC scanner precision sizzle & pulse
  public playLaserEtchBuzz() {
    if (!this.soundEnabled) return;
    try {
      this.init();
      if (!this.ctx) return;
      const now = this.ctx.currentTime;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      osc.type = 'sawtooth';
      osc.frequency.setValueAtTime(2400, now);
      osc.frequency.linearRampToValueAtTime(1600, now + 0.12);
      gain.gain.setValueAtTime(0.04, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.13);
      osc.connect(gain);
      gain.connect(this.ctx.destination);
      osc.start(now);
      osc.stop(now + 0.14);

      // Micro spark hiss
      const dur = 0.08;
      const bufSize = Math.floor(this.ctx.sampleRate * dur);
      const buf = this.ctx.createBuffer(1, bufSize, this.ctx.sampleRate);
      const ch = buf.getChannelData(0);
      for (let j = 0; j < bufSize; j++) {
        ch[j] = (Math.random() * 2 - 1) * 0.25;
      }
      const src = this.ctx.createBufferSource();
      src.buffer = buf;
      const hp = this.ctx.createBiquadFilter();
      hp.type = 'highpass';
      hp.frequency.setValueAtTime(3200, now);
      const g = this.ctx.createGain();
      g.gain.setValueAtTime(0.02, now);
      g.gain.exponentialRampToValueAtTime(0.001, now + dur);
      src.connect(hp);
      hp.connect(g);
      g.connect(this.ctx.destination);
      src.start(now);
      src.stop(now + dur);
    } catch {}
  }

  // Shelf audit validation ping (crisp electronic confirmation)
  public playShelfAuditPing() {
    if (!this.soundEnabled) return;
    try {
      this.init();
      if (!this.ctx) return;
      const now = this.ctx.currentTime;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(1760, now); // A6
      osc.frequency.setValueAtTime(2200, now + 0.06); // C#7
      gain.gain.setValueAtTime(0.1, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.16);
      osc.connect(gain);
      gain.connect(this.ctx.destination);
      osc.start(now);
      osc.stop(now + 0.16);
    } catch {}
  }

  // 1. Realistic AC Remote Digital Beep (crisp dual electronic chirp, no music)
  public playAcBeep() {
    if (!this.soundEnabled) return;
    try {
      this.init();
      if (!this.ctx) return;
      const now = this.ctx.currentTime;
      // High-tech digital AC confirmation beep
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(2200, now);
      gain.gain.setValueAtTime(0, now);
      gain.gain.linearRampToValueAtTime(0.15, now + 0.005);
      gain.gain.setValueAtTime(0.15, now + 0.05);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.075);
      osc.connect(gain);
      gain.connect(this.ctx.destination);
      osc.start(now);
      osc.stop(now + 0.08);

      // Second micro-chirp for authentic split AC remote response
      const osc2 = this.ctx.createOscillator();
      const gain2 = this.ctx.createGain();
      osc2.type = 'sine';
      osc2.frequency.setValueAtTime(2600, now + 0.09);
      gain2.gain.setValueAtTime(0, now + 0.09);
      gain2.gain.linearRampToValueAtTime(0.12, now + 0.095);
      gain2.gain.setValueAtTime(0.12, now + 0.14);
      gain2.gain.exponentialRampToValueAtTime(0.001, now + 0.165);
      osc2.connect(gain2);
      gain2.connect(this.ctx.destination);
      osc2.start(now + 0.09);
      osc2.stop(now + 0.17);
    } catch {}
  }

  // 2. Realistic AC Louver Motor / Servo Opening (subtle micro-motor mechanical whir)
  public playAcLouverOpen() {
    if (!this.soundEnabled) return;
    try {
      this.init();
      if (!this.ctx) return;
      const now = this.ctx.currentTime;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(190, now);
      osc.frequency.linearRampToValueAtTime(140, now + 0.4);
      gain.gain.setValueAtTime(0, now);
      gain.gain.linearRampToValueAtTime(0.035, now + 0.04);
      gain.gain.setValueAtTime(0.035, now + 0.35);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.45);
      osc.connect(gain);
      gain.connect(this.ctx.destination);
      osc.start(now);
      osc.stop(now + 0.46);
    } catch {}
  }

  // 3. Realistic AC Blower Airflow (pure aerodynamic noise, centrifugal fan dynamics, zero musical notes)
  public playAcAirBlower() {
    if (!this.soundEnabled) return;
    try {
      this.init();
      if (!this.ctx) return;
      const now = this.ctx.currentTime;
      const duration = 2.8;

      // Realistic white/pink noise buffer for pure atmospheric air rush
      const bufferSize = Math.floor(this.ctx.sampleRate * duration);
      const buffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
      const data = buffer.getChannelData(0);
      let b0 = 0, b1 = 0, b2 = 0;
      for (let i = 0; i < bufferSize; i++) {
        const white = Math.random() * 2 - 1;
        // Pink noise filter approximation for natural acoustic airflow body
        b0 = 0.99886 * b0 + white * 0.0555179;
        b1 = 0.99332 * b1 + white * 0.0750759;
        b2 = 0.96900 * b2 + white * 0.1538520;
        data[i] = (b0 + b1 + b2 + white * 0.5362) * 0.35;
      }

      const noiseSource = this.ctx.createBufferSource();
      noiseSource.buffer = buffer;

      // Lowpass filter: cuts harshness, retains deep rushing airflow
      const lowpass = this.ctx.createBiquadFilter();
      lowpass.type = 'lowpass';
      lowpass.frequency.setValueAtTime(450, now);
      lowpass.frequency.linearRampToValueAtTime(1050, now + 0.7); // fan spools up
      lowpass.frequency.setValueAtTime(1050, now + 1.8);
      lowpass.frequency.exponentialRampToValueAtTime(380, now + duration);

      // Bandpass filter: provides the hollow blower acoustic air cavity
      const bandpass = this.ctx.createBiquadFilter();
      bandpass.type = 'bandpass';
      bandpass.Q.setValueAtTime(1.1, now);
      bandpass.frequency.setValueAtTime(420, now);
      bandpass.frequency.linearRampToValueAtTime(560, now + 0.7);
      bandpass.frequency.setValueAtTime(560, now + 1.8);
      bandpass.frequency.exponentialRampToValueAtTime(350, now + duration);

      const airGain = this.ctx.createGain();
      airGain.gain.setValueAtTime(0.001, now);
      airGain.gain.linearRampToValueAtTime(0.24, now + 0.65); // smooth air swell
      airGain.gain.setValueAtTime(0.24, now + 1.8);
      airGain.gain.exponentialRampToValueAtTime(0.001, now + duration);

      noiseSource.connect(lowpass);
      lowpass.connect(bandpass);
      bandpass.connect(airGain);
      airGain.connect(this.ctx.destination);
      noiseSource.start(now);
      noiseSource.stop(now + duration);

      // Low centrifugal fan hum (68Hz quiet steady mechanical motor, zero melody)
      const motorHum = this.ctx.createOscillator();
      const motorGain = this.ctx.createGain();
      motorHum.type = 'sine';
      motorHum.frequency.setValueAtTime(55, now);
      motorHum.frequency.linearRampToValueAtTime(68, now + 0.5);
      motorGain.gain.setValueAtTime(0.001, now);
      motorGain.gain.linearRampToValueAtTime(0.045, now + 0.5);
      motorGain.gain.setValueAtTime(0.045, now + 1.8);
      motorGain.gain.exponentialRampToValueAtTime(0.001, now + duration);
      motorHum.connect(motorGain);
      motorGain.connect(this.ctx.destination);
      motorHum.start(now);
      motorHum.stop(now + duration);
    } catch {}
  }

  // 4. Realistic Paper Flutter & Scatter (granular noise rustle, zero musical triangle tones)
  public playPaperScatter() {
    if (!this.soundEnabled) return;
    try {
      this.init();
      if (!this.ctx) return;
      const now = this.ctx.currentTime;
      // Organic rustling of paper cards: staggered bursts of highpass filtered noise
      for (let i = 0; i < 9; i++) {
        const offset = i * 0.08 + Math.random() * 0.03;
        const dur = 0.045 + Math.random() * 0.035;
        const bufSize = Math.floor(this.ctx.sampleRate * dur);
        const buf = this.ctx.createBuffer(1, bufSize, this.ctx.sampleRate);
        const ch = buf.getChannelData(0);
        for (let j = 0; j < bufSize; j++) {
          ch[j] = (Math.random() * 2 - 1) * 0.45;
        }
        const src = this.ctx.createBufferSource();
        src.buffer = buf;

        const hp = this.ctx.createBiquadFilter();
        hp.type = 'highpass';
        hp.frequency.setValueAtTime(1400 + Math.random() * 800, now + offset);

        const g = this.ctx.createGain();
        g.gain.setValueAtTime(0.001, now + offset);
        g.gain.linearRampToValueAtTime(0.06 + Math.random() * 0.03, now + offset + 0.008);
        g.gain.exponentialRampToValueAtTime(0.001, now + offset + dur);

        src.connect(hp);
        hp.connect(g);
        g.connect(this.ctx.destination);
        src.start(now + offset);
        src.stop(now + offset + dur);
      }
    } catch {}
  }

  // 5. Realistic Paper Card Soft Floor Land (soft acoustic tap)
  public playPaperSoftLand() {
    if (!this.soundEnabled) return;
    try {
      this.init();
      if (!this.ctx) return;
      const now = this.ctx.currentTime;
      // Damped soft card landing on tile
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(180, now);
      osc.frequency.exponentialRampToValueAtTime(65, now + 0.08);
      gain.gain.setValueAtTime(0.05, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.08);
      osc.connect(gain);
      gain.connect(this.ctx.destination);
      osc.start(now);
      osc.stop(now + 0.085);
    } catch {}
  }

  // Backwards compatibility wrappers
  public playWindGust() {
    this.playAcAirBlower();
  }
  public playPaperFlutter() {
    this.playPaperScatter();
  }
  public playPaperLand() {
    this.playPaperSoftLand();
  }
}

const audio = new SupermarketAudio();

// ============================================================================
// 2. PEDAGOGICAL CONTENT (The 4 Supermarket Departments)
// ============================================================================

export type DepartmentId = 'nouns' | 'verbs' | 'particles' | 'spelling';

export interface ShelfCategory {
  id: string;
  title: string;
  icon: string;
  color: string;
  awningBg: string;
  badgeBg: string;
  targetCount: number;
}

export interface WordItem {
  id: string;
  word: string;
  tashkeel: string;
  categoryId: string; // which shelf it belongs to
  isDistractor?: boolean;
  distractorNote?: string;
  explanation: string;
}

export interface DepartmentData {
  id: DepartmentId;
  titleAr: string;
  titleEn: string;
  signTitle: string;
  cartBadge: string;
  missionSpeech: string;
  themeColor: string;
  shelves: ShelfCategory[];
  items: WordItem[];
}

// ============================================================================
// 2. COMPREHENSIVE MUTUALLY EXCLUSIVE WORD BANK & DYNAMIC SESSION ENGINE
// ============================================================================
// بنك الكلمات المتنوع والمتوافق تربوياً بنسبة 100% وفق القواعد الصارمة:
// 1. قسم الأسماء (علامات الاسم الأربعة):
//    - التنوين: كلمات ثلاثية منونة (فتح، ضم، كسر) خالية من (الـ، التاء المربوطة، المثنى، الجمع).
//    - الـ التعريف: كلمات مبدوءة بـ (الـ، الأ، الا) خالية من (التنوين، التاء المربوطة، المثنى، الجمع).
//    - التاء المربوطة: كلمتان تنتهي بـ (ة) وكلمتان بـ (ـة) خالية من (التنوين، الـ، المثنى، الجمع).
//    - المثنى والجمع: (واحدة مثنى، واحدة ج.مذكر، واحدة ج.مؤنث، واحدة ج.تكسير) خالية من (التنوين، الـ، التاء المربوطة).
// 2. قسم الأفعال:
//    - الماضي: منوع (مفرد ـَ، نا الفاعلين ـْنَا، تاء التأنيث ـَتْ، تاء المخاطبين ـْتُمْ).
//    - المضارع: 4 كلمات تبدأ بـ (أ - نـ - يـ - تـ).
//    - الأمر: منوع (مفرد ـْ، ياء المخاطبة ـِي، واو الجماعة ـُوا، محذوف الوسط كُلْ).
//    - المستقبل: منوع متوازن بين (سـ) و (سوف).
// 3. قسم الحروف:
//    - حروف الجر: منوع بين المنفصلة (من/إلى/عن/على/في) والمتصلة (كـ/لـ/بـ).
//    - حروف العطف: الأربعة الثابتة (و - فـ - ثم - أو).
//    - الحروف الناسخة: منوعة بين (إنّ - أنّ - كأنّ - لكنّ - ليت - لعل).
//    - حروف نصب المضارع: الأربعة الثابتة (أنْ - لنْ - كَي - حتى) بدون لام التعليل.
// 4. قسم المهارات الإملائية:
//    - التنوين: تنويع بين (الفتح والضم والكسر) خالية من الشدة والمدود والهمزات.
//    - الشدة: تنويع بين أول/وسط/آخر الكلمة و(ـَّ، ـِّ، ـُّ) خالية من التنوين والمدود والهمزات.
//    - المدود: تنويع بين مد الألف والواو والياء خالية من التنوين والشدة والهمزات.
//    - الهمزات: تنويع بين همزة القطع والمتوسطة والمتطرفة خالية من التنوين والشدة والمدود.

export const WORD_BANK = {
  nouns: {
    tanween: {
      fath: [
      { id: 'n_tf_1', word: 'كِتَابًا', tashkeel: 'كِتَابًا', categoryId: 'tanween', explanation: 'اسم مفرد منون بتنوين الفتح (بدون أل وبدون تاء مربوطة وبدون تثنية أو جمع)' },
      { id: 'n_tf_2', word: 'قَلَمًا', tashkeel: 'قَلَمًا', categoryId: 'tanween', explanation: 'اسم مفرد منون بتنوين الفتح (بدون أل وبدون تاء مربوطة وبدون تثنية أو جمع)' },
      { id: 'n_tf_3', word: 'بَابًا', tashkeel: 'بَابًا', categoryId: 'tanween', explanation: 'اسم مفرد منون بتنوين الفتح (بدون أل وبدون تاء مربوطة وبدون تثنية أو جمع)' },
      { id: 'n_tf_4', word: 'نَهْرًا', tashkeel: 'نَهْرًا', categoryId: 'tanween', explanation: 'اسم مفرد منون بتنوين الفتح (بدون أل وبدون تاء مربوطة وبدون تثنية أو جمع)' },
      { id: 'n_tf_5', word: 'بَحْرًا', tashkeel: 'بَحْرًا', categoryId: 'tanween', explanation: 'اسم مفرد منون بتنوين الفتح (بدون أل وبدون تاء مربوطة وبدون تثنية أو جمع)' },
      { id: 'n_tf_6', word: 'جَبَلًا', tashkeel: 'جَبَلًا', categoryId: 'tanween', explanation: 'اسم مفرد منون بتنوين الفتح (بدون أل وبدون تاء مربوطة وبدون تثنية أو جمع)' },
      { id: 'n_tf_7', word: 'وَلَدًا', tashkeel: 'وَلَدًا', categoryId: 'tanween', explanation: 'اسم مفرد منون بتنوين الفتح (بدون أل وبدون تاء مربوطة وبدون تثنية أو جمع)' },
      { id: 'n_tf_8', word: 'بَلَدًا', tashkeel: 'بَلَدًا', categoryId: 'tanween', explanation: 'اسم مفرد منون بتنوين الفتح (بدون أل وبدون تاء مربوطة وبدون تثنية أو جمع)' },
      { id: 'n_tf_9', word: 'مَسْجِدًا', tashkeel: 'مَسْجِدًا', categoryId: 'tanween', explanation: 'اسم مفرد منون بتنوين الفتح (بدون أل وبدون تاء مربوطة وبدون تثنية أو جمع)' },
      { id: 'n_tf_10', word: 'صَوْتًا', tashkeel: 'صَوْتًا', categoryId: 'tanween', explanation: 'اسم مفرد منون بتنوين الفتح (بدون أل وبدون تاء مربوطة وبدون تثنية أو جمع)' }
      ],
      damm: [
      { id: 'n_td_1', word: 'قَلَمٌ', tashkeel: 'قَلَمٌ', categoryId: 'tanween', explanation: 'اسم مفرد منون بتنوين الضم علامة الاسمية (بدون أل وبدون تاء مربوطة وبدون جمع)' },
      { id: 'n_td_2', word: 'بَيْتٌ', tashkeel: 'بَيْتٌ', categoryId: 'tanween', explanation: 'اسم مفرد منون بتنوين الضم علامة الاسمية (بدون أل وبدون تاء مربوطة وبدون جمع)' },
      { id: 'n_td_3', word: 'قَمَرٌ', tashkeel: 'قَمَرٌ', categoryId: 'tanween', explanation: 'اسم مفرد منون بتنوين الضم علامة الاسمية (بدون أل وبدون تاء مربوطة وبدون جمع)' },
      { id: 'n_td_4', word: 'عَسَلٌ', tashkeel: 'عَسَلٌ', categoryId: 'tanween', explanation: 'اسم مفرد منون بتنوين الضم علامة الاسمية (بدون أل وبدون تاء مربوطة وبدون جمع)' },
      { id: 'n_td_5', word: 'سَيْفٌ', tashkeel: 'سَيْفٌ', categoryId: 'tanween', explanation: 'اسم مفرد منون بتنوين الضم علامة الاسمية (بدون أل وبدون تاء مربوطة وبدون جمع)' },
      { id: 'n_td_6', word: 'مَطَرٌ', tashkeel: 'مَطَرٌ', categoryId: 'tanween', explanation: 'اسم مفرد منون بتنوين الضم علامة الاسمية (بدون أل وبدون تاء مربوطة وبدون جمع)' },
      { id: 'n_td_7', word: 'حَبْلٌ', tashkeel: 'حَبْلٌ', categoryId: 'tanween', explanation: 'اسم مفرد منون بتنوين الضم علامة الاسمية (بدون أل وبدون تاء مربوطة وبدون جمع)' },
      { id: 'n_td_8', word: 'صَدْرٌ', tashkeel: 'صَدْرٌ', categoryId: 'tanween', explanation: 'اسم مفرد منون بتنوين الضم علامة الاسمية (بدون أل وبدون تاء مربوطة وبدون جمع)' },
      { id: 'n_td_9', word: 'قَصْرٌ', tashkeel: 'قَصْرٌ', categoryId: 'tanween', explanation: 'اسم مفرد منون بتنوين الضم علامة الاسمية (بدون أل وبدون تاء مربوطة وبدون جمع)' },
      { id: 'n_td_10', word: 'فَجْرٌ', tashkeel: 'فَجْرٌ', categoryId: 'tanween', explanation: 'اسم مفرد منون بتنوين الضم علامة الاسمية (بدون أل وبدون تاء مربوطة وبدون جمع)' }
      ],
      kasr: [
      { id: 'n_tk_1', word: 'حَجَرٍ', tashkeel: 'حَجَرٍ', categoryId: 'tanween', explanation: 'اسم مفرد منون بتنوين الكسر (بدون أل وبدون تاء مربوطة وبدون تثنية أو جمع)' },
      { id: 'n_tk_2', word: 'وَرَقٍ', tashkeel: 'وَرَقٍ', categoryId: 'tanween', explanation: 'اسم مفرد منون بتنوين الكسر (بدون أل وبدون تاء مربوطة وبدون تثنية أو جمع)' },
      { id: 'n_tk_3', word: 'شَجَرٍ', tashkeel: 'شَجَرٍ', categoryId: 'tanween', explanation: 'اسم مفرد منون بتنوين الكسر (بدون أل وبدون تاء مربوطة وبدون تثنية أو جمع)' },
      { id: 'n_tk_4', word: 'عِلْمٍ', tashkeel: 'عِلْمٍ', categoryId: 'tanween', explanation: 'اسم مفرد منون بتنوين الكسر (بدون أل وبدون تاء مربوطة وبدون تثنية أو جمع)' },
      { id: 'n_tk_5', word: 'نَصْرٍ', tashkeel: 'نَصْرٍ', categoryId: 'tanween', explanation: 'اسم مفرد منون بتنوين الكسر (بدون أل وبدون تاء مربوطة وبدون تثنية أو جمع)' },
      { id: 'n_tk_6', word: 'ضَوْءٍ', tashkeel: 'ضَوْءٍ', categoryId: 'tanween', explanation: 'اسم مفرد منون بتنوين الكسر (بدون أل وبدون تاء مربوطة وبدون تثنية أو جمع)' },
      { id: 'n_tk_7', word: 'صَبْرٍ', tashkeel: 'صَبْرٍ', categoryId: 'tanween', explanation: 'اسم مفرد منون بتنوين الكسر (بدون أل وبدون تاء مربوطة وبدون تثنية أو جمع)' },
      { id: 'n_tk_8', word: 'فِكْرٍ', tashkeel: 'فِكْرٍ', categoryId: 'tanween', explanation: 'اسم مفرد منون بتنوين الكسر (بدون أل وبدون تاء مربوطة وبدون تثنية أو جمع)' },
      { id: 'n_tk_9', word: 'دَرْبٍ', tashkeel: 'دَرْبٍ', categoryId: 'tanween', explanation: 'اسم مفرد منون بتنوين الكسر (بدون أل وبدون تاء مربوطة وبدون تثنية أو جمع)' },
      { id: 'n_tk_10', word: 'صَوْمٍ', tashkeel: 'صَوْمٍ', categoryId: 'tanween', explanation: 'اسم مفرد منون بتنوين الكسر (بدون أل وبدون تاء مربوطة وبدون تثنية أو جمع)' }
      ]
    },
    al_taareef: {
      al_standard: [
      { id: 'n_al_1', word: 'القَلَمُ', tashkeel: 'القَلَمُ', categoryId: 'al_taareef', explanation: 'اسم معرف بالـ التعريفية القياسية (بدون تنوين وبدون تاء مربوطة وبدون جمع)' },
      { id: 'n_al_2', word: 'الكِتَابُ', tashkeel: 'الكِتَابُ', categoryId: 'al_taareef', explanation: 'اسم معرف بالـ التعريفية القياسية (بدون تنوين وبدون تاء مربوطة وبدون جمع)' },
      { id: 'n_al_3', word: 'القَمَرُ', tashkeel: 'القَمَرُ', categoryId: 'al_taareef', explanation: 'اسم معرف بالـ التعريفية القياسية (بدون تنوين وبدون تاء مربوطة وبدون جمع)' },
      { id: 'n_al_4', word: 'البَابُ', tashkeel: 'البَابُ', categoryId: 'al_taareef', explanation: 'اسم معرف بالـ التعريفية القياسية (بدون تنوين وبدون تاء مربوطة وبدون جمع)' },
      { id: 'n_al_5', word: 'البَحْرُ', tashkeel: 'البَحْرُ', categoryId: 'al_taareef', explanation: 'اسم معرف بالـ التعريفية القياسية (بدون تنوين وبدون تاء مربوطة وبدون جمع)' },
      { id: 'n_al_6', word: 'الجَبَلُ', tashkeel: 'الجَبَلُ', categoryId: 'al_taareef', explanation: 'اسم معرف بالـ التعريفية القياسية (بدون تنوين وبدون تاء مربوطة وبدون جمع)' },
      { id: 'n_al_7', word: 'النَّهْرُ', tashkeel: 'النَّهْرُ', categoryId: 'al_taareef', explanation: 'اسم معرف بالـ التعريفية القياسية (بدون تنوين وبدون تاء مربوطة وبدون جمع)' },
      { id: 'n_al_8', word: 'الشَّمْسُ', tashkeel: 'الشَّمْسُ', categoryId: 'al_taareef', explanation: 'اسم معرف بالـ التعريفية القياسية (بدون تنوين وبدون تاء مربوطة وبدون جمع)' },
      { id: 'n_al_9', word: 'الوَلَدُ', tashkeel: 'الوَلَدُ', categoryId: 'al_taareef', explanation: 'اسم معرف بالـ التعريفية القياسية (بدون تنوين وبدون تاء مربوطة وبدون جمع)' },
      { id: 'n_al_10', word: 'البَيْتُ', tashkeel: 'البَيْتُ', categoryId: 'al_taareef', explanation: 'اسم معرف بالـ التعريفية القياسية (بدون تنوين وبدون تاء مربوطة وبدون جمع)' }
      ],
      al_hamza_qata: [
      { id: 'n_ah_1', word: 'الأَمَلُ', tashkeel: 'الأَمَلُ', categoryId: 'al_taareef', explanation: 'اسم معرف بالـ الداخلة على همزة قطع (الأ...) بدون تنوين ولا تاء مربوطة ولا جمع' },
      { id: 'n_ah_2', word: 'الأَدَبُ', tashkeel: 'الأَدَبُ', categoryId: 'al_taareef', explanation: 'اسم معرف بالـ الداخلة على همزة قطع (الأ...) بدون تنوين ولا تاء مربوطة ولا جمع' },
      { id: 'n_ah_3', word: 'الأَثَرُ', tashkeel: 'الأَثَرُ', categoryId: 'al_taareef', explanation: 'اسم معرف بالـ الداخلة على همزة قطع (الأ...) بدون تنوين ولا تاء مربوطة ولا جمع' },
      { id: 'n_ah_4', word: 'الأَفَقُ', tashkeel: 'الأَفَقُ', categoryId: 'al_taareef', explanation: 'اسم معرف بالـ الداخلة على همزة قطع (الأ...) بدون تنوين ولا تاء مربوطة ولا جمع' },
      { id: 'n_ah_5', word: 'الأَجَلُ', tashkeel: 'الأَجَلُ', categoryId: 'al_taareef', explanation: 'اسم معرف بالـ الداخلة على همزة قطع (الأ...) بدون تنوين ولا تاء مربوطة ولا جمع' },
      { id: 'n_ah_6', word: 'الأَسَدُ', tashkeel: 'الأَسَدُ', categoryId: 'al_taareef', explanation: 'اسم معرف بالـ الداخلة على همزة قطع (الأ...) بدون تنوين ولا تاء مربوطة ولا جمع' },
      { id: 'n_ah_7', word: 'الأَمْرُ', tashkeel: 'الأَمْرُ', categoryId: 'al_taareef', explanation: 'اسم معرف بالـ الداخلة على همزة قطع (الأ...) بدون تنوين ولا تاء مربوطة ولا جمع' },
      { id: 'n_ah_8', word: 'الأَجْرُ', tashkeel: 'الأَجْرُ', categoryId: 'al_taareef', explanation: 'اسم معرف بالـ الداخلة على همزة قطع (الأ...) بدون تنوين ولا تاء مربوطة ولا جمع' }
      ],
      al_hamza_wasl: [
      { id: 'n_aw_1', word: 'الاِسْمُ', tashkeel: 'الاِسْمُ', categoryId: 'al_taareef', explanation: 'اسم معرف بالـ الداخلة على همزة وصل مكسورة (الا...) بدون تنوين ولا تاء مربوطة' },
      { id: 'n_aw_2', word: 'الاِبْنُ', tashkeel: 'الاِبْنُ', categoryId: 'al_taareef', explanation: 'اسم معرف بالـ الداخلة على همزة وصل مكسورة (الا...) بدون تنوين ولا تاء مربوطة' },
      { id: 'n_aw_3', word: 'الاِثْنَانِ', tashkeel: 'الاِثْنَانِ', categoryId: 'al_taareef', explanation: 'اسم معرف بالـ الداخلة على همزة وصل (الاِ...) بدون تنوين ولا تاء مربوطة' },
      { id: 'n_aw_4', word: 'الاِمْتِحَانُ', tashkeel: 'الاِمْتِحَانُ', categoryId: 'al_taareef', explanation: 'اسم معرف بالـ الداخلة على مصدر همزة وصل (الاِ...) بدون تنوين ولا تاء مربوطة' },
      { id: 'n_aw_5', word: 'الاِبْتِسَامُ', tashkeel: 'الاِبْتِسَامُ', categoryId: 'al_taareef', explanation: 'اسم معرف بالـ الداخلة على مصدر همزة وصل (الاِ...) بدون تنوين ولا تاء مربوطة' },
      { id: 'n_aw_6', word: 'الاِجْتِهَادُ', tashkeel: 'الاِجْتِهَادُ', categoryId: 'al_taareef', explanation: 'اسم معرف بالـ الداخلة على مصدر همزة وصل (الاِ...) بدون تنوين ولا تاء مربوطة' },
      { id: 'n_aw_7', word: 'الاِحْتِرَامُ', tashkeel: 'الاِحْتِرَامُ', categoryId: 'al_taareef', explanation: 'اسم معرف بالـ الداخلة على مصدر همزة وصل (الاِ...) بدون تنوين ولا تاء مربوطة' },
      { id: 'n_aw_8', word: 'الاِعْتِمَادُ', tashkeel: 'الاِعْتِمَادُ', categoryId: 'al_taareef', explanation: 'اسم معرف بالـ الداخلة على مصدر همزة وصل (الاِ...) بدون تنوين ولا تاء مربوطة' }
      ]
    },
    taa_marbuta: {
      munfasila: [
      { id: 'n_tm_u_1', word: 'شَجَرَةُ', tashkeel: 'شَجَرَةُ', categoryId: 'taa_marbuta', explanation: 'اسم مفرد ينتهي بتاء مربوطة منفصلة (ة) بدون تنوين وبدون أل وبدون تثنية أو جمع' },
      { id: 'n_tm_u_2', word: 'زَهْرَةُ', tashkeel: 'زَهْرَةُ', categoryId: 'taa_marbuta', explanation: 'اسم مفرد ينتهي بتاء مربوطة منفصلة (ة) بدون تنوين وبدون أل وبدون تثنية أو جمع' },
      { id: 'n_tm_u_3', word: 'كُرَةُ', tashkeel: 'كُرَةُ', categoryId: 'taa_marbuta', explanation: 'اسم مفرد ينتهي بتاء مربوطة منفصلة (ة) بدون تنوين وبدون أل وبدون تثنية أو جمع' },
      { id: 'n_tm_u_4', word: 'دَوْرَةُ', tashkeel: 'دَوْرَةُ', categoryId: 'taa_marbuta', explanation: 'اسم مفرد ينتهي بتاء مربوطة منفصلة (ة) بدون تنوين وبدون أل وبدون تثنية أو جمع' },
      { id: 'n_tm_u_5', word: 'قُدْرَةُ', tashkeel: 'قُدْرَةُ', categoryId: 'taa_marbuta', explanation: 'اسم مفرد ينتهي بتاء مربوطة منفصلة (ة) بدون تنوين وبدون أل وبدون تثنية أو جمع' },
      { id: 'n_tm_u_6', word: 'فِكْرَةُ', tashkeel: 'فِكْرَةُ', categoryId: 'taa_marbuta', explanation: 'اسم مفرد ينتهي بتاء مربوطة منفصلة (ة) بدون تنوين وبدون أل وبدون تثنية أو جمع' },
      { id: 'n_tm_u_7', word: 'ثَمَرَةُ', tashkeel: 'ثَمَرَةُ', categoryId: 'taa_marbuta', explanation: 'اسم مفرد ينتهي بتاء مربوطة منفصلة (ة) بدون تنوين وبدون أل وبدون تثنية أو جمع' },
      { id: 'n_tm_u_8', word: 'نَظْرَةُ', tashkeel: 'نَظْرَةُ', categoryId: 'taa_marbuta', explanation: 'اسم مفرد ينتهي بتاء مربوطة منفصلة (ة) بدون تنوين وبدون أل وبدون تثنية أو جمع' },
      { id: 'n_tm_u_9', word: 'صُورَةُ', tashkeel: 'صُورَةُ', categoryId: 'taa_marbuta', explanation: 'اسم مفرد ينتهي بتاء مربوطة منفصلة (ة) بدون تنوين وبدون أل وبدون تثنية أو جمع' },
      { id: 'n_tm_u_10', word: 'بَصْمَةُ', tashkeel: 'بَصْمَةُ', categoryId: 'taa_marbuta', explanation: 'اسم مفرد ينتهي بتاء مربوطة منفصلة (ة) بدون تنوين وبدون أل وبدون تثنية أو جمع' }
      ],
      muttasila: [
      { id: 'n_tm_t_1', word: 'مَدْرَسَةُ', tashkeel: 'مَدْرَسَةُ', categoryId: 'taa_marbuta', explanation: 'اسم مفرد ينتهي بتاء مربوطة متصلة (ـة) بدون تنوين وبدون أل وبدون تثنية أو جمع' },
      { id: 'n_tm_t_2', word: 'حَدِيقَةُ', tashkeel: 'حَدِيقَةُ', categoryId: 'taa_marbuta', explanation: 'اسم مفرد ينتهي بتاء مربوطة متصلة (ـة) بدون تنوين وبدون أل وبدون تثنية أو جمع' },
      { id: 'n_tm_t_3', word: 'غُرْفَةُ', tashkeel: 'غُرْفَةُ', categoryId: 'taa_marbuta', explanation: 'اسم مفرد ينتهي بتاء مربوطة متصلة (ـة) بدون تنوين وبدون أل وبدون تثنية أو جمع' },
      { id: 'n_tm_t_4', word: 'لَوْحَةُ', tashkeel: 'لَوْحَةُ', categoryId: 'taa_marbuta', explanation: 'اسم مفرد ينتهي بتاء مربوطة متصلة (ـة) بدون تنوين وبدون أل وبدون تثنية أو جمع' },
      { id: 'n_tm_t_5', word: 'سَلَّةُ', tashkeel: 'سَلَّةُ', categoryId: 'taa_marbuta', explanation: 'اسم مفرد ينتهي بتاء مربوطة متصلة (ـة) بدون تنوين وبدون أل وبدون تثنية أو جمع' },
      { id: 'n_tm_t_6', word: 'قَلْعَةُ', tashkeel: 'قَلْعَةُ', categoryId: 'taa_marbuta', explanation: 'اسم مفرد ينتهي بتاء مربوطة متصلة (ـة) بدون تنوين وبدون أل وبدون تثنية أو جمع' },
      { id: 'n_tm_t_7', word: 'مَكْتَبَةُ', tashkeel: 'مَكْتَبَةُ', categoryId: 'taa_marbuta', explanation: 'اسم مفرد ينتهي بتاء مربوطة متصلة (ـة) بدون تنوين وبدون أل وبدون تثنية أو جمع' },
      { id: 'n_tm_t_8', word: 'حَقِيبَةُ', tashkeel: 'حَقِيبَةُ', categoryId: 'taa_marbuta', explanation: 'اسم مفرد ينتهي بتاء مربوطة متصلة (ـة) بدون تنوين وبدون أل وبدون تثنية أو جمع' },
      { id: 'n_tm_t_9', word: 'نَافِذَةُ', tashkeel: 'نَافِذَةُ', categoryId: 'taa_marbuta', explanation: 'اسم مفرد ينتهي بتاء مربوطة متصلة (ـة) بدون تنوين وبدون أل وبدون تثنية أو جمع' },
      { id: 'n_tm_t_10', word: 'سَاعَةُ', tashkeel: 'سَاعَةُ', categoryId: 'taa_marbuta', explanation: 'اسم مفرد ينتهي بتاء مربوطة متصلة (ـة) بدون تنوين وبدون أل وبدون تثنية أو جمع' }
      ]
    },
    muthanna_jam: {
      muthanna: [
      { id: 'n_m_1', word: 'طَالِبَانِ', tashkeel: 'طَالِبَانِ', categoryId: 'muthanna_jam', explanation: 'اسم مثنى ينتهي بألف ونون (بدون تنوين وبدون تاء مربوطة وبدون أل)' },
      { id: 'n_m_2', word: 'قَلَمَانِ', tashkeel: 'قَلَمَانِ', categoryId: 'muthanna_jam', explanation: 'اسم مثنى ينتهي بألف ونون (بدون تنوين وبدون تاء مربوطة وبدون أل)' },
      { id: 'n_m_3', word: 'كِتَابَانِ', tashkeel: 'كِتَابَانِ', categoryId: 'muthanna_jam', explanation: 'اسم مثنى ينتهي بألف ونون (بدون تنوين وبدون تاء مربوطة وبدون أل)' },
      { id: 'n_m_4', word: 'وَلَدَانِ', tashkeel: 'وَلَدَانِ', categoryId: 'muthanna_jam', explanation: 'اسم مثنى ينتهي بألف ونون (بدون تنوين وبدون تاء مربوطة وبدون أل)' },
      { id: 'n_m_5', word: 'نَهْرَانِ', tashkeel: 'نَهْرَانِ', categoryId: 'muthanna_jam', explanation: 'اسم مثنى ينتهي بألف ونون (بدون تنوين وبدون تاء مربوطة وبدون أل)' },
      { id: 'n_m_6', word: 'جَبَلَانِ', tashkeel: 'جَبَلَانِ', categoryId: 'muthanna_jam', explanation: 'اسم مثنى ينتهي بألف ونون (بدون تنوين وبدون تاء مربوطة وبدون أل)' },
      { id: 'n_m_7', word: 'بَابَانِ', tashkeel: 'بَابَانِ', categoryId: 'muthanna_jam', explanation: 'اسم مثنى ينتهي بألف ونون (بدون تنوين وبدون تاء مربوطة وبدون أل)' },
      { id: 'n_m_8', word: 'بَيْتَانِ', tashkeel: 'بَيْتَانِ', categoryId: 'muthanna_jam', explanation: 'اسم مثنى ينتهي بألف ونون (بدون تنوين وبدون تاء مربوطة وبدون أل)' },
      { id: 'n_m_9', word: 'طَرِيقَانِ', tashkeel: 'طَرِيقَانِ', categoryId: 'muthanna_jam', explanation: 'اسم مثنى ينتهي بألف ونون (بدون تنوين وبدون تاء مربوطة وبدون أل)' },
      { id: 'n_m_10', word: 'رَجُلَانِ', tashkeel: 'رَجُلَانِ', categoryId: 'muthanna_jam', explanation: 'اسم مثنى ينتهي بألف ونون (بدون تنوين وبدون تاء مربوطة وبدون أل)' }
      ],
      jam_mudhakkar: [
      { id: 'n_jmd_1', word: 'مُعَلِّمُونَ', tashkeel: 'مُعَلِّمُونَ', categoryId: 'muthanna_jam', explanation: 'جمع مذكر سالم ينتهي بواو ونون (بدون تنوين وبدون تاء مربوطة وبدون أل)' },
      { id: 'n_jmd_2', word: 'مُهَنْدِسُونَ', tashkeel: 'مُهَنْدِسُونَ', categoryId: 'muthanna_jam', explanation: 'جمع مذكر سالم ينتهي بواو ونون (بدون تنوين وبدون تاء مربوطة وبدون أل)' },
      { id: 'n_jmd_3', word: 'كَاتِبُونَ', tashkeel: 'كَاتِبُونَ', categoryId: 'muthanna_jam', explanation: 'جمع مذكر سالم ينتهي بواو ونون (بدون تنوين وبدون تاء مربوطة وبدون أل)' },
      { id: 'n_jmd_4', word: 'صَابِرُونَ', tashkeel: 'صَابِرُونَ', categoryId: 'muthanna_jam', explanation: 'جمع مذكر سالم ينتهي بواو ونون (بدون تنوين وبدون تاء مربوطة وبدون أل)' },
      { id: 'n_jmd_5', word: 'رَسَّامُونَ', tashkeel: 'رَسَّامُونَ', categoryId: 'muthanna_jam', explanation: 'جمع مذكر سالم ينتهي بواو ونون (بدون تنوين وبدون تاء مربوطة وبدون أل)' },
      { id: 'n_jmd_6', word: 'مُجْتَهِدُونَ', tashkeel: 'مُجْتَهِدُونَ', categoryId: 'muthanna_jam', explanation: 'جمع مذكر سالم ينتهي بواو ونون (بدون تنوين وبدون تاء مربوطة وبدون أل)' },
      { id: 'n_jmd_7', word: 'مُسْلِمُونَ', tashkeel: 'مُسْلِمُونَ', categoryId: 'muthanna_jam', explanation: 'جمع مذكر سالم ينتهي بواو ونون (بدون تنوين وبدون تاء مربوطة وبدون أل)' },
      { id: 'n_jmd_8', word: 'فَائِزُونَ', tashkeel: 'فَائِزُونَ', categoryId: 'muthanna_jam', explanation: 'جمع مذكر سالم ينتهي بواو ونون (بدون تنوين وبدون تاء مربوطة وبدون أل)' },
      { id: 'n_jmd_9', word: 'مُتَفَوِّقُونَ', tashkeel: 'مُتَفَوِّقُونَ', categoryId: 'muthanna_jam', explanation: 'جمع مذكر سالم ينتهي بواو ونون (بدون تنوين وبدون تاء مربوطة وبدون أل)' },
      { id: 'n_jmd_10', word: 'عَامِلُونَ', tashkeel: 'عَامِلُونَ', categoryId: 'muthanna_jam', explanation: 'جمع مذكر سالم ينتهي بواو ونون (بدون تنوين وبدون تاء مربوطة وبدون أل)' }
      ],
      jam_muannath: [
      { id: 'n_jmn_1', word: 'مُعَلِّمَاتُ', tashkeel: 'مُعَلِّمَاتُ', categoryId: 'muthanna_jam', explanation: 'جمع مؤنث سالم ينتهي بألف وتاء مبسوطة (بدون تنوين وبدون تاء مربوطة وبدون أل)' },
      { id: 'n_jmn_2', word: 'رَسَّامَاتُ', tashkeel: 'رَسَّامَاتُ', categoryId: 'muthanna_jam', explanation: 'جمع مؤنث سالم ينتهي بألف وتاء مبسوطة (بدون تنوين وبدون تاء مربوطة وبدون أل)' },
      { id: 'n_jmn_3', word: 'مُمَرِّضَاتُ', tashkeel: 'مُمَرِّضَاتُ', categoryId: 'muthanna_jam', explanation: 'جمع مؤنث سالم ينتهي بألف وتاء مبسوطة (بدون تنوين وبدون تاء مربوطة وبدون أل)' },
      { id: 'n_jmn_4', word: 'كَاتِبَاتُ', tashkeel: 'كَاتِبَاتُ', categoryId: 'muthanna_jam', explanation: 'جمع مؤنث سالم ينتهي بألف وتاء مبسوطة (بدون تنوين وبدون تاء مربوطة وبدون أل)' },
      { id: 'n_jmn_5', word: 'سَاحَاتُ', tashkeel: 'سَاحَاتُ', categoryId: 'muthanna_jam', explanation: 'جمع مؤنث سالم ينتهي بألف وتاء مبسوطة (بدون تنوين وبدون تاء مربوطة وبدون أل)' },
      { id: 'n_jmn_6', word: 'طَالِبَاتُ', tashkeel: 'طَالِبَاتُ', categoryId: 'muthanna_jam', explanation: 'جمع مؤنث سالم ينتهي بألف وتاء مبسوطة (بدون تنوين وبدون تاء مربوطة وبدون أل)' },
      { id: 'n_jmn_7', word: 'مُهَنْدِسَاتُ', tashkeel: 'مُهَنْدِسَاتُ', categoryId: 'muthanna_jam', explanation: 'جمع مؤنث سالم ينتهي بألف وتاء مبسوطة (بدون تنوين وبدون تاء مربوطة وبدون أل)' },
      { id: 'n_jmn_8', word: 'حَافِلَاتُ', tashkeel: 'حَافِلَاتُ', categoryId: 'muthanna_jam', explanation: 'جمع مؤنث سالم ينتهي بألف وتاء مبسوطة (بدون تنوين وبدون تاء مربوطة وبدون أل)' },
      { id: 'n_jmn_9', word: 'نَجَاحَاتُ', tashkeel: 'نَجَاحَاتُ', categoryId: 'muthanna_jam', explanation: 'جمع مؤنث سالم ينتهي بألف وتاء مبسوطة (بدون تنوين وبدون تاء مربوطة وبدون أل)' },
      { id: 'n_jmn_10', word: 'لَوْحَاتُ', tashkeel: 'لَوْحَاتُ', categoryId: 'muthanna_jam', explanation: 'جمع مؤنث سالم ينتهي بألف وتاء مبسوطة (بدون تنوين وبدون تاء مربوطة وبدون أل)' }
      ],
      jam_taksir: [
      { id: 'n_jt_1', word: 'كُتُبُ', tashkeel: 'كُتُبُ', categoryId: 'muthanna_jam', explanation: 'جمع تكسير تغير فيه بناء المفرد (بدون تنوين وبدون تاء مربوطة وبدون أل)' },
      { id: 'n_jt_2', word: 'أَقْلَامُ', tashkeel: 'أَقْلَامُ', categoryId: 'muthanna_jam', explanation: 'جمع تكسير تغير فيه بناء المفرد (بدون تنوين وبدون تاء مربوطة وبدون أل)' },
      { id: 'n_jt_3', word: 'رِجَالُ', tashkeel: 'رِجَالُ', categoryId: 'muthanna_jam', explanation: 'جمع تكسير تغير فيه بناء المفرد (بدون تنوين وبدون تاء مربوطة وبدون أل)' },
      { id: 'n_jt_4', word: 'عُلَمَاءُ', tashkeel: 'عُلَمَاءُ', categoryId: 'muthanna_jam', explanation: 'جمع تكسير تغير فيه بناء المفرد (بدون تنوين وبدون تاء مربوطة وبدون أل)' },
      { id: 'n_jt_5', word: 'أَبْوَابُ', tashkeel: 'أَبْوَابُ', categoryId: 'muthanna_jam', explanation: 'جمع تكسير تغير فيه بناء المفرد (بدون تنوين وبدون تاء مربوطة وبدون أل)' },
      { id: 'n_jt_6', word: 'أَنْهَارُ', tashkeel: 'أَنْهَارُ', categoryId: 'muthanna_jam', explanation: 'جمع تكسير تغير فيه بناء المفرد (بدون تنوين وبدون تاء مربوطة وبدون أل)' },
      { id: 'n_jt_7', word: 'جِبَالُ', tashkeel: 'جِبَالُ', categoryId: 'muthanna_jam', explanation: 'جمع تكسير تغير فيه بناء المفرد (بدون تنوين وبدون تاء مربوطة وبدون أل)' },
      { id: 'n_jt_8', word: 'بُيُوتُ', tashkeel: 'بُيُوتُ', categoryId: 'muthanna_jam', explanation: 'جمع تكسير تغير فيه بناء المفرد (بدون تنوين وبدون تاء مربوطة وبدون أل)' },
      { id: 'n_jt_9', word: 'أَوْلَادُ', tashkeel: 'أَوْلَادُ', categoryId: 'muthanna_jam', explanation: 'جمع تكسير تغير فيه بناء المفرد (بدون تنوين وبدون تاء مربوطة وبدون أل)' },
      { id: 'n_jt_10', word: 'أَسْوَارُ', tashkeel: 'أَسْوَارُ', categoryId: 'muthanna_jam', explanation: 'جمع تكسير تغير فيه بناء المفرد (بدون تنوين وبدون تاء مربوطة وبدون أل)' }
      ]
    }
  },
  verbs: {
    past: {
      mufrad_mudhakkar: [
      { id: 'v_pm_1', word: 'جَلَسَ', tashkeel: 'جَلَسَ', categoryId: 'past', explanation: 'فعل ماضٍ للمفرد المذكر مبني على الفتح' },
      { id: 'v_pm_2', word: 'كَتَبَ', tashkeel: 'كَتَبَ', categoryId: 'past', explanation: 'فعل ماضٍ للمفرد المذكر مبني على الفتح' },
      { id: 'v_pm_3', word: 'دَخَلَ', tashkeel: 'دَخَلَ', categoryId: 'past', explanation: 'فعل ماضٍ للمفرد المذكر مبني على الفتح' },
      { id: 'v_pm_4', word: 'شَرِبَ', tashkeel: 'شَرِبَ', categoryId: 'past', explanation: 'فعل ماضٍ للمفرد المذكر مبني على الفتح' },
      { id: 'v_pm_5', word: 'صَعِدَ', tashkeel: 'صَعِدَ', categoryId: 'past', explanation: 'فعل ماضٍ للمفرد المذكر مبني على الفتح' },
      { id: 'v_pm_6', word: 'فَتَحَ', tashkeel: 'فَتَحَ', categoryId: 'past', explanation: 'فعل ماضٍ للمفرد المذكر مبني على الفتح' },
      { id: 'v_pm_7', word: 'رَسَمَ', tashkeel: 'رَسَمَ', categoryId: 'past', explanation: 'فعل ماضٍ للمفرد المذكر مبني على الفتح' },
      { id: 'v_pm_8', word: 'عَلِمَ', tashkeel: 'عَلِمَ', categoryId: 'past', explanation: 'فعل ماضٍ للمفرد المذكر مبني على الفتح' }
      ],
      naa_faileen: [
      { id: 'v_pn_1', word: 'سَمِعْنَا', tashkeel: 'سَمِعْنَا', categoryId: 'past', explanation: 'فعل ماضٍ متصل بـ (نا) الفاعلين' },
      { id: 'v_pn_2', word: 'فَهِمْنَا', tashkeel: 'فَهِمْنَا', categoryId: 'past', explanation: 'فعل ماضٍ متصل بـ (نا) الفاعلين' },
      { id: 'v_pn_3', word: 'حَفِظْنَا', tashkeel: 'حَفِظْنَا', categoryId: 'past', explanation: 'فعل ماضٍ متصل بـ (نا) الفاعلين' },
      { id: 'v_pn_4', word: 'رَسَمْنَا', tashkeel: 'رَسَمْنَا', categoryId: 'past', explanation: 'فعل ماضٍ متصل بـ (نا) الفاعلين' },
      { id: 'v_pn_5', word: 'شَكَرْنَا', tashkeel: 'شَكَرْنَا', categoryId: 'past', explanation: 'فعل ماضٍ متصل بـ (نا) الفاعلين' },
      { id: 'v_pn_6', word: 'نَجَحْنَا', tashkeel: 'نَجَحْنَا', categoryId: 'past', explanation: 'فعل ماضٍ متصل بـ (نا) الفاعلين' },
      { id: 'v_pn_7', word: 'عَرَفْنَا', tashkeel: 'عَرَفْنَا', categoryId: 'past', explanation: 'فعل ماضٍ متصل بـ (نا) الفاعلين' },
      { id: 'v_pn_8', word: 'وَصَلْنَا', tashkeel: 'وَصَلْنَا', categoryId: 'past', explanation: 'فعل ماضٍ متصل بـ (نا) الفاعلين' }
      ],
      taa_tanith: [
      { id: 'v_pt_1', word: 'نَامَتْ', tashkeel: 'نَامَتْ', categoryId: 'past', explanation: 'فعل ماضٍ متصل بتاء التأنيث الساكنة' },
      { id: 'v_pt_2', word: 'قَرَأَتْ', tashkeel: 'قَرَأَتْ', categoryId: 'past', explanation: 'فعل ماضٍ متصل بتاء التأنيث الساكنة' },
      { id: 'v_pt_3', word: 'ذَهَبَتْ', tashkeel: 'ذَهَبَتْ', categoryId: 'past', explanation: 'فعل ماضٍ متصل بتاء التأنيث الساكنة' },
      { id: 'v_pt_4', word: 'نَجَحَتْ', tashkeel: 'نَجَحَتْ', categoryId: 'past', explanation: 'فعل ماضٍ متصل بتاء التأنيث الساكنة' },
      { id: 'v_pt_5', word: 'شَرِبَتْ', tashkeel: 'شَرِبَتْ', categoryId: 'past', explanation: 'فعل ماضٍ متصل بتاء التأنيث الساكنة' },
      { id: 'v_pt_6', word: 'حَفِظَتْ', tashkeel: 'حَفِظَتْ', categoryId: 'past', explanation: 'فعل ماضٍ متصل بتاء التأنيث الساكنة' },
      { id: 'v_pt_7', word: 'دَخَلَتْ', tashkeel: 'دَخَلَتْ', categoryId: 'past', explanation: 'فعل ماضٍ متصل بتاء التأنيث الساكنة' },
      { id: 'v_pt_8', word: 'فَرِحَتْ', tashkeel: 'فَرِحَتْ', categoryId: 'past', explanation: 'فعل ماضٍ متصل بتاء التأنيث الساكنة' }
      ],
      tum_mukhatab: [
      { id: 'v_pu_1', word: 'كَتَبْتُمْ', tashkeel: 'كَتَبْتُمْ', categoryId: 'past', explanation: 'فعل ماضٍ متصل بضمير المخاطبين (تُمْ)' },
      { id: 'v_pu_2', word: 'جَلَسْتُمْ', tashkeel: 'جَلَسْتُمْ', categoryId: 'past', explanation: 'فعل ماضٍ متصل بضمير المخاطبين (تُمْ)' },
      { id: 'v_pu_3', word: 'دَخَلْتُمْ', tashkeel: 'دَخَلْتُمْ', categoryId: 'past', explanation: 'فعل ماضٍ متصل بضمير المخاطبين (تُمْ)' },
      { id: 'v_pu_4', word: 'فَهِمْتُمْ', tashkeel: 'فَهِمْتُمْ', categoryId: 'past', explanation: 'فعل ماضٍ متصل بضمير المخاطبين (تُمْ)' },
      { id: 'v_pu_5', word: 'سَمِعْتُمْ', tashkeel: 'سَمِعْتُمْ', categoryId: 'past', explanation: 'فعل ماضٍ متصل بضمير المخاطبين (تُمْ)' },
      { id: 'v_pu_6', word: 'نَجَحْتُمْ', tashkeel: 'نَجَحْتُمْ', categoryId: 'past', explanation: 'فعل ماضٍ متصل بضمير المخاطبين (تُمْ)' },
      { id: 'v_pu_7', word: 'حَفِظْتُمْ', tashkeel: 'حَفِظْتُمْ', categoryId: 'past', explanation: 'فعل ماضٍ متصل بضمير المخاطبين (تُمْ)' },
      { id: 'v_pu_8', word: 'شَكَرْتُمْ', tashkeel: 'شَكَرْتُمْ', categoryId: 'past', explanation: 'فعل ماضٍ متصل بضمير المخاطبين (تُمْ)' }
      ]
    },
    present: {
      alif: [
      { id: 'v_pra_1', word: 'أَقْرَأُ', tashkeel: 'أَقْرَأُ', categoryId: 'present', explanation: 'فعل مضارع مبدوء بهمزة المتكلم (أ)' },
      { id: 'v_pra_2', word: 'أَكْتُبُ', tashkeel: 'أَكْتُبُ', categoryId: 'present', explanation: 'فعل مضارع مبدوء بهمزة المتكلم (أ)' },
      { id: 'v_pra_3', word: 'أَسْمَعُ', tashkeel: 'أَسْمَعُ', categoryId: 'present', explanation: 'فعل مضارع مبدوء بهمزة المتكلم (أ)' },
      { id: 'v_pra_4', word: 'أَفْهَمُ', tashkeel: 'أَفْهَمُ', categoryId: 'present', explanation: 'فعل مضارع مبدوء بهمزة المتكلم (أ)' },
      { id: 'v_pra_5', word: 'أَرْسُمُ', tashkeel: 'أَرْسُمُ', categoryId: 'present', explanation: 'فعل مضارع مبدوء بهمزة المتكلم (أ)' },
      { id: 'v_pra_6', word: 'أَشْرَبُ', tashkeel: 'أَشْرَبُ', categoryId: 'present', explanation: 'فعل مضارع مبدوء بهمزة المتكلم (أ)' },
      { id: 'v_pra_7', word: 'أَذْهَبُ', tashkeel: 'أَذْهَبُ', categoryId: 'present', explanation: 'فعل مضارع مبدوء بهمزة المتكلم (أ)' },
      { id: 'v_pra_8', word: 'أَحْفَظُ', tashkeel: 'أَحْفَظُ', categoryId: 'present', explanation: 'فعل مضارع مبدوء بهمزة المتكلم (أ)' }
      ],
      noon: [
      { id: 'v_prn_1', word: 'نَقْرَأُ', tashkeel: 'نَقْرَأُ', categoryId: 'present', explanation: 'فعل مضارع مبدوء بنون المتكلمين (نـ)' },
      { id: 'v_prn_2', word: 'نَكْتُبُ', tashkeel: 'نَكْتُبُ', categoryId: 'present', explanation: 'فعل مضارع مبدوء بنون المتكلمين (نـ)' },
      { id: 'v_prn_3', word: 'نَسْمَعُ', tashkeel: 'نَسْمَعُ', categoryId: 'present', explanation: 'فعل مضارع مبدوء بنون المتكلمين (نـ)' },
      { id: 'v_prn_4', word: 'نَفْهَمُ', tashkeel: 'نَفْهَمُ', categoryId: 'present', explanation: 'فعل مضارع مبدوء بنون المتكلمين (نـ)' },
      { id: 'v_prn_5', word: 'نَرْسُمُ', tashkeel: 'نَرْسُمُ', categoryId: 'present', explanation: 'فعل مضارع مبدوء بنون المتكلمين (نـ)' },
      { id: 'v_prn_6', word: 'نَشْرَبُ', tashkeel: 'نَشْرَبُ', categoryId: 'present', explanation: 'فعل مضارع مبدوء بنون المتكلمين (نـ)' },
      { id: 'v_prn_7', word: 'نَنْجَحُ', tashkeel: 'نَنْجَحُ', categoryId: 'present', explanation: 'فعل مضارع مبدوء بنون المتكلمين (نـ)' },
      { id: 'v_prn_8', word: 'نَفْرَحُ', tashkeel: 'نَفْرَحُ', categoryId: 'present', explanation: 'فعل مضارع مبدوء بنون المتكلمين (نـ)' }
      ],
      yaa: [
      { id: 'v_pry_1', word: 'يَقْرَأُ', tashkeel: 'يَقْرَأُ', categoryId: 'present', explanation: 'فعل مضارع مبدوء بياء الغائب (يـ)' },
      { id: 'v_pry_2', word: 'يَكْتُبُ', tashkeel: 'يَكْتُبُ', categoryId: 'present', explanation: 'فعل مضارع مبدوء بياء الغائب (يـ)' },
      { id: 'v_pry_3', word: 'يَسْمَعُ', tashkeel: 'يَسْمَعُ', categoryId: 'present', explanation: 'فعل مضارع مبدوء بياء الغائب (يـ)' },
      { id: 'v_pry_4', word: 'يَفْهَمُ', tashkeel: 'يَفْهَمُ', categoryId: 'present', explanation: 'فعل مضارع مبدوء بياء الغائب (يـ)' },
      { id: 'v_pry_5', word: 'يَرْسُمُ', tashkeel: 'يَرْسُمُ', categoryId: 'present', explanation: 'فعل مضارع مبدوء بياء الغائب (يـ)' },
      { id: 'v_pry_6', word: 'يَشْرَبُ', tashkeel: 'يَشْرَبُ', categoryId: 'present', explanation: 'فعل مضارع مبدوء بياء الغائب (يـ)' },
      { id: 'v_pry_7', word: 'يَنْجَحُ', tashkeel: 'يَنْجَحُ', categoryId: 'present', explanation: 'فعل مضارع مبدوء بياء الغائب (يـ)' },
      { id: 'v_pry_8', word: 'يَجْلِسُ', tashkeel: 'يَجْلِسُ', categoryId: 'present', explanation: 'فعل مضارع مبدوء بياء الغائب (يـ)' }
      ],
      taa: [
      { id: 'v_prt_1', word: 'تَقْرَأُ', tashkeel: 'تَقْرَأُ', categoryId: 'present', explanation: 'فعل مضارع مبدوء بتاء المخاطب أو الغائبة (تـ)' },
      { id: 'v_prt_2', word: 'تَكْتُبُ', tashkeel: 'تَكْتُبُ', categoryId: 'present', explanation: 'فعل مضارع مبدوء بتاء المخاطب أو الغائبة (تـ)' },
      { id: 'v_prt_3', word: 'تَسْمَعُ', tashkeel: 'تَسْمَعُ', categoryId: 'present', explanation: 'فعل مضارع مبدوء بتاء المخاطب أو الغائبة (تـ)' },
      { id: 'v_prt_4', word: 'تَفْهَمُ', tashkeel: 'تَفْهَمُ', categoryId: 'present', explanation: 'فعل مضارع مبدوء بتاء المخاطب أو الغائبة (تـ)' },
      { id: 'v_prt_5', word: 'تَرْسُمُ', tashkeel: 'تَرْسُمُ', categoryId: 'present', explanation: 'فعل مضارع مبدوء بتاء المخاطب أو الغائبة (تـ)' },
      { id: 'v_prt_6', word: 'تَشْرَبُ', tashkeel: 'تَشْرَبُ', categoryId: 'present', explanation: 'فعل مضارع مبدوء بتاء المخاطب أو الغائبة (تـ)' },
      { id: 'v_prt_7', word: 'تَنْجَحُ', tashkeel: 'تَنْجَحُ', categoryId: 'present', explanation: 'فعل مضارع مبدوء بتاء المخاطب أو الغائبة (تـ)' },
      { id: 'v_prt_8', word: 'تَفْرَحُ', tashkeel: 'تَفْرَحُ', categoryId: 'present', explanation: 'فعل مضارع مبدوء بتاء المخاطب أو الغائبة (تـ)' }
      ]
    },
    imperative: {
      mufrad: [
      { id: 'v_im_1', word: 'اقْرَأْ', tashkeel: 'اقْرَأْ', categoryId: 'imperative', explanation: 'فعل أمر للمفرد المذكر مبني على السكون' },
      { id: 'v_im_2', word: 'اكْتُبْ', tashkeel: 'اكْتُبْ', categoryId: 'imperative', explanation: 'فعل أمر للمفرد المذكر مبني على السكون' },
      { id: 'v_im_3', word: 'اجْلِسْ', tashkeel: 'اجْلِسْ', categoryId: 'imperative', explanation: 'فعل أمر للمفرد المذكر مبني على السكون' },
      { id: 'v_im_4', word: 'افْهَمْ', tashkeel: 'افْهَمْ', categoryId: 'imperative', explanation: 'فعل أمر للمفرد المذكر مبني على السكون' },
      { id: 'v_im_5', word: 'اسْمَعْ', tashkeel: 'اسْمَعْ', categoryId: 'imperative', explanation: 'فعل أمر للمفرد المذكر مبني على السكون' },
      { id: 'v_im_6', word: 'اشْرَبْ', tashkeel: 'اشْرَبْ', categoryId: 'imperative', explanation: 'فعل أمر للمفرد المذكر مبني على السكون' },
      { id: 'v_im_7', word: 'انْظُرْ', tashkeel: 'انْظُرْ', categoryId: 'imperative', explanation: 'فعل أمر للمفرد المذكر مبني على السكون' },
      { id: 'v_im_8', word: 'احْفَظْ', tashkeel: 'احْفَظْ', categoryId: 'imperative', explanation: 'فعل أمر للمفرد المذكر مبني على السكون' }
      ],
      mukhātiba: [
      { id: 'v_ik_1', word: 'ادْخُلِي', tashkeel: 'ادْخُلِي', categoryId: 'imperative', explanation: 'فعل أمر للمفردة المؤنثة متصل بياء المخاطبة' },
      { id: 'v_ik_2', word: 'اقْرَئِي', tashkeel: 'اقْرَئِي', categoryId: 'imperative', explanation: 'فعل أمر للمفردة المؤنثة متصل بياء المخاطبة' },
      { id: 'v_ik_3', word: 'اكْتُبِي', tashkeel: 'اكْتُبِي', categoryId: 'imperative', explanation: 'فعل أمر للمفردة المؤنثة متصل بياء المخاطبة' },
      { id: 'v_ik_4', word: 'اسْمَعِي', tashkeel: 'اسْمَعِي', categoryId: 'imperative', explanation: 'فعل أمر للمفردة المؤنثة متصل بياء المخاطبة' },
      { id: 'v_ik_5', word: 'اجْلِسِي', tashkeel: 'اجْلِسِي', categoryId: 'imperative', explanation: 'فعل أمر للمفردة المؤنثة متصل بياء المخاطبة' },
      { id: 'v_ik_6', word: 'اشْرَبِي', tashkeel: 'اشْرَبِي', categoryId: 'imperative', explanation: 'فعل أمر للمفردة المؤنثة متصل بياء المخاطبة' },
      { id: 'v_ik_7', word: 'انْظُرِي', tashkeel: 'انْظُرِي', categoryId: 'imperative', explanation: 'فعل أمر للمفردة المؤنثة متصل بياء المخاطبة' },
      { id: 'v_ik_8', word: 'احْفَظِي', tashkeel: 'احْفَظِي', categoryId: 'imperative', explanation: 'فعل أمر للمفردة المؤنثة متصل بياء المخاطبة' }
      ],
      waw_jamaa: [
      { id: 'v_iw_1', word: 'نَامُوا', tashkeel: 'نَامُوا', categoryId: 'imperative', explanation: 'فعل أمر لجماعة الذكور متصل بواو الجماعة' },
      { id: 'v_iw_2', word: 'اقْرَؤُوا', tashkeel: 'اقْرَؤُوا', categoryId: 'imperative', explanation: 'فعل أمر لجماعة الذكور متصل بواو الجماعة' },
      { id: 'v_iw_3', word: 'اكْتُبُوا', tashkeel: 'اكْتُبُوا', categoryId: 'imperative', explanation: 'فعل أمر لجماعة الذكور متصل بواو الجماعة' },
      { id: 'v_iw_4', word: 'اجْلِسُوا', tashkeel: 'اجْلِسُوا', categoryId: 'imperative', explanation: 'فعل أمر لجماعة الذكور متصل بواو الجماعة' },
      { id: 'v_iw_5', word: 'اسْمَعُوا', tashkeel: 'اسْمَعُوا', categoryId: 'imperative', explanation: 'فعل أمر لجماعة الذكور متصل بواو الجماعة' },
      { id: 'v_iw_6', word: 'ادْخُلُوا', tashkeel: 'ادْخُلُوا', categoryId: 'imperative', explanation: 'فعل أمر لجماعة الذكور متصل بواو الجماعة' },
      { id: 'v_iw_7', word: 'افْهَمُوا', tashkeel: 'افْهَمُوا', categoryId: 'imperative', explanation: 'فعل أمر لجماعة الذكور متصل بواو الجماعة' },
      { id: 'v_iw_8', word: 'انْظُرُوا', tashkeel: 'انْظُرُوا', categoryId: 'imperative', explanation: 'فعل أمر لجماعة الذكور متصل بواو الجماعة' }
      ],
      mahthoof: [
      { id: 'v_iz_1', word: 'كُلْ', tashkeel: 'كُلْ', categoryId: 'imperative', explanation: 'فعل أمر محذوف الفاء مبني على السكون' },
      { id: 'v_iz_2', word: 'خُذْ', tashkeel: 'خُذْ', categoryId: 'imperative', explanation: 'فعل أمر محذوف الفاء مبني على السكون' },
      { id: 'v_iz_3', word: 'قُلْ', tashkeel: 'قُلْ', categoryId: 'imperative', explanation: 'فعل أمر محذوف العين مبني على السكون' },
      { id: 'v_iz_4', word: 'عِشْ', tashkeel: 'عِشْ', categoryId: 'imperative', explanation: 'فعل أمر محذوف الوسط مبني على السكون' },
      { id: 'v_iz_5', word: 'قُمْ', tashkeel: 'قُمْ', categoryId: 'imperative', explanation: 'فعل أمر محذوف الوسط مبني على السكون' },
      { id: 'v_iz_6', word: 'صُمْ', tashkeel: 'صُمْ', categoryId: 'imperative', explanation: 'فعل أمر محذوف الوسط مبني على السكون' },
      { id: 'v_iz_7', word: 'بِعْ', tashkeel: 'بِعْ', categoryId: 'imperative', explanation: 'فعل أمر محذوف الوسط مبني على السكون' },
      { id: 'v_iz_8', word: 'نَمْ', tashkeel: 'نَمْ', categoryId: 'imperative', explanation: 'فعل أمر محذوف الوسط مبني على السكون' }
      ]
    },
    future: {
      seen: [
      { id: 'v_fs_1', word: 'سَيَكْتُبُ', tashkeel: 'سَيَكْتُبُ', categoryId: 'future', explanation: 'فعل مستقبل مقترن بسين الاستقبال' },
      { id: 'v_fs_2', word: 'سَنَنْجَحُ', tashkeel: 'سَنَنْجَحُ', categoryId: 'future', explanation: 'فعل مستقبل مقترن بسين الاستقبال' },
      { id: 'v_fs_3', word: 'سَيَفُوزُ', tashkeel: 'سَيَفُوزُ', categoryId: 'future', explanation: 'فعل مستقبل مقترن بسين الاستقبال' },
      { id: 'v_fs_4', word: 'سَتَقْرَأُ', tashkeel: 'سَتَقْرَأُ', categoryId: 'future', explanation: 'فعل مستقبل مقترن بسين الاستقبال' },
      { id: 'v_fs_5', word: 'سَيَسْمَعُ', tashkeel: 'سَيَسْمَعُ', categoryId: 'future', explanation: 'فعل مستقبل مقترن بسين الاستقبال' },
      { id: 'v_fs_6', word: 'سَأَفْهَمُ', tashkeel: 'سَأَفْهَمُ', categoryId: 'future', explanation: 'فعل مستقبل مقترن بسين الاستقبال' },
      { id: 'v_fs_7', word: 'سَنُسَافِرُ', tashkeel: 'سَنُسَافِرُ', categoryId: 'future', explanation: 'فعل مستقبل مقترن بسين الاستقبال' },
      { id: 'v_fs_8', word: 'سَيَزُورُ', tashkeel: 'سَيَزُورُ', categoryId: 'future', explanation: 'فعل مستقبل مقترن بسين الاستقبال' }
      ],
      sawfa: [
      { id: 'v_fw_1', word: 'سَوْفَ نَنْجَحُ', tashkeel: 'سَوْفَ نَنْجَحُ', categoryId: 'future', explanation: 'فعل مستقبل مسبوق بأداة سوف الدالة على الاستقبال' },
      { id: 'v_fw_2', word: 'سَوْفَ أَتَعَلَّمُ', tashkeel: 'سَوْفَ أَتَعَلَّمُ', categoryId: 'future', explanation: 'فعل مستقبل مسبوق بأداة سوف الدالة على الاستقبال' },
      { id: 'v_fw_3', word: 'سَوْفَ نُسَافِرُ', tashkeel: 'سَوْفَ نُسَافِرُ', categoryId: 'future', explanation: 'فعل مستقبل مسبوق بأداة سوف الدالة على الاستقبال' },
      { id: 'v_fw_4', word: 'سَوْفَ يَنْتَصِرُ', tashkeel: 'سَوْفَ يَنْتَصِرُ', categoryId: 'future', explanation: 'فعل مستقبل مسبوق بأداة سوف الدالة على الاستقبال' },
      { id: 'v_fw_5', word: 'سَوْفَ نَفُوزُ', tashkeel: 'سَوْفَ نَفُوزُ', categoryId: 'future', explanation: 'فعل مستقبل مسبوق بأداة سوف الدالة على الاستقبال' },
      { id: 'v_fw_6', word: 'سَوْفَ أَكْتُبُ', tashkeel: 'سَوْفَ أَكْتُبُ', categoryId: 'future', explanation: 'فعل مستقبل مسبوق بأداة سوف الدالة على الاستقبال' },
      { id: 'v_fw_7', word: 'سَوْفَ يَقْرَأُ', tashkeel: 'سَوْفَ يَقْرَأُ', categoryId: 'future', explanation: 'فعل مستقبل مسبوق بأداة سوف الدالة على الاستقبال' },
      { id: 'v_fw_8', word: 'سَوْفَ نَسْمَعُ', tashkeel: 'سَوْفَ نَسْمَعُ', categoryId: 'future', explanation: 'فعل مستقبل مسبوق بأداة سوف الدالة على الاستقبال' }
      ]
    }
  },
  particles: {
    jar: {
      munfasil: [
      { id: 'p_jm_1', word: 'مِنْ', tashkeel: 'مِنْ', categoryId: 'jar', explanation: 'حرف جر منفصل يفيد ابتداء الغاية' },
      { id: 'p_jm_2', word: 'إِلَى', tashkeel: 'إِلَى', categoryId: 'jar', explanation: 'حرف جر منفصل يفيد انتهاء الغاية' },
      { id: 'p_jm_3', word: 'عَنْ', tashkeel: 'عَنْ', categoryId: 'jar', explanation: 'حرف جر منفصل يفيد المجاوزة والابتعاد' },
      { id: 'p_jm_4', word: 'عَلَى', tashkeel: 'عَلَى', categoryId: 'jar', explanation: 'حرف جر منفصل يفيد الاستعلاء' },
      { id: 'p_jm_5', word: 'فِي', tashkeel: 'فِي', categoryId: 'jar', explanation: 'حرف جر منفصل يفيد الظرفية المكانية أو الزمانية' }
      ],
      muttasil: [
      { id: 'p_jt_1', word: 'كَـ (الكَاف)', tashkeel: 'كَـ (الكَاف)', categoryId: 'jar', explanation: 'حرف جر متصل يفيد التشبيه' },
      { id: 'p_jt_2', word: 'لِـ (اللاَّم)', tashkeel: 'لِـ (اللاَّم)', categoryId: 'jar', explanation: 'حرف جر متصل يفيد الملكية والاختصاص' },
      { id: 'p_jt_3', word: 'بِـ (البَاء)', tashkeel: 'بِـ (البَاء)', categoryId: 'jar', explanation: 'حرف جر متصل يفيد الإلصاق والاستعانة' }
      ]
    },
    atf: {
      fixed: [
      { id: 'p_a_1', word: 'وَ (الوَاو)', tashkeel: 'وَ (الوَاو)', categoryId: 'atf', explanation: 'حرف عطف يفيد مطلق الجمع والاشتراك' },
      { id: 'p_a_2', word: 'فَـ (الفَاء)', tashkeel: 'فَـ (الفَاء)', categoryId: 'atf', explanation: 'حرف عطف يفيد الترتيب والتعقيب والسرعة' },
      { id: 'p_a_3', word: 'ثُمَّ', tashkeel: 'ثُمَّ', categoryId: 'atf', explanation: 'حرف عطف يفيد الترتيب مع التراخي الزمني' },
      { id: 'p_a_4', word: 'أَوْ', tashkeel: 'أَوْ', categoryId: 'atf', explanation: 'حرف عطف يفيد التخيير أو الشك' }
      ]
    },
    nasikh: {
      pool: [
      { id: 'p_n_1', word: 'إِنَّ', tashkeel: 'إِنَّ', categoryId: 'nasikh', explanation: 'حرف توكيد ونصب ناسخ ينصب المبتدأ ويرفع الخبر' },
      { id: 'p_n_2', word: 'أَنَّ', tashkeel: 'أَنَّ', categoryId: 'nasikh', explanation: 'حرف توكيد ومصدري ناسخ ينصب المبتدأ ويرفع الخبر' },
      { id: 'p_n_3', word: 'كَأَنَّ', tashkeel: 'كَأَنَّ', categoryId: 'nasikh', explanation: 'حرف ناسخ يفيد التشبيه ينصب المبتدأ ويرفع الخبر' },
      { id: 'p_n_4', word: 'لَكِنَّ', tashkeel: 'لَكِنَّ', categoryId: 'nasikh', explanation: 'حرف ناسخ يفيد الاستدراك ينصب المبتدأ ويرفع الخبر' },
      { id: 'p_n_5', word: 'لَيْتَ', tashkeel: 'لَيْتَ', categoryId: 'nasikh', explanation: 'حرف ناسخ يفيد التمني للمستحيل أو العسير' },
      { id: 'p_n_6', word: 'لَعَلَّ', tashkeel: 'لَعَلَّ', categoryId: 'nasikh', explanation: 'حرف ناسخ يفيد الترجي والتوقع' }
      ]
    },
    nasb: {
      fixed: [
      { id: 'p_ns_1', word: 'أَنْ', tashkeel: 'أَنْ', categoryId: 'nasb', explanation: 'حرف مصدري ونصب ينصب الفعل المضارع' },
      { id: 'p_ns_2', word: 'لَنْ', tashkeel: 'لَنْ', categoryId: 'nasb', explanation: 'حرف نفي ونصب واستقبال ينصب الفعل المضارع' },
      { id: 'p_ns_3', word: 'كَيْ', tashkeel: 'كَيْ', categoryId: 'nasb', explanation: 'حرف نصب مصدري يفيد التعليل ينصب الفعل المضارع' },
      { id: 'p_ns_4', word: 'حَتَّى', tashkeel: 'حَتَّى', categoryId: 'nasb', explanation: 'حرف نصب وغاية ينصب الفعل المضارع بأن المضمرة' }
      ]
    }
  },
  spelling: {
    tanween: {
      fath: [
      { id: 's_tf_1', word: 'قَلَمًا', tashkeel: 'قَلَمًا', categoryId: 'tanween', explanation: 'تنوين الفتح على كلمة ثلاثية مجردة من الشدة والمد والهمزة' },
      { id: 's_tf_2', word: 'بَحْرًا', tashkeel: 'بَحْرًا', categoryId: 'tanween', explanation: 'تنوين الفتح على كلمة ثلاثية مجردة من الشدة والمد والهمزة' },
      { id: 's_tf_3', word: 'جَمَلًا', tashkeel: 'جَمَلًا', categoryId: 'tanween', explanation: 'تنوين الفتح على كلمة ثلاثية مجردة من الشدة والمد والهمزة' },
      { id: 's_tf_4', word: 'نَهْرًا', tashkeel: 'نَهْرًا', categoryId: 'tanween', explanation: 'تنوين الفتح على كلمة ثلاثية مجردة من الشدة والمد والهمزة' },
      { id: 's_tf_5', word: 'حَجَرًا', tashkeel: 'حَجَرًا', categoryId: 'tanween', explanation: 'تنوين الفتح على كلمة ثلاثية مجردة من الشدة والمد والهمزة' },
      { id: 's_tf_6', word: 'جَبَلًا', tashkeel: 'جَبَلًا', categoryId: 'tanween', explanation: 'تنوين الفتح على كلمة ثلاثية مجردة من الشدة والمد والهمزة' },
      { id: 's_tf_7', word: 'وَلَدًا', tashkeel: 'وَلَدًا', categoryId: 'tanween', explanation: 'تنوين الفتح على كلمة ثلاثية مجردة من الشدة والمد والهمزة' },
      { id: 's_tf_8', word: 'بَلَدًا', tashkeel: 'بَلَدًا', categoryId: 'tanween', explanation: 'تنوين الفتح على كلمة ثلاثية مجردة من الشدة والمد والهمزة' }
      ],
      damm: [
      { id: 's_td_1', word: 'قَلَمٌ', tashkeel: 'قَلَمٌ', categoryId: 'tanween', explanation: 'تنوين الضم على كلمة ثلاثية مجردة من الشدة والمد والهمزة' },
      { id: 's_td_2', word: 'رَجُلٌ', tashkeel: 'رَجُلٌ', categoryId: 'tanween', explanation: 'تنوين الضم على كلمة ثلاثية مجردة من الشدة والمد والهمزة' },
      { id: 's_td_3', word: 'عَسَلٌ', tashkeel: 'عَسَلٌ', categoryId: 'tanween', explanation: 'تنوين الضم على كلمة ثلاثية مجردة من الشدة والمد والهمزة' },
      { id: 's_td_4', word: 'جَبَلٌ', tashkeel: 'جَبَلٌ', categoryId: 'tanween', explanation: 'تنوين الضم على كلمة ثلاثية مجردة من الشدة والمد والهمزة' },
      { id: 's_td_5', word: 'قَمَرٌ', tashkeel: 'قَمَرٌ', categoryId: 'tanween', explanation: 'تنوين الضم على كلمة ثلاثية مجردة من الشدة والمد والهمزة' },
      { id: 's_td_6', word: 'مَطَرٌ', tashkeel: 'مَطَرٌ', categoryId: 'tanween', explanation: 'تنوين الضم على كلمة ثلاثية مجردة من الشدة والمد والهمزة' },
      { id: 's_td_7', word: 'حَبْلٌ', tashkeel: 'حَبْلٌ', categoryId: 'tanween', explanation: 'تنوين الضم على كلمة ثلاثية مجردة من الشدة والمد والهمزة' },
      { id: 's_td_8', word: 'فَجْرٌ', tashkeel: 'فَجْرٌ', categoryId: 'tanween', explanation: 'تنوين الضم على كلمة ثلاثية مجردة من الشدة والمد والهمزة' }
      ],
      kasr: [
      { id: 's_tk_1', word: 'حَجَرٍ', tashkeel: 'حَجَرٍ', categoryId: 'tanween', explanation: 'تنوين الكسر على كلمة ثلاثية مجردة من الشدة والمد والهمزة' },
      { id: 's_tk_2', word: 'وَرَقٍ', tashkeel: 'وَرَقٍ', categoryId: 'tanween', explanation: 'تنوين الكسر على كلمة ثلاثية مجردة من الشدة والمد والهمزة' },
      { id: 's_tk_3', word: 'شَجَرٍ', tashkeel: 'شَجَرٍ', categoryId: 'tanween', explanation: 'تنوين الكسر على كلمة ثلاثية مجردة من الشدة والمد والهمزة' },
      { id: 's_tk_4', word: 'عِلْمٍ', tashkeel: 'عِلْمٍ', categoryId: 'tanween', explanation: 'تنوين الكسر على كلمة ثلاثية مجردة من الشدة والمد والهمزة' },
      { id: 's_tk_5', word: 'نَصْرٍ', tashkeel: 'نَصْرٍ', categoryId: 'tanween', explanation: 'تنوين الكسر على كلمة ثلاثية مجردة من الشدة والمد والهمزة' },
      { id: 's_tk_6', word: 'صَبْرٍ', tashkeel: 'صَبْرٍ', categoryId: 'tanween', explanation: 'تنوين الكسر على كلمة ثلاثية مجردة من الشدة والمد والهمزة' },
      { id: 's_tk_7', word: 'دَرْبٍ', tashkeel: 'دَرْبٍ', categoryId: 'tanween', explanation: 'تنوين الكسر على كلمة ثلاثية مجردة من الشدة والمد والهمزة' },
      { id: 's_tk_8', word: 'فِكْرٍ', tashkeel: 'فِكْرٍ', categoryId: 'tanween', explanation: 'تنوين الكسر على كلمة ثلاثية مجردة من الشدة والمد والهمزة' }
      ]
    },
    shaddah: {
      awwal: [
      { id: 's_sh_a_1', word: 'الشَّمْسُ', tashkeel: 'الشَّمْسُ', categoryId: 'shaddah', explanation: 'شدة في أول الكلمة بعد اللام الشمسية بدون تنوين ولا مد ولا همزة' },
      { id: 's_sh_a_2', word: 'الصَّبْرُ', tashkeel: 'الصَّبْرُ', categoryId: 'shaddah', explanation: 'شدة في أول الكلمة بعد اللام الشمسية بدون تنوين ولا مد ولا همزة' },
      { id: 's_sh_a_3', word: 'التَّمْرُ', tashkeel: 'التَّمْرُ', categoryId: 'shaddah', explanation: 'شدة في أول الكلمة بعد اللام الشمسية بدون تنوين ولا مد ولا همزة' },
      { id: 's_sh_a_4', word: 'النَّجْمُ', tashkeel: 'النَّجْمُ', categoryId: 'shaddah', explanation: 'شدة في أول الكلمة بعد اللام الشمسية بدون تنوين ولا مد ولا همزة' },
      { id: 's_sh_a_5', word: 'الزَّرْعُ', tashkeel: 'الزَّرْعُ', categoryId: 'shaddah', explanation: 'شدة في أول الكلمة بعد اللام الشمسية بدون تنوين ولا مد ولا همزة' },
      { id: 's_sh_a_6', word: 'الثَّلْجُ', tashkeel: 'الثَّلْجُ', categoryId: 'shaddah', explanation: 'شدة في أول الكلمة بعد اللام الشمسية بدون تنوين ولا مد ولا همزة' },
      { id: 's_sh_a_7', word: 'الرَّسْمُ', tashkeel: 'الرَّسْمُ', categoryId: 'shaddah', explanation: 'شدة في أول الكلمة بعد اللام الشمسية بدون تنوين ولا مد ولا همزة' },
      { id: 's_sh_a_8', word: 'الصَّقْرُ', tashkeel: 'الصَّقْرُ', categoryId: 'shaddah', explanation: 'شدة في أول الكلمة بعد اللام الشمسية بدون تنوين ولا مد ولا همزة' }
      ],
      wasat_fath: [
      { id: 's_sh_wf_1', word: 'فَكَّرَ', tashkeel: 'فَكَّرَ', categoryId: 'shaddah', explanation: 'شدة مفتوحة في وسط الكلمة (ـَّ) بدون تنوين ولا مد ولا همزة' },
      { id: 's_sh_wf_2', word: 'سَلَّمَ', tashkeel: 'سَلَّمَ', categoryId: 'shaddah', explanation: 'شدة مفتوحة في وسط الكلمة (ـَّ) بدون تنوين ولا مد ولا همزة' },
      { id: 's_sh_wf_3', word: 'قَدَّمَ', tashkeel: 'قَدَّمَ', categoryId: 'shaddah', explanation: 'شدة مفتوحة في وسط الكلمة (ـَّ) بدون تنوين ولا مد ولا همزة' },
      { id: 's_sh_wf_4', word: 'رَتَّبَ', tashkeel: 'رَتَّبَ', categoryId: 'shaddah', explanation: 'شدة مفتوحة في وسط الكلمة (ـَّ) بدون تنوين ولا مد ولا همزة' },
      { id: 's_sh_wf_5', word: 'عَلَّمَ', tashkeel: 'عَلَّمَ', categoryId: 'shaddah', explanation: 'شدة مفتوحة في وسط الكلمة (ـَّ) بدون تنوين ولا مد ولا همزة' },
      { id: 's_sh_wf_6', word: 'عَمَّرَ', tashkeel: 'عَمَّرَ', categoryId: 'shaddah', explanation: 'شدة مفتوحة في وسط الكلمة (ـَّ) بدون تنوين ولا مد ولا همزة' },
      { id: 's_sh_wf_7', word: 'نَظَّمَ', tashkeel: 'نَظَّمَ', categoryId: 'shaddah', explanation: 'شدة مفتوحة في وسط الكلمة (ـَّ) بدون تنوين ولا مد ولا همزة' },
      { id: 's_sh_wf_8', word: 'كَرَّمَ', tashkeel: 'كَرَّمَ', categoryId: 'shaddah', explanation: 'شدة مفتوحة في وسط الكلمة (ـَّ) بدون تنوين ولا مد ولا همزة' }
      ],
      wasat_kasr: [
      { id: 's_sh_wk_1', word: 'نَظِّفْ', tashkeel: 'نَظِّفْ', categoryId: 'shaddah', explanation: 'شدة مكسورة في وسط الكلمة (ـِّ) بدون تنوين ولا مد ولا همزة' },
      { id: 's_sh_wk_2', word: 'حَدِّثْ', tashkeel: 'حَدِّثْ', categoryId: 'shaddah', explanation: 'شدة مكسورة في وسط الكلمة (ـِّ) بدون تنوين ولا مد ولا همزة' },
      { id: 's_sh_wk_3', word: 'دَرِّبْ', tashkeel: 'دَرِّبْ', categoryId: 'shaddah', explanation: 'شدة مكسورة في وسط الكلمة (ـِّ) بدون تنوين ولا مد ولا همزة' },
      { id: 's_sh_wk_4', word: 'سَلِّمْ', tashkeel: 'سَلِّمْ', categoryId: 'shaddah', explanation: 'شدة مكسورة في وسط الكلمة (ـِّ) بدون تنوين ولا مد ولا همزة' },
      { id: 's_sh_wk_5', word: 'فَكِّرْ', tashkeel: 'فَكِّرْ', categoryId: 'shaddah', explanation: 'شدة مكسورة في وسط الكلمة (ـِّ) بدون تنوين ولا مد ولا همزة' },
      { id: 's_sh_wk_6', word: 'عَلِّمْ', tashkeel: 'عَلِّمْ', categoryId: 'shaddah', explanation: 'شدة مكسورة في وسط الكلمة (ـِّ) بدون تنوين ولا مد ولا همزة' },
      { id: 's_sh_wk_7', word: 'قَدِّمْ', tashkeel: 'قَدِّمْ', categoryId: 'shaddah', explanation: 'شدة مكسورة في وسط الكلمة (ـِّ) بدون تنوين ولا مد ولا همزة' },
      { id: 's_sh_wk_8', word: 'رَتِّبْ', tashkeel: 'رَتِّبْ', categoryId: 'shaddah', explanation: 'شدة مكسورة في وسط الكلمة (ـِّ) بدون تنوين ولا مد ولا همزة' }
      ],
      akhir_damm: [
      { id: 's_sh_ad_1', word: 'رَدَّ', tashkeel: 'رَدَّ', categoryId: 'shaddah', explanation: 'شدة في آخر الكلمة مضعفة بحركة مفردة بدون تنوين ولا مد ولا همزة' },
      { id: 's_sh_ad_2', word: 'عَدَّ', tashkeel: 'عَدَّ', categoryId: 'shaddah', explanation: 'شدة في آخر الكلمة مضعفة بحركة مفردة بدون تنوين ولا مد ولا همزة' },
      { id: 's_sh_ad_3', word: 'حَبَّ', tashkeel: 'حَبَّ', categoryId: 'shaddah', explanation: 'شدة في آخر الكلمة مضعفة بحركة مفردة بدون تنوين ولا مد ولا همزة' },
      { id: 's_sh_ad_4', word: 'شَدَّ', tashkeel: 'شَدَّ', categoryId: 'shaddah', explanation: 'شدة في آخر الكلمة مضعفة بحركة مفردة بدون تنوين ولا مد ولا همزة' },
      { id: 's_sh_ad_5', word: 'مَدَّ', tashkeel: 'مَدَّ', categoryId: 'shaddah', explanation: 'شدة في آخر الكلمة مضعفة بحركة مفردة بدون تنوين ولا مد ولا همزة' },
      { id: 's_sh_ad_6', word: 'سَدَّ', tashkeel: 'سَدَّ', categoryId: 'shaddah', explanation: 'شدة في آخر الكلمة مضعفة بحركة مفردة بدون تنوين ولا مد ولا همزة' },
      { id: 's_sh_ad_7', word: 'هَدَّ', tashkeel: 'هَدَّ', categoryId: 'shaddah', explanation: 'شدة في آخر الكلمة مضعفة بحركة مفردة بدون تنوين ولا مد ولا همزة' },
      { id: 's_sh_ad_8', word: 'ظَنَّ', tashkeel: 'ظَنَّ', categoryId: 'shaddah', explanation: 'شدة في آخر الكلمة مضعفة بحركة مفردة بدون تنوين ولا مد ولا همزة' }
      ]
    },
    mudood: {
      alif: [
      { id: 's_ma_1', word: 'صَابِرُ', tashkeel: 'صَابِرُ', categoryId: 'mudood', explanation: 'مد بالألف بحركة مفردة بدون تنوين ولا شدة ولا همزة' },
      { id: 's_ma_2', word: 'كَاتِبُ', tashkeel: 'كَاتِبُ', categoryId: 'mudood', explanation: 'مد بالألف بحركة مفردة بدون تنوين ولا شدة ولا همزة' },
      { id: 's_ma_3', word: 'عَابِرُ', tashkeel: 'عَابِرُ', categoryId: 'mudood', explanation: 'مد بالألف بحركة مفردة بدون تنوين ولا شدة ولا همزة' },
      { id: 's_ma_4', word: 'سَالِمُ', tashkeel: 'سَالِمُ', categoryId: 'mudood', explanation: 'مد بالألف بحركة مفردة بدون تنوين ولا شدة ولا همزة' },
      { id: 's_ma_5', word: 'فَاهِمُ', tashkeel: 'فَاهِمُ', categoryId: 'mudood', explanation: 'مد بالألف بحركة مفردة بدون تنوين ولا شدة ولا همزة' },
      { id: 's_ma_6', word: 'حَامِدُ', tashkeel: 'حَامِدُ', categoryId: 'mudood', explanation: 'مد بالألف بحركة مفردة بدون تنوين ولا شدة ولا همزة' },
      { id: 's_ma_7', word: 'شَاكِرُ', tashkeel: 'شَاكِرُ', categoryId: 'mudood', explanation: 'مد بالألف بحركة مفردة بدون تنوين ولا شدة ولا همزة' },
      { id: 's_ma_8', word: 'نَاصِرُ', tashkeel: 'نَاصِرُ', categoryId: 'mudood', explanation: 'مد بالألف بحركة مفردة بدون تنوين ولا شدة ولا همزة' }
      ],
      waw: [
      { id: 's_mw_1', word: 'سُورُ', tashkeel: 'سُورُ', categoryId: 'mudood', explanation: 'مد بالواو بحركة مفردة بدون تنوين ولا شدة ولا همزة' },
      { id: 's_mw_2', word: 'نُورُ', tashkeel: 'نُورُ', categoryId: 'mudood', explanation: 'مد بالواو بحركة مفردة بدون تنوين ولا شدة ولا همزة' },
      { id: 's_mw_3', word: 'دُورُ', tashkeel: 'دُورُ', categoryId: 'mudood', explanation: 'مد بالواو بحركة مفردة بدون تنوين ولا شدة ولا همزة' },
      { id: 's_mw_4', word: 'طُورُ', tashkeel: 'طُورُ', categoryId: 'mudood', explanation: 'مد بالواو بحركة مفردة بدون تنوين ولا شدة ولا همزة' },
      { id: 's_mw_5', word: 'صُوفُ', tashkeel: 'صُوفُ', categoryId: 'mudood', explanation: 'مد بالواو بحركة مفردة بدون تنوين ولا شدة ولا همزة' },
      { id: 's_mw_6', word: 'قُوتُ', tashkeel: 'قُوتُ', categoryId: 'mudood', explanation: 'مد بالواو بحركة مفردة بدون تنوين ولا شدة ولا همزة' },
      { id: 's_mw_7', word: 'حُوتُ', tashkeel: 'حُوتُ', categoryId: 'mudood', explanation: 'مد بالواو بحركة مفردة بدون تنوين ولا شدة ولا همزة' },
      { id: 's_mw_8', word: 'تُوتُ', tashkeel: 'تُوتُ', categoryId: 'mudood', explanation: 'مد بالواو بحركة مفردة بدون تنوين ولا شدة ولا همزة' }
      ],
      yaa: [
      { id: 's_my_1', word: 'حَلِيبُ', tashkeel: 'حَلِيبُ', categoryId: 'mudood', explanation: 'مد بالياء بحركة مفردة بدون تنوين ولا شدة ولا همزة' },
      { id: 's_my_2', word: 'سَرِيعُ', tashkeel: 'سَرِيعُ', categoryId: 'mudood', explanation: 'مد بالياء بحركة مفردة بدون تنوين ولا شدة ولا همزة' },
      { id: 's_my_3', word: 'طَبِيبُ', tashkeel: 'طَبِيبُ', categoryId: 'mudood', explanation: 'مد بالياء بحركة مفردة بدون تنوين ولا شدة ولا همزة' },
      { id: 's_my_4', word: 'كَرِيمُ', tashkeel: 'كَرِيمُ', categoryId: 'mudood', explanation: 'مد بالياء بحركة مفردة بدون تنوين ولا شدة ولا همزة' },
      { id: 's_my_5', word: 'رَحِيمُ', tashkeel: 'رَحِيمُ', categoryId: 'mudood', explanation: 'مد بالياء بحركة مفردة بدون تنوين ولا شدة ولا همزة' },
      { id: 's_my_6', word: 'سَمِيعُ', tashkeel: 'سَمِيعُ', categoryId: 'mudood', explanation: 'مد بالياء بحركة مفردة بدون تنوين ولا شدة ولا همزة' },
      { id: 's_my_7', word: 'عَلِيمُ', tashkeel: 'عَلِيمُ', categoryId: 'mudood', explanation: 'مد بالياء بحركة مفردة بدون تنوين ولا شدة ولا همزة' },
      { id: 's_my_8', word: 'بَصِيرُ', tashkeel: 'بَصِيرُ', categoryId: 'mudood', explanation: 'مد بالياء بحركة مفردة بدون تنوين ولا شدة ولا همزة' }
      ]
    },
    hamzat: {
      qata: [
      { id: 's_hq_1', word: 'أَخَذَ', tashkeel: 'أَخَذَ', categoryId: 'hamzat', explanation: 'همزة قطع في أول الكلمة بحركات قصيرة بدون تنوين ولا شدة ولا مدود' },
      { id: 's_hq_2', word: 'أَمَرَ', tashkeel: 'أَمَرَ', categoryId: 'hamzat', explanation: 'همزة قطع في أول الكلمة بحركات قصيرة بدون تنوين ولا شدة ولا مدود' },
      { id: 's_hq_3', word: 'أَكَلَ', tashkeel: 'أَكَلَ', categoryId: 'hamzat', explanation: 'همزة قطع في أول الكلمة بحركات قصيرة بدون تنوين ولا شدة ولا مدود' },
      { id: 's_hq_4', word: 'أَدَبُ', tashkeel: 'أَدَبُ', categoryId: 'hamzat', explanation: 'همزة قطع في أول الكلمة بحركات قصيرة بدون تنوين ولا شدة ولا مدود' },
      { id: 's_hq_5', word: 'أَثَرُ', tashkeel: 'أَثَرُ', categoryId: 'hamzat', explanation: 'همزة قطع في أول الكلمة بحركات قصيرة بدون تنوين ولا شدة ولا مدود' },
      { id: 's_hq_6', word: 'أَسَدُ', tashkeel: 'أَسَدُ', categoryId: 'hamzat', explanation: 'همزة قطع في أول الكلمة بحركات قصيرة بدون تنوين ولا شدة ولا مدود' },
      { id: 's_hq_7', word: 'أَمَلُ', tashkeel: 'أَمَلُ', categoryId: 'hamzat', explanation: 'همزة قطع في أول الكلمة بحركات قصيرة بدون تنوين ولا شدة ولا مدود' },
      { id: 's_hq_8', word: 'أَجَلُ', tashkeel: 'أَجَلُ', categoryId: 'hamzat', explanation: 'همزة قطع في أول الكلمة بحركات قصيرة بدون تنوين ولا شدة ولا مدود' }
      ],
      mutawassita: [
      { id: 's_hm_1', word: 'سَأَلَ', tashkeel: 'سَأَلَ', categoryId: 'hamzat', explanation: 'همزة متوسطة على الألف بحركات قصيرة بدون تنوين ولا شدة ولا مدود' },
      { id: 's_hm_2', word: 'يَئِسَ', tashkeel: 'يَئِسَ', categoryId: 'hamzat', explanation: 'همزة متوسطة على نبرة بحركات قصيرة بدون تنوين ولا شدة ولا مدود' },
      { id: 's_hm_3', word: 'كَئِبَ', tashkeel: 'كَئِبَ', categoryId: 'hamzat', explanation: 'همزة متوسطة على نبرة بحركات قصيرة بدون تنوين ولا شدة ولا مدود' },
      { id: 's_hm_4', word: 'رَأَسَ', tashkeel: 'رَأَسَ', categoryId: 'hamzat', explanation: 'همزة متوسطة على الألف بحركات قصيرة بدون تنوين ولا شدة ولا مدود' },
      { id: 's_hm_5', word: 'فَئَةُ', tashkeel: 'فَئَةُ', categoryId: 'hamzat', explanation: 'همزة متوسطة على نبرة بحركات قصيرة بدون تنوين ولا شدة ولا مدود' },
      { id: 's_hm_6', word: 'رَئِسَ', tashkeel: 'رَئِسَ', categoryId: 'hamzat', explanation: 'همزة متوسطة على نبرة بحركات قصيرة بدون تنوين ولا شدة ولا مدود' },
      { id: 's_hm_7', word: 'ذَأَبَ', tashkeel: 'ذَأَبَ', categoryId: 'hamzat', explanation: 'همزة متوسطة على الألف بحركات قصيرة بدون تنوين ولا شدة ولا مدود' },
      { id: 's_hm_8', word: 'بَئِسَ', tashkeel: 'بَئِسَ', categoryId: 'hamzat', explanation: 'همزة متوسطة على نبرة بحركات قصيرة بدون تنوين ولا شدة ولا مدود' }
      ],
      mutatarrifa: [
      { id: 's_ht_1', word: 'قَرَأَ', tashkeel: 'قَرَأَ', categoryId: 'hamzat', explanation: 'همزة متطرفة على الألف بحركات قصيرة بدون تنوين ولا شدة ولا مدود' },
      { id: 's_ht_2', word: 'بَدَأَ', tashkeel: 'بَدَأَ', categoryId: 'hamzat', explanation: 'همزة متطرفة على الألف بحركات قصيرة بدون تنوين ولا شدة ولا مدود' },
      { id: 's_ht_3', word: 'لَجَأَ', tashkeel: 'لَجَأَ', categoryId: 'hamzat', explanation: 'همزة متطرفة على الألف بحركات قصيرة بدون تنوين ولا شدة ولا مدود' },
      { id: 's_ht_4', word: 'نَبَأُ', tashkeel: 'نَبَأُ', categoryId: 'hamzat', explanation: 'همزة متطرفة على الألف بحركات قصيرة بدون تنوين ولا شدة ولا مدود' },
      { id: 's_ht_5', word: 'مَلَأَ', tashkeel: 'مَلَأَ', categoryId: 'hamzat', explanation: 'همزة متطرفة على الألف بحركات قصيرة بدون تنوين ولا شدة ولا مدود' },
      { id: 's_ht_6', word: 'نَشَأَ', tashkeel: 'نَشَأَ', categoryId: 'hamzat', explanation: 'همزة متطرفة على الألف بحركات قصيرة بدون تنوين ولا شدة ولا مدود' },
      { id: 's_ht_7', word: 'صَدَأُ', tashkeel: 'صَدَأُ', categoryId: 'hamzat', explanation: 'همزة متطرفة على الألف بحركات قصيرة بدون تنوين ولا شدة ولا مدود' },
      { id: 's_ht_8', word: 'خَطَأُ', tashkeel: 'خَطَأُ', categoryId: 'hamzat', explanation: 'همزة متطرفة على الألف بحركات قصيرة بدون تنوين ولا شدة ولا مدود' }
      ]
    }
  }
};


// تتبع الكلمات المستخدمة مؤخراً لكل قسم لمنع تكرار نفس الكلمات عند تكرار الدخول
const recentUsedWordIdsPerDept: Record<DepartmentId, Set<string>> = {
  nouns: new Set<string>(),
  verbs: new Set<string>(),
  particles: new Set<string>(),
  spelling: new Set<string>()
};

// دالة مساعدة لاختيار n عناصر عشوائية غير مكررة مع تفضيل الكلمات غير المستخدمة في الزيارة السابقة
function pickNonRepeatingDistinct<T extends { id: string }>(pool: T[], count: number, deptId: DepartmentId): T[] {
  const usedSet = recentUsedWordIdsPerDept[deptId];
  // تصفية الكلمات التي لم تُستخدم مؤخراً
  let available = pool.filter(item => !usedSet.has(item.id));
  
  // إذا نفدت الكلمات المتاحة في المجموعة، نعيد تصفير الذاكرة لتلك الفئة ونستخدم كامل المجموعة
  if (available.length < count) {
    pool.forEach(item => usedSet.delete(item.id));
    available = [...pool];
  }
  
  // خلط واختيار العدد المطلوب
  const shuffled = [...available].sort(() => Math.random() - 0.5);
  const selected = shuffled.slice(0, count);
  
  // تسجيل الكلمات المختارة في ذاكرة الكلمات المستخدمة
  selected.forEach(item => usedSet.add(item.id));
  return selected;
}

function pickNonRepeatingSingle<T extends { id: string }>(pool: T[], deptId: DepartmentId): T {
  return pickNonRepeatingDistinct(pool, 1, deptId)[0];
}

// دالة مساعدة عامة لاختيار عنصر عشوائي من مصفوفة
function pickRandom<T>(arr: T[]): T {
  return arr[Math.floor(Math.random() * arr.length)];
}

// دالة مساعدة لاختيار n عناصر عشوائية غير مكررة من مصفوفة
function pickRandomDistinct<T>(arr: T[], count: number): T[] {
  const shuffled = [...arr].sort(() => Math.random() - 0.5);
  return shuffled.slice(0, count);
}

// مولد الكلمات الديناميكي لكل قسم لضمان التنويع الكامل وعدم تكرار نفس الكلمات في كل دخول
export function generateDepartmentSessionItems(deptId: DepartmentId): WordItem[] {
  const items: WordItem[] = [];

  if (deptId === 'nouns') {
    const bank = WORD_BANK.nouns;

    // 1. التنوين: (الفتح والضم والكسر وكرر أي منهم ليصبحوا 4 كلمات بدون مثنى أو جمع أو تاء مربوطة أو أل)
    const tFath = pickNonRepeatingSingle(bank.tanween.fath, deptId);
    const tDamm = pickNonRepeatingSingle(bank.tanween.damm, deptId);
    const tKasr = pickNonRepeatingSingle(bank.tanween.kasr, deptId);
    const remainingTanweenPool = [
      ...bank.tanween.fath.filter(w => w.id !== tFath.id),
      ...bank.tanween.damm.filter(w => w.id !== tDamm.id),
      ...bank.tanween.kasr.filter(w => w.id !== tKasr.id)
    ];
    const tExtra = pickNonRepeatingSingle(remainingTanweenPool, deptId);
    items.push(tFath, tDamm, tKasr, tExtra);

    // 2. الـ التعريف: (الـ... - الأ... - الا... - الـ) بدون مثنى أو جمع أو تاء مربوطة أو تنوين
    const alStd = pickNonRepeatingSingle(bank.al_taareef.al_standard, deptId);
    const alHamza = pickNonRepeatingSingle(bank.al_taareef.al_hamza_qata, deptId);
    const alWasl = pickNonRepeatingSingle(bank.al_taareef.al_hamza_wasl, deptId);
    const remainingAlPool = [
      ...bank.al_taareef.al_standard.filter(w => w.id !== alStd.id),
      ...bank.al_taareef.al_hamza_qata.filter(w => w.id !== alHamza.id)
    ];
    const alExtra = pickNonRepeatingSingle(remainingAlPool, deptId);
    items.push(alStd, alHamza, alWasl, alExtra);

    // 3. التاء المربوطة: كلمتان تنتهي بـ(ة) وأخرتان تنتهي بـ(ـة) بدون تنوين أو مثنى أو جمع أو أل
    const tmMunfasila = pickNonRepeatingDistinct(bank.taa_marbuta.munfasila, 2, deptId);
    const tmMuttasila = pickNonRepeatingDistinct(bank.taa_marbuta.muttasila, 2, deptId);
    items.push(...tmMunfasila, ...tmMuttasila);

    // 4. المثنى والجمع: واحدة مثنى - واحدة جمع مذكر سالم - واحدة جمع مؤنث سالم - واحدة جمع تكسير بدون تنوين أو تاء مربوطة أو أل
    const muthanna = pickNonRepeatingSingle(bank.muthanna_jam.muthanna, deptId);
    const jamMudhakkar = pickNonRepeatingSingle(bank.muthanna_jam.jam_mudhakkar, deptId);
    const jamMuannath = pickNonRepeatingSingle(bank.muthanna_jam.jam_muannath, deptId);
    const jamTaksir = pickNonRepeatingSingle(bank.muthanna_jam.jam_taksir, deptId);
    items.push(muthanna, jamMudhakkar, jamMuannath, jamTaksir);

  } else if (deptId === 'verbs') {
    const bank = WORD_BANK.verbs;

    // 1. الفعل الماضي: تنويع (جلسَ مذكر مفرد - سمعْنا نا الفاعلين - نامتْ تاء التأنيث - كتبْتم تم المخاطبين)
    const pMuf = pickNonRepeatingSingle(bank.past.mufrad_mudhakkar, deptId);
    const pNaa = pickNonRepeatingSingle(bank.past.naa_faileen, deptId);
    const pTaa = pickNonRepeatingSingle(bank.past.taa_tanith, deptId);
    const pTum = pickNonRepeatingSingle(bank.past.tum_mukhatab, deptId);
    items.push(pMuf, pNaa, pTaa, pTum);

    // 2. الفعل المضارع: 4 كلمات كل واحدة تبدأ بـ (أ - نـ - يـ - تـ)
    const prA = pickNonRepeatingSingle(bank.present.alif, deptId);
    const prN = pickNonRepeatingSingle(bank.present.noon, deptId);
    const prY = pickNonRepeatingSingle(bank.present.yaa, deptId);
    const prT = pickNonRepeatingSingle(bank.present.taa, deptId);
    items.push(prA, prN, prY, prT);

    // 3. الفعل الأمر: تنويع (اقرأْ مفرد - ادخلي ياء مخاطبة - ناموا واو جماعة - كُلْ محذوف الوسط/الفاء)
    const imMuf = pickNonRepeatingSingle(bank.imperative.mufrad, deptId);
    const imMukh = pickNonRepeatingSingle(bank.imperative.mukhātiba, deptId);
    const imWaw = pickNonRepeatingSingle(bank.imperative.waw_jamaa, deptId);
    const imMaz = pickNonRepeatingSingle(bank.imperative.mahthoof, deptId);
    items.push(imMuf, imMukh, imWaw, imMaz);

    // 4. فعل المستقبل: تنويع بين (سـ - سوف) في كل مرة (اثنتان بسين واثنتان بسوف)
    const fSeen = pickNonRepeatingDistinct(bank.future.seen, 2, deptId);
    const fSawfa = pickNonRepeatingDistinct(bank.future.sawfa, 2, deptId);
    items.push(...fSeen, ...fSawfa);

  } else if (deptId === 'particles') {
    const bank = WORD_BANK.particles;

    // 1. حروف الجر: تنويع كل مرة بين المنفصلة (من - إلى - عن - على - في) والمتصلة (كـ - لـ - بـ)
    const jMunf = pickNonRepeatingDistinct(bank.jar.munfasil, 2, deptId);
    const jMutt = pickNonRepeatingDistinct(bank.jar.muttasil, 2, deptId);
    items.push(...jMunf, ...jMutt);

    // 2. حروف العطف: الأربعة الثابتة في كل مرة (و - فـ - ثم - أو)
    items.push(...bank.atf.fixed);

    // 3. الحروف الناسخة: تنويع 4 حروف في كل مرة من (إنّ - أنّ - كأنّ - لكنّ - ليت - لعل)
    const nasikhChosen = pickNonRepeatingDistinct(bank.nasikh.pool, 4, deptId);
    items.push(...nasikhChosen);

    // 4. حروف تنصب المضارع: الأربعة الثابتة في كل مرة (أنْ - لنْ - كَي - حتى) بدون لام التعليل
    items.push(...bank.nasb.fixed);

  } else if (deptId === 'spelling') {
    const bank = WORD_BANK.spelling;

    // 1. التنوين: (الفتح والضم والكسر وكرر أي منهم ليصبحوا 4 كلمات) بدون شدة أو مد أو همزة
    const tF = pickNonRepeatingSingle(bank.tanween.fath, deptId);
    const tD = pickNonRepeatingSingle(bank.tanween.damm, deptId);
    const tK = pickNonRepeatingSingle(bank.tanween.kasr, deptId);
    const tRemaining = [
      ...bank.tanween.fath.filter(w => w.id !== tF.id),
      ...bank.tanween.damm.filter(w => w.id !== tD.id),
      ...bank.tanween.kasr.filter(w => w.id !== tK.id)
    ];
    const tExt = pickNonRepeatingSingle(tRemaining, deptId);
    items.push(tF, tD, tK, tExt);

    // 2. الشدة: تنويع بين أول الكلمة (لام شمسية) ووسط فتح (ـَّ) ووسط كسر (ـِّ) وآخر ضم (ـُّ) بدون تنوين ولا مدود ولا همزات
    const shAwwal = pickNonRepeatingSingle(bank.shaddah.awwal, deptId);
    const shWasatF = pickNonRepeatingSingle(bank.shaddah.wasat_fath, deptId);
    const shWasatK = pickNonRepeatingSingle(bank.shaddah.wasat_kasr, deptId);
    const shAkhirD = pickNonRepeatingSingle(bank.shaddah.akhir_damm, deptId);
    items.push(shAwwal, shWasatF, shWasatK, shAkhirD);

    // 3. المدود: تنويع بين مد الألف ومد الواو ومد الياء بدون تنوين ولا شدة ولا همزات
    const mA = pickNonRepeatingSingle(bank.mudood.alif, deptId);
    const mW = pickNonRepeatingSingle(bank.mudood.waw, deptId);
    const mY = pickNonRepeatingSingle(bank.mudood.yaa, deptId);
    const mRemaining = [
      ...bank.mudood.alif.filter(w => w.id !== mA.id),
      ...bank.mudood.waw.filter(w => w.id !== mW.id),
      ...bank.mudood.yaa.filter(w => w.id !== mY.id)
    ];
    const mExt = pickNonRepeatingSingle(mRemaining, deptId);
    items.push(mA, mW, mY, mExt);

    // 4. الهمزات: تنويع بين همزة القطع والهمزة المتوسطة والهمزة المتطرفة بدون تنوين ولا شدة ولا مدود
    const hQ = pickNonRepeatingSingle(bank.hamzat.qata, deptId);
    const hM = pickNonRepeatingSingle(bank.hamzat.mutawassita, deptId);
    const hT = pickNonRepeatingSingle(bank.hamzat.mutatarrifa, deptId);
    const hRemaining = [
      ...bank.hamzat.qata.filter(w => w.id !== hQ.id),
      ...bank.hamzat.mutawassita.filter(w => w.id !== hM.id),
      ...bank.hamzat.mutatarrifa.filter(w => w.id !== hT.id)
    ];
    const hExt = pickNonRepeatingSingle(hRemaining, deptId);
    items.push(hQ, hM, hT, hExt);
  }

  return items;
}

export const DEPARTMENTS: Record<DepartmentId, DepartmentData> = {
  // 1️⃣ قسم الأسماء (Department of Nouns - علامات الاسم الأربعة النموذجية)
  nouns: {
    id: 'nouns',
    titleAr: 'قسم الأسماء',
    titleEn: 'Department of Nouns',
    signTitle: 'سوبر ماركت الأسماء (علامات الاسم)',
    cartBadge: 'عربة الأسماء',
    missionSpeech: 'مهمتك: تسوّق الأسماء بحسب علاماتها الفارقة (التنوين، الـ التعريف، التاء المربوطة، والمثنى والجمع) بدقة تامة!',
    themeColor: 'from-amber-600 to-yellow-500',
    shelves: [
      {
        id: 'tanween',
        title: 'التَّنْوِين',
        icon: '🔔',
        color: '#f59e0b',
        awningBg: 'from-amber-400 via-amber-300 to-amber-500',
        badgeBg: 'bg-amber-100 text-amber-900 border-amber-300',
        targetCount: 4
      },
      {
        id: 'al_taareef',
        title: 'الـ التَّعْرِيف',
        icon: '🏷️',
        color: '#3b82f6',
        awningBg: 'from-blue-400 via-sky-300 to-blue-500',
        badgeBg: 'bg-blue-100 text-blue-900 border-blue-300',
        targetCount: 4
      },
      {
        id: 'taa_marbuta',
        title: 'التَّاء المَرْبُوطَة',
        icon: '🎀',
        color: '#ec4899',
        awningBg: 'from-pink-400 via-pink-300 to-pink-500',
        badgeBg: 'bg-pink-100 text-pink-900 border-pink-300',
        targetCount: 4
      },
      {
        id: 'muthanna_jam',
        title: 'المُثَنَّى وَالجَمْع',
        icon: '👥',
        color: '#10b981',
        awningBg: 'from-emerald-400 via-teal-300 to-emerald-500',
        badgeBg: 'bg-emerald-100 text-emerald-900 border-emerald-300',
        targetCount: 4
      }
    ],
    items: generateDepartmentSessionItems('nouns')
  },

  // 2️⃣ قسم الأفعال (Department of Verbs)
  verbs: {
    id: 'verbs',
    titleAr: 'قسم الأفعال',
    titleEn: 'Department of Verbs',
    signTitle: 'سوبر ماركت الأفعال',
    cartBadge: 'عربة الأفعال',
    missionSpeech: 'مهمتك: تسوّق الأفعال وصنّفها حسب زمنها (ماضٍ، مضارع، أمر، ومستقبل) بتنويع دقيق للصيغ والضمائر!',
    themeColor: 'from-emerald-700 to-teal-600',
    shelves: [
      {
        id: 'past',
        title: 'فِعْلٌ مَاضٍ',
        icon: '⏳',
        color: '#f97316',
        awningBg: 'from-orange-500 via-orange-400 to-amber-600',
        badgeBg: 'bg-orange-100 text-orange-900 border-orange-300',
        targetCount: 4
      },
      {
        id: 'present',
        title: 'فِعْلٌ مُضَارِعٌ',
        icon: '⚡',
        color: '#10b981',
        awningBg: 'from-emerald-500 via-teal-400 to-emerald-600',
        badgeBg: 'bg-emerald-100 text-emerald-900 border-emerald-300',
        targetCount: 4
      },
      {
        id: 'imperative',
        title: 'فِعْلُ أَمْرٍ',
        icon: '🎯',
        color: '#3b82f6',
        awningBg: 'from-blue-500 via-cyan-400 to-blue-600',
        badgeBg: 'bg-blue-100 text-blue-900 border-blue-300',
        targetCount: 4
      },
      {
        id: 'future',
        title: 'فِعْلُ المُسْتَقْبَل',
        icon: '🚀',
        color: '#8b5cf6',
        awningBg: 'from-purple-500 via-fuchsia-400 to-indigo-600',
        badgeBg: 'bg-purple-100 text-purple-900 border-purple-300',
        targetCount: 4
      }
    ],
    items: generateDepartmentSessionItems('verbs')
  },

  // 3️⃣ قسم الحروف (Department of Particles)
  particles: {
    id: 'particles',
    titleAr: 'قسم الحروف',
    titleEn: 'Department of Particles',
    signTitle: 'سوبر ماركت الحروف',
    cartBadge: 'عربة الحروف',
    missionSpeech: 'مهمتك: تصنيف أدوات وحروف العربية (الجر، العطف، الحروف الناسخة، وحروف نصب المضارع) بدقة تامة!',
    themeColor: 'from-blue-700 to-indigo-600',
    shelves: [
      {
        id: 'jar',
        title: 'حُرُوفُ الجَرّ',
        icon: '⚓',
        color: '#3b82f6',
        awningBg: 'from-blue-400 via-sky-300 to-blue-500',
        badgeBg: 'bg-blue-100 text-blue-900 border-blue-300',
        targetCount: 4
      },
      {
        id: 'atf',
        title: 'حُرُوفُ العَطْف',
        icon: '🔗',
        color: '#f59e0b',
        awningBg: 'from-amber-400 via-yellow-300 to-amber-500',
        badgeBg: 'bg-amber-100 text-amber-900 border-amber-300',
        targetCount: 4
      },
      {
        id: 'nasikh',
        title: 'الحُرُوفُ النَّاسِخَة',
        icon: '👑',
        color: '#10b981',
        awningBg: 'from-emerald-400 via-teal-300 to-emerald-500',
        badgeBg: 'bg-emerald-100 text-emerald-900 border-emerald-300',
        targetCount: 4
      },
      {
        id: 'nasb',
        title: 'حُرُوفُ نَصْبِ المُضَارِع',
        icon: '✂️',
        color: '#ef4444',
        awningBg: 'from-rose-400 via-red-300 to-rose-500',
        badgeBg: 'bg-rose-100 text-rose-900 border-rose-300',
        targetCount: 4
      }
    ],
    items: generateDepartmentSessionItems('particles')
  },

  // 4️⃣ قسم المهارات الإملائية (Department of Spelling Skills)
  spelling: {
    id: 'spelling',
    titleAr: 'قسم المهارات الإملائية',
    titleEn: 'Spelling Skills Department',
    signTitle: 'سوبر ماركت الإملاء والمهارات',
    cartBadge: 'عربة الإملاء',
    missionSpeech: 'مهمتك: فرز الكلمات بحسب مهاراتها الإملائية الظاهرة (التنوين، الشدة، المدود، والهمزات) دون أي تعارض!',
    themeColor: 'from-purple-700 to-pink-600',
    shelves: [
      {
        id: 'tanween',
        title: 'التَّنْوِين',
        icon: '🔔',
        color: '#f59e0b',
        awningBg: 'from-amber-400 via-amber-300 to-amber-500',
        badgeBg: 'bg-amber-100 text-amber-900 border-amber-300',
        targetCount: 4
      },
      {
        id: 'shaddah',
        title: 'الشَّدَّة',
        icon: '💪',
        color: '#10b981',
        awningBg: 'from-emerald-400 via-teal-300 to-emerald-500',
        badgeBg: 'bg-emerald-100 text-emerald-900 border-emerald-300',
        targetCount: 4
      },
      {
        id: 'mudood',
        title: 'المُدُود',
        icon: '🌊',
        color: '#06b6d4',
        awningBg: 'from-cyan-400 via-sky-300 to-cyan-500',
        badgeBg: 'bg-cyan-100 text-cyan-900 border-cyan-300',
        targetCount: 4
      },
      {
        id: 'hamzat',
        title: 'الهَمَزَات',
        icon: '⚡',
        color: '#f43f5e',
        awningBg: 'from-rose-400 via-pink-300 to-rose-500',
        badgeBg: 'bg-rose-100 text-rose-900 border-rose-300',
        targetCount: 4
      }
    ],
    items: generateDepartmentSessionItems('spelling')
  }
};

export const CARD_WIDTH_PCT = '6.8%';
export const CARD_HEIGHT_PCT = '5.6%';

// Coordinates for the 16 word cards scattered naturally across the supermarket floor
// Exact same size (CARD_WIDTH_PCT & CARD_HEIGHT_PCT) matching the shelf blank cards
// Placed in a realistic, organic, scattered distribution with natural rotation angles and overlapping depths
const FLOOR_SLOTS = [
  { left: '7.2%',  top: '74.2%', rotate: -8.5, zIndex: 12 },
  { left: '16.5%', top: '78.8%', rotate: 12.0, zIndex: 14 },
  { left: '23.8%', top: '71.5%', rotate: -5.0, zIndex: 11 },
  { left: '31.2%', top: '81.4%', rotate: 15.5, zIndex: 16 },
  { left: '38.0%', top: '73.0%', rotate: -11.0, zIndex: 13 },
  { left: '46.4%', top: '79.2%', rotate: 6.5,  zIndex: 15 },
  { left: '53.8%', top: '72.0%', rotate: -14.0, zIndex: 12 },
  { left: '61.5%', top: '80.5%', rotate: 10.0, zIndex: 17 },
  { left: '69.0%', top: '73.8%', rotate: -7.5, zIndex: 13 },
  { left: '76.8%', top: '82.0%', rotate: 13.5, zIndex: 16 },
  { left: '84.5%', top: '74.5%', rotate: -9.0, zIndex: 12 },
  { left: '11.8%', top: '86.2%', rotate: 8.0,  zIndex: 15 },
  { left: '26.4%', top: '88.0%', rotate: -12.5, zIndex: 14 },
  { left: '42.2%', top: '86.8%', rotate: 11.0, zIndex: 18 },
  { left: '58.6%', top: '87.5%', rotate: -6.0, zIndex: 13 },
  { left: '73.4%', top: '88.4%', rotate: 9.5,  zIndex: 15 },
];

interface KnowledgeSupermarketProps {
  onBack: () => void;
  lang?: 'ar' | 'en';
}

interface FlyingCardAnimation {
  item: WordItem;
  from: { left: string; top: string; width?: string; height?: string; angle: number };
  midLeft: string;
  midTop: string;
  to: { left: string; top: string; rotate: number };
  swirlAngle: number;
  delay: number;
  duration: number;
}

export interface ShelfSlotAudit {
  item: WordItem;
  placedShelfId: string;
  placedShelfTitle: string;
  correctShelfId: string;
  correctShelfTitle: string;
  isCorrect: boolean;
  explanation: string;
}

export const KnowledgeSupermarket: React.FC<KnowledgeSupermarketProps> = ({ onBack, lang = 'ar' }) => {
  const { profile } = useAuth();
  const studentName = profile?.displayName || (lang === 'ar' ? 'بطل العربية' : 'Arabic Champ');

  // Game Phases: 'intro' | 'aisle' | 'shopping' | 'checkout' | 'receipt'
  const [phase, setPhase] = useState<'intro' | 'aisle' | 'shopping' | 'checkout' | 'receipt'>('intro');
  const [selectedDeptId, setSelectedDeptId] = useState<DepartmentId>('nouns');
  const [soundOn, setSoundOn] = useState<boolean>(true);

  // Intro states: Headlights illuminated on orange car, then turning off + engine shutdown
  const [headlightsOn, setHeadlightsOn] = useState<boolean>(true);

  // Shopping Scene States: Cupboard slots & Scattered cards on floor
  const currentDept = DEPARTMENTS[selectedDeptId];

  // Determine student gender for appropriate Arabic honorifics & grammar
  const isFemaleStudent = (() => {
    const p = profile as any;
    if (p?.gender === 'female' || p?.gender === 'f' || p?.gender === 'أنثى' || p?.gender === 'طالبة') {
      return true;
    }
    if (!studentName) return false;
    const trimmed = studentName.trim();
    const firstWord = trimmed.split(/\s+/)[0];
    const femaleNames = new Set([
      'سارة', 'ساره', 'فاطمة', 'فاطمه', 'مريم', 'نورة', 'نوره', 'عائشة', 'عائشه', 'ليلى', 'ليلي',
      'ريم', 'ريما', 'سلمى', 'سلمي', 'هدى', 'هدي', 'خديجة', 'خديجه', 'زينب', 'منى', 'شهد',
      'جود', 'روان', 'رغد', 'أمل', 'امل', 'جنى', 'جني', 'هند', 'دانة', 'دانه', 'يارا',
      'تسنيم', 'آية', 'اية', 'أروى', 'اروى', 'حنين', 'بيان', 'لمى', 'رهف', 'تالا',
      'رزان', 'حصة', 'حصه', 'أسماء', 'اسماء', 'نجود', 'عبير', 'غادة', 'وفاء', 'دعاء',
      'ولاء', 'سناء', 'شروق', 'مروة', 'سمية', 'صفية', 'بشرى', 'إيمان', 'ايمان',
      'أفنان', 'افنان', 'ندى', 'شذى', 'خلود', 'رباب', 'جميلة', 'عفاف', 'ابتسام', 'إلهام'
    ]);
    if (femaleNames.has(firstWord)) return true;
    const maleNamesWithTaMarbuta = new Set(['حمزة', 'حمزه', 'أسامة', 'اسامة', 'اسامه', 'أسامه', 'طلحة', 'طلحه', 'معاوية', 'معاويه', 'عكرمة', 'عكرمه', 'قتادة', 'قتاده', 'عبيدة', 'عبيده', 'عنترة', 'عنتره', 'سلامة', 'سلامه']);
    if ((firstWord.endsWith('ة') || firstWord.endsWith('هـ')) && !maleNamesWithTaMarbuta.has(firstWord)) {
      return true;
    }
    const femaleMaqsura = new Set(['سلمى', 'هدى', 'بشرى', 'لبنى', 'مروى', 'ذكرى', 'رؤى', 'يسرى', 'شذى', 'نهى', 'سلوى']);
    if (femaleMaqsura.has(firstWord)) return true;
    return false;
  })();

  const volunteerRole = isFemaleStudent ? 'المتطوعة' : 'المتطوع';
  const volunteerEffort = isFemaleStudent ? 'لجهودها' : 'لجهوده';
  const deptDisplayName = currentDept.titleAr.startsWith('قسم ') ? currentDept.titleAr : `قسم ${currentDept.titleAr}`;
  const tvScreenText = `دكان المعرفة يشكر ${volunteerRole} ${studentName} ${volunteerEffort} في ترتيب أرفف ${deptDisplayName}`;

  // TV Screen Real-Time Dynamic Typewriter States
  const [typedTvText, setTypedTvText] = useState<string>('');
  const [isTvTextComplete, setIsTvTextComplete] = useState<boolean>(false);
  const [placedSlots, setPlacedSlots] = useState<Record<string, WordItem | null>>({});
  const [scatteredCards, setScatteredCards] = useState<WordItem[]>([]);
  const [selectedCardId, setSelectedCardId] = useState<string | null>(null);
  const [draggedCardId, setDraggedCardId] = useState<string | null>(null);

  // Cinematic AC & Wind Gust States
  const [windGustActive, setWindGustActive] = useState<boolean>(false);
  const [windStage, setWindStage] = useState<'idle' | 'calm' | 'warning' | 'gust' | 'landed'>('idle');
  const [flyingCards, setFlyingCards] = useState<FlyingCardAnimation[]>([]);
  const [showHelpBanner, setShowHelpBanner] = useState<boolean>(false);

  // Split AC Unit mounted above pink cupboard
  const [acPowered, setAcPowered] = useState<boolean>(false);
  const [acLouverOpen, setAcLouverOpen] = useState<boolean>(false);
  const [acBlowing, setAcBlowing] = useState<boolean>(false);

  // Smart Shelf Panoramic Laser Camera States
  const [isLaserScanning, setIsLaserScanning] = useState<boolean>(false);
  const [laserScanStep, setLaserScanStep] = useState<number>(0);
  const [realtimeScanIndex, setRealtimeScanIndex] = useState<number>(0);
  const [auditItems, setAuditItems] = useState<ShelfSlotAudit[]>([]);
  const laserTimersRef = useRef<NodeJS.Timeout[]>([]);

  // Aduok Ticket Printer States & Refs
  const [printerState, setPrinterState] = useState<'printing' | 'ready' | 'tearing' | 'torn'>('printing');
  const [barcodeBars, setBarcodeBars] = useState<Array<{ x: number; width: number }>>([]);
  const paperWrapperRef = useRef<HTMLDivElement>(null);
  const receiptElemRef = useRef<HTMLDivElement>(null);

  const clearLaserTimers = () => {
    laserTimersRef.current.forEach(t => clearTimeout(t));
    laserTimersRef.current = [];
  };

  const windTimersRef = useRef<NodeJS.Timeout[]>([]);

  const clearWindTimers = () => {
    windTimersRef.current.forEach(t => clearTimeout(t));
    windTimersRef.current = [];
  };

  useEffect(() => {
    return () => {
      clearWindTimers();
      clearLaserTimers();
      if (typeof document !== 'undefined') {
        document.querySelectorAll('.tear-clone').forEach(el => el.remove());
      }
    };
  }, []);

  // placedItems: { [shelfId: string]: WordItem[] } for receipt/checkout compatibility
  const [placedItems, setPlacedItems] = useState<Record<string, WordItem[]>>({
    [currentDept.shelves[0].id]: [],
    [currentDept.shelves[1].id]: [],
    [currentDept.shelves[2].id]: [],
    [currentDept.shelves[3].id]: []
  });

  // Checkout scanner states
  const [scannedIndex, setScannedIndex] = useState<number>(0);
  const [isScanningDone, setIsScanningDone] = useState<boolean>(false);

  // Departments completion tracker
  const [completedDepts, setCompletedDepts] = useState<Record<DepartmentId, boolean>>({
    nouns: false,
    verbs: false,
    particles: false,
    spelling: false
  });

  // Sound toggle effect
  const toggleSound = () => {
    const next = !soundOn;
    setSoundOn(next);
    audio.setEnabled(next);
  };

  // Preload department high-resolution interior background images for instant rendering
  useEffect(() => {
    [deptNounsBg, deptVerbsBg, deptParticlesBg, deptSpellingBg].forEach((src) => {
      const img = new Image();
      img.src = src;
    });
  }, []);

  // --------------------------------------------------------------------------
  // Preload and decode images in memory to prevent any screen switching delay
  useEffect(() => {
    ALL_PAGE_BACKGROUNDS.forEach(src => {
      if (src) {
        const img = new Image();
        img.src = src;
        if (img.decode) {
          img.decode().catch(() => {});
        }
      }
    });
  }, []);

  // INTRO ANIMATION TIMELINE (Rock-Solid Stable: Zero Unwanted Zoom-In)
  // --------------------------------------------------------------------------
  useEffect(() => {
    if (phase === 'intro') {
      audio.playCarArrival();
      setHeadlightsOn(true);
      
      // 1. After 1.7s: Headlights turn off + Engine shutdown sound!
      const t1 = setTimeout(() => {
        setHeadlightsOn(false);
        audio.playEngineShutdown();
      }, 1700);

      // 2. After 2.6s: Door slide sound
      const t2 = setTimeout(() => {
        audio.playDoorSlide();
      }, 2600);

      // 3. After 3.4s: Transition directly into the aisle hall smoothly!
      const t3 = setTimeout(() => {
        setPhase('aisle');
      }, 3400);

      return () => {
        clearTimeout(t1);
        clearTimeout(t2);
        clearTimeout(t3);
      };
    }
  }, [phase]);

  // Skip Intro button handler
  const handleSkipIntro = () => {
    setHeadlightsOn(false);
    audio.playDoorSlide();
    setPhase('aisle');
  };

  // Auto-arrange all 16 items into their designated cupboard dotted frames
  const autoArrangeCardsToShelves = (dept: DepartmentData) => {
    clearWindTimers();
    setWindGustActive(false);
    setWindStage('idle');
    setFlyingCards([]);
    setShowHelpBanner(false);

    const initSlots: Record<string, WordItem | null> = {};
    dept.shelves.forEach(s => {
      const shelfItems = dept.items.filter(item => item.categoryId === s.id);
      for (let i = 0; i < s.targetCount; i++) {
        initSlots[`${s.id}_${i}`] = shelfItems[i] || null;
      }
    });
    setPlacedSlots(initSlots);
    setScatteredCards([]);
    setSelectedCardId(null);
    setDraggedCardId(null);
    audio.playShelfDrop();
  };

  const scatterCardsToFloor = () => {
    clearWindTimers();
    setWindGustActive(false);
    setWindStage('idle');
    setFlyingCards([]);

    const allItems = [...currentDept.items].sort(() => Math.random() - 0.5);
    const emptySlots: Record<string, WordItem | null> = {};
    currentDept.shelves.forEach(s => {
      for (let i = 0; i < s.targetCount; i++) {
        emptySlots[`${s.id}_${i}`] = null;
      }
    });
    setPlacedSlots(emptySlots);
    setScatteredCards(allItems);
    setSelectedCardId(null);
    setDraggedCardId(null);
    audio.playShelfDrop();
  };

  // --------------------------------------------------------------------------
  // CINEMATIC AC UNIT ACTIVATION & ORGANIC CARD SCATTER ORCHESTRATION
  // --------------------------------------------------------------------------
  const triggerWindCinematic = (dept: DepartmentData) => {
    clearWindTimers();
    setShowHelpBanner(false);
    setFlyingCards([]);

    // Initial state: AC is in quiet standby on the wall above the pink cupboard
    setAcPowered(false);
    setAcLouverOpen(false);
    setAcBlowing(false);

    // Stage 1 (0.0s - 0.7s): Pristine calm order, all 16 cards in their shelf slots!
    const initSlots: Record<string, WordItem | null> = {};
    const itemsMap: Array<{ item: WordItem; slotKey: string; from: { left: string; top: string; width: string; height: string; angle: number } }> = [];
    
    // Exact per-shelf coordinates, dimensions, and angles matching each individual shelf:
    const slotDefs: Record<string, { left: string; top: string; width: string; height: string; angle: number }> = {
      // Pink Cupboard (Left, shelves[3])
      [`${dept.shelves[3].id}_0`]: { left: '5.8%', top: '30.1%', width: '7.2%', height: '5.8%', angle: 2.2 },
      [`${dept.shelves[3].id}_1`]: { left: '5.8%', top: '40.6%', width: '7.2%', height: '5.8%', angle: 2.0 },
      [`${dept.shelves[3].id}_2`]: { left: '5.9%', top: '50.9%', width: '7.0%', height: '5.7%', angle: -2.0 },
      [`${dept.shelves[3].id}_3`]: { left: '6.0%', top: '60.9%', width: '7.0%', height: '5.7%', angle: -2.2 },
      // Blue Cupboard (Center-Left, shelves[2])
      [`${dept.shelves[2].id}_0`]: { left: '32.0%', top: '34.2%', width: '6.6%', height: '5.4%', angle: 1.5 },
      [`${dept.shelves[2].id}_1`]: { left: '32.1%', top: '42.9%', width: '6.6%', height: '5.3%', angle: -2.2 },
      [`${dept.shelves[2].id}_2`]: { left: '32.0%', top: '51.3%', width: '6.6%', height: '5.3%', angle: -3.5 },
      [`${dept.shelves[2].id}_3`]: { left: '32.0%', top: '59.4%', width: '6.6%', height: '5.3%', angle: -3.0 },
      // Green Cupboard (Center-Right, shelves[1])
      [`${dept.shelves[1].id}_0`]: { left: '62.4%', top: '34.2%', width: '6.4%', height: '5.4%', angle: -2.4 },
      [`${dept.shelves[1].id}_1`]: { left: '62.4%', top: '42.9%', width: '6.4%', height: '5.3%', angle: -1.5 },
      [`${dept.shelves[1].id}_2`]: { left: '62.4%', top: '51.3%', width: '6.4%', height: '5.3%', angle: -3.5 },
      [`${dept.shelves[1].id}_3`]: { left: '62.4%', top: '59.4%', width: '6.4%', height: '5.3%', angle: -2.5 },
      // Yellow Cupboard (Right, shelves[0])
      [`${dept.shelves[0].id}_0`]: { left: '86.9%', top: '30.1%', width: '7.2%', height: '5.8%', angle: -3.2 },
      [`${dept.shelves[0].id}_1`]: { left: '86.9%', top: '40.6%', width: '7.2%', height: '5.8%', angle: -4.0 },
      [`${dept.shelves[0].id}_2`]: { left: '86.9%', top: '50.9%', width: '7.2%', height: '5.7%', angle: -3.0 },
      [`${dept.shelves[0].id}_3`]: { left: '87.0%', top: '60.9%', width: '7.1%', height: '5.7%', angle: 2.0 },
    };

    dept.shelves.forEach(s => {
      const shelfItems = dept.items.filter(item => item.categoryId === s.id);
      for (let i = 0; i < s.targetCount; i++) {
        const item = shelfItems[i] || null;
        const key = `${s.id}_${i}`;
        initSlots[key] = item;
        if (item && slotDefs[key]) {
          itemsMap.push({ item, slotKey: key, from: slotDefs[key] });
        }
      }
    });

    setPlacedSlots(initSlots);
    setScatteredCards([]);
    setSelectedCardId(null);
    setDraggedCardId(null);
    setWindGustActive(true);
    setWindStage('calm');

    // Stage 1 (T = 0.7s): AC Remote Beep! Green LED illuminates, 18°C display turns on!
    const t0 = setTimeout(() => {
      audio.playAcBeep();
      setAcPowered(true);
    }, 700);
    windTimersRef.current.push(t0);

    // Stage 2 (T = 1.2s): Motorized swing louver / air deflector flap opens smoothly downwards!
    const t1 = setTimeout(() => {
      audio.playAcLouverOpen();
      setAcLouverOpen(true);
    }, 1200);
    windTimersRef.current.push(t1);

    // Stage 3 (T = 1.6s): Centrifugal blower fan spins up! Realistic airflow rushing sound, cool mist begins
    // Cards on the shelves begin fluttering and shaking rapidly under the rush of air!
    const t2 = setTimeout(() => {
      setWindStage('warning');
      setAcBlowing(true);
      audio.playAcAirBlower();
    }, 1600);
    windTimersRef.current.push(t2);

    // Stage 4 (T = 2.7s): Blower reaches full velocity! After 1.1s of frantic card flutter,
    // Cards break free from the shelves and take flight with 3D fluttering arcs!
    const t3 = setTimeout(() => {
      setWindStage('gust');
      audio.playPaperScatter();

      // Empty shelf slots so subtle dotted frames remain beneath
      const emptySlots: Record<string, WordItem | null> = {};
      Object.keys(initSlots).forEach(k => { emptySlots[k] = null; });
      setPlacedSlots(emptySlots);

      // Shuffle items order for completely organic non-linear scatter
      const shuffledIndices = itemsMap.map((_, i) => i).sort(() => Math.random() - 0.5);

      const animated: FlyingCardAnimation[] = itemsMap.map((entry, idx) => {
        const targetFloor = FLOOR_SLOTS[idx % FLOOR_SLOTS.length];
        const shuffleRank = shuffledIndices.indexOf(idx);

        // Natural, randomized stagger delays (cards lift off in organic waves, not marching order)
        const organicDelay = (shuffleRank * 0.055) + (Math.random() * 0.35);

        // Organic mid-air 3D trajectory
        const fromX = parseFloat(entry.from.left);
        // Randomized peak float height (natural air turbulence)
        const midY = 13 + Math.random() * 24;
        // Natural horizontal wind drift
        const midX = Math.min(Math.max(fromX + (Math.random() * 28 - 14), 4), 92);

        // Varied natural tumbling angles and duration (comfortable to the eye)
        const swirlAngle = (Math.random() > 0.5 ? 1 : -1) * (16 + Math.random() * 28);
        const duration = 1.35 + Math.random() * 0.45;

        return {
          item: entry.item,
          from: entry.from,
          midLeft: `${midX.toFixed(1)}%`,
          midTop: `${midY.toFixed(1)}%`,
          to: targetFloor,
          swirlAngle,
          delay: organicDelay,
          duration
        };
      });

      setFlyingCards(animated);
    }, 2400);
    windTimersRef.current.push(t3);

    // T = 4.1s: Cards softly touch down on supermarket floor tiles
    const t5 = setTimeout(() => {
      audio.playPaperSoftLand();
    }, 4100);
    windTimersRef.current.push(t5);

    // T = 4.4s: Stage 5 (Finish): Settle all cards on the floor, ready to play! No popup banner!
    const t6 = setTimeout(() => {
      const allItems = [...dept.items];
      setScatteredCards(allItems);
      setFlyingCards([]);
      setWindGustActive(false);
      setWindStage('landed');
      setAcBlowing(false);
      setShowHelpBanner(false);
    }, 4400);
    windTimersRef.current.push(t6);
  };

  // Instant skip for the wind cutscene
  const handleSkipWind = () => {
    clearWindTimers();
    setWindGustActive(false);
    setWindStage('landed');
    setAcPowered(true);
    setAcLouverOpen(true);
    setAcBlowing(false);
    setFlyingCards([]);
    
    // Immediately scatter cards onto floor and empty shelf slots
    const emptySlots: Record<string, WordItem | null> = {};
    currentDept.shelves.forEach(s => {
      for (let i = 0; i < s.targetCount; i++) {
        emptySlots[`${s.id}_${i}`] = null;
      }
    });
    setPlacedSlots(emptySlots);
    setScatteredCards([...currentDept.items]);
    setShowHelpBanner(false);
    audio.playPaperSoftLand();
  };

  // --------------------------------------------------------------------------
  // DEPARTMENT SELECTION & SHOPPING INITIALIZATION
  // --------------------------------------------------------------------------
  const handleSelectDepartment = (deptId: DepartmentId) => {
    setSelectedDeptId(deptId);
    // توليد حزمة كلمات جديدة تماماً وغير مكررة في كل دخول إلى القسم
    DEPARTMENTS[deptId].items = generateDepartmentSessionItems(deptId);
    const dept = DEPARTMENTS[deptId];
    setPhase('shopping');
    triggerWindCinematic(dept);
  };

  // Sync placedItems whenever placedSlots changes for downstream receipt/checkout
  useEffect(() => {
    const sync: Record<string, WordItem[]> = {};
    currentDept.shelves.forEach(s => { sync[s.id] = []; });
    Object.entries(placedSlots).forEach(([slotKey, item]) => {
      if (item) {
        const shelfId = slotKey.split('_')[0];
        if (sync[shelfId]) sync[shelfId].push(item);
      }
    });
    setPlacedItems(sync);
  }, [placedSlots, currentDept]);

  // --------------------------------------------------------------------------
  // TACTILE DRAG & DROP / CLICK PLACEMENT (No annoying notifications)
  // --------------------------------------------------------------------------
  const placeCardInSlot = (cardId: string, slotKey: string) => {
    let card = scatteredCards.find(c => c.id === cardId);
    let prevKey: string | null = null;

    if (!card) {
      for (const [k, v] of Object.entries(placedSlots)) {
        if (v && v.id === cardId) {
          card = v;
          prevKey = k;
          break;
        }
      }
    }
    if (!card) return;

    const existingCardInSlot = placedSlots[slotKey] || null;

    setPlacedSlots(prev => {
      const next = { ...prev };
      if (prevKey) {
        next[prevKey] = existingCardInSlot;
      }
      next[slotKey] = card!;

      // Check if all 16 slots are now filled: if so, trigger smart panoramic laser camera scan!
      const totalPlacedAfter = Object.values(next).filter(Boolean).length;
      if (totalPlacedAfter >= 16) {
        setTimeout(() => {
          startShelfLaserScan(next);
        }, 400);
      }

      return next;
    });

    setScatteredCards(prev => {
      let next = prev.filter(c => c.id !== card!.id);
      if (existingCardInSlot && !prevKey) {
        next = [existingCardInSlot, ...next];
      }
      return next;
    });

    setSelectedCardId(null);
    setDraggedCardId(null);
    audio.playShelfDrop();
  };

  const returnCardToFloor = (slotKey: string) => {
    const card = placedSlots[slotKey];
    if (!card) return;

    setPlacedSlots(prev => ({
      ...prev,
      [slotKey]: null
    }));
    setScatteredCards(prev => [card, ...prev]);
    setSelectedCardId(null);
    setDraggedCardId(null);
    audio.playShelfDrop();
  };

  // --------------------------------------------------------------------------
  // SMART PANORAMIC LASER CAMERA & SHELF AUDIT SCANNING
  // --------------------------------------------------------------------------
  const computeAuditList = (customSlots?: Record<string, WordItem | null>): ShelfSlotAudit[] => {
    const slots = customSlots || placedSlots;
    const audits: ShelfSlotAudit[] = [];
    
    // Check all 16 items of currentDept so that all 16 words are ALWAYS accounted for in order!
    currentDept.items.forEach(item => {
      // Find if and where this item was placed
      let foundSlotKey: string | null = null;
      let placedShelfId: string | null = null;
      let placedShelfTitle = 'لم يُرتب على الرف';

      for (const [key, placedItem] of Object.entries(slots)) {
        if (placedItem && placedItem.id === item.id) {
          foundSlotKey = key;
          const [shelfId] = key.split('_');
          placedShelfId = shelfId;
          const shelf = currentDept.shelves.find(s => s.id === shelfId);
          if (shelf) placedShelfTitle = shelf.title;
          break;
        }
      }

      const correctShelf = currentDept.shelves.find(s => s.id === item.categoryId);
      const isCorrect = placedShelfId === item.categoryId;

      audits.push({
        item,
        placedShelfId: placedShelfId || 'unplaced',
        placedShelfTitle,
        correctShelfId: item.categoryId,
        correctShelfTitle: correctShelf?.title || 'الرف المطلوب',
        isCorrect,
        explanation: item.explanation
      });
    });

    return audits;
  };

  const generateBarcodeBars = (): Array<{ x: number; width: number }> => {
    let seed = 73052849;
    const rnd = () => (seed = (seed * 1664525 + 1013904223) >>> 0) / 4294967296;
    const bars: Array<{ x: number; width: number }> = [];
    let x = 0;
    while (x < 200) {
      const width = [1, 1, 2, 3][Math.floor(rnd() * 4)];
      if (x + width > 200) break;
      bars.push({ x, width });
      x += width + [1, 1, 2][Math.floor(rnd() * 3)];
    }
    return bars;
  };

  const startShelfLaserScan = (customSlots?: Record<string, WordItem | null>) => {
    clearLaserTimers();
    const audits = computeAuditList(customSlots);
    setAuditItems(audits);
    setIsLaserScanning(true);
    setLaserScanStep(1);
    setRealtimeScanIndex(0);
    audio.playCameraBeep();

    const total = audits.length;
    if (total === 0) {
      setIsLaserScanning(false);
      setPhase('receipt');
      return;
    }

    // Step duration per scanned word (snappy 220ms cadence)
    const stepMs = 220;
    for (let i = 0; i < total; i++) {
      const t = setTimeout(() => {
        setRealtimeScanIndex(i);
        audio.playBarcodeScan();
        const curr = audits[i];
        if (curr) {
          const shelfIdx = currentDept.shelves.findIndex(s => s.id === curr.placedShelfId);
          setLaserScanStep(shelfIdx >= 0 ? shelfIdx + 1 : 1);
        }
      }, 400 + i * stepMs);
      laserTimersRef.current.push(t);
    }

    // After all words have been scanned, finish and transition directly to Cashier Printer!
    const finishDelay = 400 + total * stepMs + 500;
    const tFinish = setTimeout(() => {
      audio.playKaChing();
      setIsLaserScanning(false);
      const allCorrect = audits.every(a => a.isCorrect);
      setCompletedDepts(prev => ({ ...prev, [selectedDeptId]: allCorrect }));
      setPhase('receipt');
    }, finishDelay);
    laserTimersRef.current.push(tFinish);
  };

  const handleSkipLaserScan = () => {
    clearLaserTimers();
    setIsLaserScanning(false);
    const audits = auditItems.length > 0 ? auditItems : computeAuditList();
    setAuditItems(audits);
    const allCorrect = audits.every(a => a.isCorrect);
    setCompletedDepts(prev => ({ ...prev, [selectedDeptId]: allCorrect }));
    setPhase('receipt');
  };

  // High-Definition Ultra-Crisp PDF Downloader for Receipt
  const downloadReceiptPdf = async (receiptEl: HTMLElement) => {
    try {
      const canvas = await html2canvas(receiptEl, {
        scale: 3.5,
        useCORS: true,
        backgroundColor: '#ffffff',
        logging: false,
        imageTimeout: 0,
      });
      const imgData = canvas.toDataURL('image/png');
      const imgWidthMm = 95;
      const imgHeightMm = (canvas.height * imgWidthMm) / canvas.width;
      
      const pdf = new jsPDF({
        orientation: 'portrait',
        unit: 'mm',
        format: [imgWidthMm, imgHeightMm + 4],
      });
      
      pdf.addImage(imgData, 'PNG', 0, 2, imgWidthMm, imgHeightMm, undefined, 'FAST');
      pdf.save(`ايصال_دكان_المعرفة_${studentName || 'المتطوع'}.pdf`);
    } catch (err) {
      console.error('PDF export error:', err);
    }
  };

  // Aduok Ticket Printer Engine
  const startPrint = () => {
    setPrinterState('printing');
    if (typeof document !== 'undefined') {
      document.querySelectorAll('.tear-clone').forEach(el => el.remove());
    }

    if (!paperWrapperRef.current || !receiptElemRef.current) return;
    receiptElemRef.current.style.display = 'block';
    paperWrapperRef.current.style.transform = '';

    const H = paperWrapperRef.current.offsetHeight || 320;
    const N = 16;
    const kf: Keyframe[] = [{ transform: `translateY(${-H}px)`, offset: 0 }];

    for (let i = 1; i <= N; i++) {
      const hold = i === N ? 0 : 0.18 + Math.random() * 0.3;
      const start = (i - 1) / N, end = i / N;
      const moveEnd = start + (end - start) * (1 - hold);
      const y = -H * (1 - i / N);

      kf.push({ transform: `translateY(${y}px)`, offset: i === N ? 1 : moveEnd });
      if (i !== N) kf.push({ transform: `translateY(${y}px)`, offset: end });
    }

    for (let k = 0; k < kf.length - 1; k++) {
      kf[k].easing = kf[k].transform === kf[k + 1].transform ? "linear" : "cubic-bezier(.45,0,.25,1)";
    }

    audio.playReceiptPrint();
    const anim = paperWrapperRef.current.animate(kf, { duration: 3800, fill: "forwards" });
    anim.onfinish = () => {
      if (paperWrapperRef.current) {
        paperWrapperRef.current.style.transform = "translateY(0)";
      }
      anim.cancel();
      setPrinterState('ready');
      confetti({ particleCount: 70, spread: 65, origin: { y: 0.55 } });
    };
  };

  useEffect(() => {
    if (phase === 'receipt' || phase === 'checkout') {
      setBarcodeBars(generateBarcodeBars());
      setTypedTvText('');
      setIsTvTextComplete(false);

      let currentIdx = 0;
      const fullText = tvScreenText;
      let typeInterval: NodeJS.Timeout | null = null;
      let printTimer: NodeJS.Timeout | null = null;

      // Small initial delay so student sees TV activate
      const startTimer = setTimeout(() => {
        typeInterval = setInterval(() => {
          currentIdx++;
          setTypedTvText(fullText.slice(0, currentIdx));
          if (currentIdx >= fullText.length) {
            if (typeInterval) clearInterval(typeInterval);
            setIsTvTextComplete(true);
            // Brief moment for student to read the complete message before receipt ejects
            printTimer = setTimeout(() => {
              startPrint();
            }, 750);
          }
        }, 40);
      }, 350);

      return () => {
        clearTimeout(startTimer);
        if (typeInterval) clearInterval(typeInterval);
        if (printTimer) clearTimeout(printTimer);
      };
    } else {
      setTypedTvText('');
      setIsTvTextComplete(false);
    }
  }, [phase, tvScreenText]);

  const tearReceipt = () => {
    if (printerState !== 'ready') return;
    
    const receipt = receiptElemRef.current;
    if (!receipt) return;

    // Immediately trigger silent automatic download of the receipt as PDF!
    downloadReceiptPdf(receipt);

    audio.playPaperTear();
    setPrinterState('tearing');

    const r = receipt.getBoundingClientRect();
    const perf = receipt.querySelector('.perf') as HTMLElement | null;
    const pr = perf ? perf.getBoundingClientRect() : { top: r.top + r.height / 2, height: 2 };
    const ty = pr.top - r.top + pr.height / 2;
    const W = r.width;
    const H = r.height;

    // Create zigzag jagged cut path
    const pts: [number, number][] = [];
    for (let x = W; x > 0; x -= 8 + Math.random() * 5) {
      pts.push([x, ty + (pts.length % 2 ? 3 : -3) + (Math.random() - 0.5) * 3]);
    }
    pts.push([0, ty]);

    const edgeRtl = pts.map(p => `${p[0]}px ${p[1]}px`).join(",");
    const edgeLtr = pts.slice().reverse().map(p => `${p[0]}px ${p[1]}px`).join(",");

    const topPoly = `polygon(0px 0px, ${W}px 0px, ${edgeRtl})`;
    const botPoly = `polygon(${edgeLtr}, ${W}px ${H}px, 0px ${H}px)`;

    receipt.style.display = 'none';

    const createClone = (polygon: string) => {
      const wrapper = document.createElement('div');
      wrapper.className = 'tear-clone';
      wrapper.style.position = 'fixed';
      wrapper.style.left = `${r.left}px`;
      wrapper.style.top = `${r.top}px`;
      wrapper.style.width = `${r.width}px`;
      wrapper.style.height = `${r.height}px`;
      wrapper.style.zIndex = '1000';
      wrapper.style.pointerEvents = 'none';
      wrapper.style.clipPath = polygon;
      (wrapper.style as any).webkitClipPath = polygon;

      const inner = receipt.cloneNode(true) as HTMLElement;
      inner.style.display = 'block';
      inner.style.position = 'absolute';
      inner.style.top = '0';
      inner.style.left = '0';
      inner.style.width = '100%';
      inner.style.height = '100%';
      inner.style.boxSizing = 'border-box';

      wrapper.appendChild(inner);
      return wrapper;
    };

    const cloneTop = createClone(topPoly);
    const cloneBot = createClone(botPoly);
    document.body.appendChild(cloneTop);
    document.body.appendChild(cloneBot);

    const vw = window.innerWidth;
    const vh = window.innerHeight;

    cloneTop.animate([
      { transform: "none", offset: 0 },
      { transform: "translate(-8px,-14px) rotate(-3deg)", offset: 0.16 },
      { transform: `translate(${-vw * 0.35}px,${-(r.top + H + 180)}px) rotate(-26deg)` }
    ], { duration: 850, fill: "forwards" });

    cloneBot.animate([
      { transform: "none", offset: 0 },
      { transform: "translate(10px,12px) rotate(4deg)", offset: 0.16 },
      { transform: `translate(${vw * 0.35}px,${vh - r.top + 180}px) rotate(22deg)` }
    ], { duration: 950, fill: "forwards" }).onfinish = () => {
      setPrinterState('torn');
      confetti({ particleCount: 110, spread: 80, origin: { y: 0.55 } });
    };
  };

  // Total shopping statistics
  const totalCorrectPlaced = auditItems.filter(a => a.isCorrect).length;
  const totalRequired = currentDept.shelves.reduce((sum, s) => sum + s.targetCount, 0);

  // --------------------------------------------------------------------------
  // RENDER: SCENE 1 - PARKING INTRO
  // --------------------------------------------------------------------------
  if (phase === 'intro') {
    return (
      <div className="relative w-full h-full min-h-screen bg-slate-950 overflow-hidden flex items-center justify-center font-sans select-none" dir="rtl">
        {/* Full-Width Uncut Parked Car Background Image */}
        <img 
          src={parkingIntroImg} 
          alt="Supermarket Parking"
          loading="eager"
          decoding="sync"
          className="absolute inset-0 w-full h-full object-fill select-none pointer-events-none"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-black/25 pointer-events-none" />

        {/* Top-Right Return/Exit Arrow (Icon Only - Single Unified Navigation) */}
        <div className="absolute top-4 right-4 z-50 pointer-events-auto">
          <button 
            onClick={onBack}
            className="p-2.5 bg-black/60 hover:bg-black/85 backdrop-blur-md border border-white/20 text-white rounded-xl shadow-xl transition active:scale-95 cursor-pointer flex items-center justify-center"
            title="العودة"
            aria-label="العودة"
          >
            <ArrowRight size={18} />
          </button>
        </div>

        {/* Floating Sound Toggle at Bottom-Left of the Screen */}
        <button 
          onClick={toggleSound}
          className="fixed bottom-6 left-6 z-50 p-3.5 bg-black/65 hover:bg-black/85 backdrop-blur-md border border-white/25 text-white rounded-2xl shadow-[0_10px_30px_rgba(0,0,0,0.8)] transition transform active:scale-90"
          title="كتم/تشغيل الصوت"
        >
          {soundOn ? <Volume2 size={20} className="text-amber-400" /> : <VolumeX size={20} className="text-red-400" />}
        </button>

        {/* 
          CINEMATIC HIGH-END AUTOMOTIVE OPTICAL LIGHTING (SVG Volumetric Shader & Lens Flares)
          Engineered with soft Gaussian falloff, true lens flares, and asphalt ground illumination:
          - Left Headlamp: 44.0%, 72.1%
          - Right Headlamp: 48.7%, 72.1%
        */}
        <div 
          className={`absolute inset-0 z-20 pointer-events-none transition-opacity duration-700 ${
            headlightsOn ? 'opacity-100' : 'opacity-0'
          }`}
        >
          <svg 
            className="w-full h-full pointer-events-none" 
            viewBox="0 0 1000 1000" 
            preserveAspectRatio="none"
          >
            <defs>
              {/* Natural Optical Gaussian Blur Filters */}
              <filter id="softBeamBlur" x="-30%" y="-30%" width="160%" height="160%">
                <feGaussianBlur stdDeviation="15" />
              </filter>
              <filter id="coreGlowBlur" x="-50%" y="-50%" width="200%" height="200%">
                <feGaussianBlur stdDeviation="7" />
              </filter>
              <filter id="roadAsphaltBlur" x="-40%" y="-40%" width="180%" height="180%">
                <feGaussianBlur stdDeviation="24" />
              </filter>

              {/* Natural Volumetric Headlight Beams (Inverse-Square Optical Falloff) */}
              <linearGradient id="leftHeadlightBeam" x1="0%" y1="0%" x2="60%" y2="100%">
                <stop offset="0%" stopColor="#ffffff" stopOpacity="0.95" />
                <stop offset="12%" stopColor="#fef08a" stopOpacity="0.75" />
                <stop offset="40%" stopColor="#fde047" stopOpacity="0.38" />
                <stop offset="70%" stopColor="#f59e0b" stopOpacity="0.12" />
                <stop offset="100%" stopColor="#f59e0b" stopOpacity="0" />
              </linearGradient>

              <linearGradient id="rightHeadlightBeam" x1="0%" y1="0%" x2="65%" y2="100%">
                <stop offset="0%" stopColor="#ffffff" stopOpacity="0.95" />
                <stop offset="12%" stopColor="#fef08a" stopOpacity="0.75" />
                <stop offset="40%" stopColor="#fde047" stopOpacity="0.38" />
                <stop offset="70%" stopColor="#f59e0b" stopOpacity="0.12" />
                <stop offset="100%" stopColor="#f59e0b" stopOpacity="0" />
              </linearGradient>

              {/* Asphalt Ground Reflection Pools */}
              <radialGradient id="asphaltGroundGlow" cx="50%" cy="50%" r="50%">
                <stop offset="0%" stopColor="#fef9c3" stopOpacity="0.75" />
                <stop offset="35%" stopColor="#fde047" stopOpacity="0.35" />
                <stop offset="70%" stopColor="#f59e0b" stopOpacity="0.1" />
                <stop offset="100%" stopColor="#f59e0b" stopOpacity="0" />
              </radialGradient>
            </defs>

            {/* 1. Asphalt Ground Light Pools (Road Surface Illumination in front of car) */}
            <ellipse cx="510" cy="860" rx="135" ry="55" fill="url(#asphaltGroundGlow)" filter="url(#roadAsphaltBlur)" opacity="0.95" style={{ mixBlendMode: 'screen' }} />
            <ellipse cx="590" cy="875" rx="150" ry="60" fill="url(#asphaltGroundGlow)" filter="url(#roadAsphaltBlur)" opacity="0.95" style={{ mixBlendMode: 'screen' }} />

            {/* 2. Soft Volumetric Light Cones Projecting onto Road Surface */}
            {/* Left Beam Cone: Emerges from (440, 722) */}
            <path 
              d="M 436 718 L 444 725 L 610 935 L 390 910 Z" 
              fill="url(#leftHeadlightBeam)" 
              filter="url(#softBeamBlur)" 
              style={{ mixBlendMode: 'screen' }} 
            />

            {/* Right Beam Cone: Emerges from (487, 721) */}
            <path 
              d="M 483 717 L 491 724 L 725 945 L 505 925 Z" 
              fill="url(#rightHeadlightBeam)" 
              filter="url(#softBeamBlur)" 
              style={{ mixBlendMode: 'screen' }} 
            />

            {/* 3. Luminous Optical Bulbs & Anamorphic Blue-White Flares */}
            {/* Left Lamp (440, 722) */}
            <circle cx="440" cy="722" r="13" fill="#ffffff" filter="url(#coreGlowBlur)" style={{ mixBlendMode: 'screen' }} />
            <circle cx="440" cy="722" r="26" fill="#fef08a" opacity="0.8" filter="url(#coreGlowBlur)" style={{ mixBlendMode: 'screen' }} />
            <ellipse cx="440" cy="722" rx="70" ry="2.5" fill="#e0f2fe" opacity="0.85" filter="url(#coreGlowBlur)" style={{ mixBlendMode: 'screen' }} />

            {/* Right Lamp (487, 721) */}
            <circle cx="487" cy="721" r="13" fill="#ffffff" filter="url(#coreGlowBlur)" style={{ mixBlendMode: 'screen' }} />
            <circle cx="487" cy="721" r="26" fill="#fef08a" opacity="0.8" filter="url(#coreGlowBlur)" style={{ mixBlendMode: 'screen' }} />
            <ellipse cx="487" cy="721" rx="70" ry="2.5" fill="#e0f2fe" opacity="0.85" filter="url(#coreGlowBlur)" style={{ mixBlendMode: 'screen' }} />
          </svg>
        </div>
      </div>
    );
  }

  // --------------------------------------------------------------------------
  // RENDER: SCENE 2 - SUPERMARKET MAIN AISLE (Strict Pixel-Perfect Hotspots on Background Signs)
  // --------------------------------------------------------------------------
  if (phase === 'aisle') {
    // Strictly calibrated to cover the ENTIRE wooden board for each department:
    // 1. قسم الأسماء (Nouns) - Top sign
    // 2. قسم الأفعال (Verbs) - Second sign
    // 3. قسم الحروف (Particles) - Third sign
    // 4. قسم المهارات الإملائية (Spelling) - Fourth sign
    // Strictly calibrated to the exact physical pixels of the wooden signs:
    // dokan-almaarifa-02-four-depth-signs.png (2560 x 1440):
    // Board 1 (الأسماء): y=25..215 (top: 1.7%, height: 13.2%), x=820..1740 (left: 32.0%, width: 36.0%)
    // [GAP: y=215..258 (2.99%)]
    // Board 2 (الأفعال): y=258..338 (top: 17.9%, height: 5.6%), x=900..1660 (left: 35.1%, width: 29.8%)
    // [GAP: y=338..352 (0.97%)]
    // Board 3 (الحروف): y=352..430 (top: 24.4%, height: 5.5%), x=920..1640 (left: 35.9%, width: 28.2%)
    // [GAP: y=430..442 (0.83%)]
    // Board 4 (المهارات الإملائية): y=442..528 (top: 30.7%, height: 6.0%), x=960..1600 (left: 37.5%, width: 25.0%)
    const boardsConfig: {
      id: DepartmentId;
      title: string;
      left: string;
      top: string;
      width: string;
      height: string;
    }[] = [
      {
        id: 'nouns',
        title: 'قسم الأسماء',
        left: '32.0%',
        top: '1.7%',
        width: '36.0%',
        height: '13.2%'
      },
      {
        id: 'verbs',
        title: 'قسم الأفعال',
        left: '35.1%',
        top: '17.9%',
        width: '29.8%',
        height: '5.6%'
      },
      {
        id: 'particles',
        title: 'قسم الحروف',
        left: '35.9%',
        top: '24.4%',
        width: '28.2%',
        height: '5.5%'
      },
      {
        id: 'spelling',
        title: 'قسم المهارات الإملائية',
        left: '37.5%',
        top: '30.7%',
        width: '25.0%',
        height: '6.0%'
      }
    ];

    return (
      <div className="relative w-full h-full min-h-screen bg-slate-950 overflow-hidden flex items-center justify-center font-sans select-none" dir="rtl">
        {/* All four hotspots share the source artwork's exact 16:9 coordinate system. */}
        <div className="absolute inset-0 m-auto w-full max-h-full aspect-video" style={{ maxWidth: 'calc(100vh * 16 / 9)' }}>
        {/* Full-Width Uncut Supermarket Grand Aisle Image */}
        <img 
          src={aisleHallImg} 
          alt="Supermarket Aisle"
          loading="eager"
          decoding="sync"
          className="absolute inset-0 w-full h-full object-fill select-none pointer-events-none"
        />

        {/* Completely Invisible Clickable Hotspots: Zero frames, zero borders */}
        {boardsConfig.map(({ id, title, left, top, width, height }) => {
          const isCompleted = completedDepts[id];
          return (
            <button
              key={id}
              type="button"
              onClick={() => handleSelectDepartment(id)}
              style={{
                left,
                top,
                width,
                height
              }}
              className="absolute cursor-pointer bg-transparent border-0 outline-none select-none focus:outline-none hover:bg-white/[0.06] active:scale-[0.99] transition-all rounded-xl"
              title={title}
              aria-label={title}
            >
              {isCompleted && (
                <span className="absolute top-1/2 -translate-y-1/2 left-3 bg-emerald-500 text-slate-950 rounded-full p-1 shadow-lg pointer-events-none">
                  <CheckCircle2 size={16} />
                </span>
              )}
            </button>
          );
        })}

        </div>

        {/* Top-Right Return Arrow (Unified Exit to Games List) */}
        <div className="absolute top-4 right-4 z-50 pointer-events-auto">
          <button 
            onClick={onBack}
            className="p-2.5 bg-black/60 hover:bg-black/85 backdrop-blur-md border border-white/20 text-white rounded-xl shadow-xl transition active:scale-95 cursor-pointer flex items-center justify-center"
            title="العودة"
            aria-label="العودة"
          >
            <ArrowRight size={18} />
          </button>
        </div>

        {/* Floating Sound Toggle at Bottom-Left */}
        <button 
          onClick={toggleSound}
          className="fixed bottom-6 left-6 z-50 p-3.5 bg-black/65 hover:bg-black/85 backdrop-blur-md border border-white/25 text-amber-400 rounded-2xl shadow-[0_10px_30px_rgba(0,0,0,0.8)] transition transform active:scale-90"
          title="كتم/تشغيل الصوت"
        >
          {soundOn ? <Volume2 size={22} className="text-amber-400" /> : <VolumeX size={22} className="text-red-400" />}
        </button>
      </div>
    );
  }

  // --------------------------------------------------------------------------
  // RENDER: SCENE 3 - TACTILE CUPBOARD SHELVES & SCATTERED FLOOR CARDS (Pure Background Artwork)
  // --------------------------------------------------------------------------
  if (phase === 'shopping') {
    const totalPlaced = Object.values(placedSlots).filter(Boolean).length;
    const isAllPlaced = totalPlaced >= 16;

    // Cupboards mapped in Arabic RTL reading order across the room
    // Each of the 16 slots is individually calibrated with millimeter rigor to be centered exactly inside each shelf frame
    const cupboards = [
      { 
        shelf: currentDept.shelves[3], // Screen Left (Pink in Nouns)
        headerCenter: '9.4%',
        slots: [
          { rowIndex: 0, left: '5.8%', top: '30.1%', width: '7.2%', height: '5.8%', angle: 2.2 },
          { rowIndex: 1, left: '5.8%', top: '40.6%', width: '7.2%', height: '5.8%', angle: 2.0 },
          { rowIndex: 2, left: '5.9%', top: '50.9%', width: '7.0%', height: '5.7%', angle: -2.0 },
          { rowIndex: 3, left: '6.0%', top: '60.9%', width: '7.0%', height: '5.7%', angle: -2.2 },
        ]
      },
      { 
        shelf: currentDept.shelves[2], // Screen Center-Left (Blue in Nouns)
        headerCenter: '35.4%',
        slots: [
          { rowIndex: 0, left: '32.0%', top: '34.2%', width: '6.6%', height: '5.4%', angle: 1.5 },
          { rowIndex: 1, left: '32.1%', top: '42.9%', width: '6.6%', height: '5.3%', angle: -2.2 },
          { rowIndex: 2, left: '32.0%', top: '51.3%', width: '6.6%', height: '5.3%', angle: -3.5 },
          { rowIndex: 3, left: '32.0%', top: '59.4%', width: '6.6%', height: '5.3%', angle: -3.0 },
        ]
      },
      { 
        shelf: currentDept.shelves[1], // Screen Center-Right (Green in Nouns)
        headerCenter: '65.2%',
        slots: [
          { rowIndex: 0, left: '62.4%', top: '34.2%', width: '6.4%', height: '5.4%', angle: -2.4 },
          { rowIndex: 1, left: '62.4%', top: '42.9%', width: '6.4%', height: '5.3%', angle: -1.5 },
          { rowIndex: 2, left: '62.4%', top: '51.3%', width: '6.4%', height: '5.3%', angle: -3.5 },
          { rowIndex: 3, left: '62.4%', top: '59.4%', width: '6.4%', height: '5.3%', angle: -2.5 },
        ]
      },
      { 
        shelf: currentDept.shelves[0], // Screen Right (Yellow in Nouns)
        headerCenter: '90.4%',
        slots: [
          { rowIndex: 0, left: '86.9%', top: '30.1%', width: '7.2%', height: '5.8%', angle: -3.2 },
          { rowIndex: 1, left: '86.9%', top: '40.6%', width: '7.2%', height: '5.8%', angle: -4.0 },
          { rowIndex: 2, left: '86.9%', top: '50.9%', width: '7.2%', height: '5.7%', angle: -3.0 },
          { rowIndex: 3, left: '87.0%', top: '60.9%', width: '7.1%', height: '5.7%', angle: 2.0 },
        ]
      },
    ];

    return (
      <div className="relative w-full h-full min-h-screen bg-slate-950 overflow-hidden flex flex-col items-center justify-center font-sans select-none" dir="rtl">
        {/* Custom Keyframes for Micro-Flutter, Card Shake on Shelves, and Atmospheric AC Mist */}
        <style>{`
          @keyframes cardFlutterShake {
            0% { transform: translate(0px, 0px) rotate(0deg); }
            15% { transform: translate(-2.5px, 1.5px) rotate(-2.5deg) scale(1.03); }
            30% { transform: translate(2.5px, -1.8px) rotate(2.8deg) scale(1.04); }
            45% { transform: translate(-2px, -1.5px) rotate(-2.2deg) scale(1.02); }
            60% { transform: translate(2.2px, 1.2px) rotate(2.2deg) scale(1.04); }
            75% { transform: translate(-1.8px, 1.6px) rotate(-1.8deg) scale(1.03); }
            90% { transform: translate(1.5px, -1.2px) rotate(1.5deg) scale(1.02); }
            100% { transform: translate(0px, 0px) rotate(0deg); }
          }
          @keyframes cardJitter {
            0% { transform: translate(-1.2px, 0.4px) rotate(-0.6deg); }
            100% { transform: translate(1.2px, -0.4px) rotate(0.6deg); }
          }
          @keyframes acMistFlow {
            0% { transform: translate(0, 0) scale(0.92); opacity: 0; }
            25% { opacity: 0.65; }
            70% { opacity: 0.40; }
            100% { transform: translate(-65px, 85px) scale(1.28); opacity: 0; }
          }
          @keyframes acMistWave {
            0% { transform: translateX(0) scaleY(1); opacity: 0.25; }
            50% { transform: translateX(-30px) scaleY(1.08); opacity: 0.55; }
            100% { transform: translateX(-60px) scaleY(1); opacity: 0; }
          }
          @keyframes laserSparkBurst {
            0% { transform: scale(0.6) rotate(0deg); opacity: 1; }
            50% { transform: scale(1.4) rotate(180deg); opacity: 0.85; }
            100% { transform: scale(0.8) rotate(360deg); opacity: 1; }
          }
        `}</style>

        {/* Full-Width Uncut Department Container (100% Width & Height, Zero Side Crops) */}
        <div className="relative w-full h-full min-h-screen overflow-hidden">
          {/* Full-Width Department Background Image */}
          <img 
            src={DEPARTMENT_BACKGROUNDS[selectedDeptId] || shelvesBackdropImg}
            alt={currentDept.titleAr}
            loading="eager"
            decoding="sync"
            className="absolute inset-0 w-full h-full object-fill select-none pointer-events-none"
          />

          {/* Single Top-Right Return Arrow Button */}
          <button 
            onClick={() => setPhase('aisle')}
            className="absolute top-4 right-4 z-50 p-2.5 bg-black/60 hover:bg-black/85 backdrop-blur-md text-white rounded-xl border border-white/20 shadow-2xl transition active:scale-95 cursor-pointer flex items-center justify-center pointer-events-auto"
            title="العودة"
            aria-label="العودة"
          >
            <ArrowRight size={18} />
          </button>

          {/* 1️⃣ Realistic Industrial CCTV Surveillance Camera (Mounted Top-Left above Pink Cupboard) */}
          {/* Angled down & right to physically scan and sweep all 4 cupboards and floor. Pure camera look, NO text specs. */}
          <div 
            style={{ left: '5.2%', top: '3.4%', width: '9.5%', height: '8.8%' }}
            className="absolute z-40 select-none pointer-events-auto"
            title="كاميرا المراقبة والمسح الليزري"
          >
            {/* Soft Ambient Wall Drop Shadow */}
            <div className="absolute inset-0 bg-black/75 rounded-full blur-[7px] transform translate-y-2 translate-x-1 scale-95" />

            {/* Heavy-duty CCTV Mounting Bracket Arm (Anchored to Ceiling/Wall) */}
            <div className="absolute -top-3 left-1/2 transform -translate-x-1/2 w-4 h-5 bg-gradient-to-b from-slate-900 via-slate-800 to-slate-700 rounded-t-sm shadow-md border-t border-slate-600/80 z-10 flex flex-col items-center">
              <div className="w-6 h-1.5 bg-slate-800 rounded-sm border-t border-slate-500 shadow-sm" />
              {/* Articulated swivel ball knuckle */}
              <div className="w-3.5 h-3.5 rounded-full bg-gradient-to-r from-slate-700 via-slate-600 to-slate-800 shadow-inner mt-1 border border-slate-600" />
            </div>

            {/* True Cylindrical/Bullet CCTV Camera Housing with Sunshield Visor and Pivoting Gimbal Angle */}
            <motion.div 
              animate={isLaserScanning ? { rotate: [21, 26, 22], scale: [1, 1.02, 1] } : { rotate: [22, 23, 22] }}
              transition={isLaserScanning ? { repeat: Infinity, duration: 1.2, ease: 'easeInOut' } : { duration: 2 }}
              style={{ transformOrigin: 'top center' }}
              className="relative w-full h-full flex items-center justify-center pt-2"
            >
              {/* Aerodynamic Weather Visor / Sun Shield Hood on top of camera */}
              <div className="absolute -top-0.5 left-1/2 transform -translate-x-1/2 w-[85%] h-2.5 bg-gradient-to-b from-slate-800 via-slate-700 to-slate-900 rounded-t-md shadow-md border-t border-slate-500/70 z-20" />

              {/* Main Camera Barrel (Graphite Dark Polymer & Brushed Metal Cylindrical Casing) */}
              <div className="relative w-11 h-11 md:w-12 md:h-12 rounded-full bg-gradient-to-b from-slate-800 via-slate-900 to-black p-[2.5px] shadow-[0_10px_25px_rgba(0,0,0,0.8),inset_0_2px_4px_rgba(255,255,255,0.25)] border border-slate-600/80">
                {/* Metallic Bezel Collar Ring */}
                <div className="w-full h-full rounded-full bg-gradient-to-tr from-slate-950 via-slate-900 to-slate-850 p-[2px] flex items-center justify-center relative shadow-inner">
                  
                  {/* Concentric Circular Ring of 12 Infrared Night-Vision LEDs around the Lens */}
                  {[0, 30, 60, 90, 120, 150, 180, 210, 240, 270, 300, 330].map((deg) => (
                    <div 
                      key={deg}
                      style={{
                        position: 'absolute',
                        width: '2px',
                        height: '2px',
                        borderRadius: '50%',
                        backgroundColor: isLaserScanning ? '#ef4444' : '#64748b',
                        boxShadow: isLaserScanning ? '0 0 4px #ef4444' : 'none',
                        transform: `rotate(${deg}deg) translate(14px) rotate(-${deg}deg)`
                      }}
                    />
                  ))}

                  {/* Optical Precision Glass Lens Element */}
                  <div className="w-6 h-6 md:w-7 md:h-7 rounded-full bg-black border border-cyan-500/40 relative flex items-center justify-center overflow-hidden shadow-[inset_0_0_8px_rgba(0,0,0,1)]">
                    {/* Multi-Coated Violet/Emerald Reflection Flare */}
                    <div className="absolute top-0.5 left-0.5 w-2.5 h-1.5 bg-cyan-400/35 rounded-full blur-[0.5px]" />
                    <div className="absolute bottom-1 right-1 w-2 h-1 bg-purple-500/30 rounded-full blur-[0.5px]" />

                    {/* Laser Diode Emitter Aperture at Center */}
                    <div className={`w-2.5 h-2.5 rounded-full transition-all duration-300 relative flex items-center justify-center ${
                      isLaserScanning
                        ? 'bg-red-500 shadow-[0_0_12px_#ef4444,0_0_24px_#ef4444]'
                        : 'bg-red-700/80 shadow-[0_0_4px_#dc2626]'
                    }`}>
                      {/* Laser Core Pinpoint */}
                      <div className="w-1 h-1 rounded-full bg-white shadow-[0_0_4px_#ffffff]" />
                    </div>
                  </div>

                  {/* Micro Status Recording Diode (Subtle blinking red dot) */}
                  <div className={`absolute top-1 right-1 w-1 h-1 rounded-full ${
                    isLaserScanning 
                      ? 'bg-red-500 shadow-[0_0_6px_#ef4444] animate-ping' 
                      : 'bg-emerald-500/90 shadow-[0_0_4px_#10b981]'
                  }`} />
                </div>
              </div>
            </motion.div>

            {/* Quiet Camera Lens - Auto-activates on completion without flashing any sentence */}
          </div>

          {/* 2️⃣ Realistic Split Air Conditioner (Mounted Top-Right above Yellow Cupboard) */}
          {/* Angled to be exactly parallel with the slanted Yellow Cupboard (rotate: -3.6deg) */}
          <div 
            style={{ 
              right: '4.8%', 
              top: '3.6%', 
              width: '12.0%', 
              height: '7.8%', 
              transform: 'rotate(-3.6deg)', 
              transformOrigin: 'center center' 
            }}
            className="absolute z-30 select-none pointer-events-none"
            title="مكيف الهواء الجداري"
          >
            {/* Wall Mount Realistic Soft Drop Shadow */}
            <div className="absolute inset-0 bg-black/70 rounded-[6px] blur-[6px] transform translate-y-2 scale-95" />

            {/* Split AC Main Casing (Realistic Matte/Gloss Appliance Body) */}
            <div className="relative w-full h-full bg-gradient-to-b from-[#ffffff] via-[#f8fafc] to-[#e2e8f0] rounded-[6px] border border-white/85 shadow-[0_8px_20px_rgba(0,0,0,0.5),inset_0_1px_2px_rgba(255,255,255,1),inset_0_-1px_3px_rgba(0,0,0,0.18)] flex flex-col justify-between overflow-hidden">
              
              {/* Upper Air Intake Vents / Grille Lines */}
              <div className="w-full h-[22%] bg-gradient-to-b from-slate-200/90 to-slate-100/60 border-b border-slate-300/70 px-2 py-0.5 flex flex-col justify-around">
                <div className="w-full h-[1.5px] bg-slate-400/40 rounded-full" />
                <div className="w-full h-[1.5px] bg-slate-400/35 rounded-full" />
                <div className="w-full h-[1.5px] bg-slate-400/25 rounded-full" />
              </div>

              {/* Front Faceplate with Minimal Brand Badge & Digital LED Status Display */}
              <div className="flex-1 flex items-center justify-between px-2.5 py-0.5 relative">
                {/* Brand Logo & Tech Accent */}
                <div className="flex items-center gap-1 opacity-70">
                  <span className="text-[7px] font-sans font-black tracking-widest text-slate-500 uppercase">INVERTER</span>
                  <span className="text-[7px] text-sky-500 font-bold">❄️</span>
                </div>

                {/* Modern Digital LED Display (Right side of faceplate) */}
                <div className="flex items-center gap-1.5">
                  {/* Status Diode LEDs */}
                  <div className="flex flex-col gap-0.5">
                    {/* Power LED: lights up bright emerald green when powered */}
                    <div className={`w-1.5 h-1.5 rounded-full transition-all duration-300 ${
                      acPowered 
                        ? 'bg-emerald-400 shadow-[0_0_8px_#34d399]' 
                        : 'bg-slate-400/40'
                    }`} />
                    {/* Eco LED: lights up icy cyan when powered */}
                    <div className={`w-1.5 h-1.5 rounded-full transition-all duration-300 ${
                      acPowered 
                        ? 'bg-cyan-400 shadow-[0_0_6px_#22d3ee]' 
                        : 'bg-slate-400/30'
                    }`} />
                  </div>

                  {/* Digital 7-Segment Display Window */}
                  <div className={`px-1.5 py-0.5 rounded-[3px] border transition-all duration-500 flex items-center gap-0.5 ${
                    acPowered
                      ? 'bg-slate-950/85 border-cyan-500/70 shadow-[0_0_10px_rgba(6,182,212,0.65)]'
                      : 'bg-slate-900/25 border-slate-400/20'
                  }`}>
                    {acPowered ? (
                      <div className="flex items-center gap-0.5 font-mono font-black text-cyan-300 drop-shadow-[0_0_6px_rgba(6,182,212,0.95)] text-[10px] leading-none animate-pulse">
                        <span>18°</span>
                        <span className="text-[8px] text-cyan-200">❄️</span>
                      </div>
                    ) : (
                      <div className="w-5 h-2.5 flex items-center justify-center opacity-20">
                        <span className="text-[8px] font-mono text-slate-500">--°</span>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Bottom Motorized Swing Louver / Air Deflector Flap */}
              <div className="relative w-full h-[26%] bg-slate-900/90 border-t border-slate-300/80 overflow-visible">
                {/* Dark Interior Blower Chamber inside */}
                <div className="absolute inset-0 bg-[#0f172a] flex items-center justify-around px-1 opacity-90">
                  <div className="w-[96%] h-[2px] bg-slate-800 rounded-full" />
                </div>

                {/* Motorized Swing Flap Blade (Smoothly opens downward when turned on) */}
                <div 
                  style={{
                    transformOrigin: 'top center',
                    transform: acLouverOpen 
                      ? 'perspective(250px) rotateX(-65deg) translateY(2px)' 
                      : 'perspective(250px) rotateX(0deg) translateY(0)',
                    transition: 'transform 0.65s cubic-bezier(0.34, 1.4, 0.64, 1)'
                  }}
                  className="absolute inset-0 bg-gradient-to-b from-[#ffffff] via-[#f1f5f9] to-[#cbd5e1] rounded-b-[5px] border-b border-slate-300 shadow-sm"
                />
              </div>
            </div>
          </div>

          {/* 3️⃣ High-Energy Industrial Metal-Engraving Laser Scan System & Futuristic Data Analysis HUD */}
          {isLaserScanning && (
            <div className="absolute inset-0 z-40 pointer-events-none overflow-hidden select-none">
              {/* Dynamic Industrial Metal-Engraving Laser Beams Emitting Directly From Camera Lens Center (Origin: X: 10.0%, Y: 8.2%) */}
              <svg className="absolute inset-0 w-full h-full pointer-events-none" xmlns="http://www.w3.org/2000/svg">
                <defs>
                  {/* High-Intensity Metal Engraving Laser Bloom Filters */}
                  <filter id="metalLaserGlow" x="-30%" y="-30%" width="160%" height="160%">
                    <feGaussianBlur in="SourceGraphic" stdDeviation="2.5" result="blur1" />
                    <feGaussianBlur in="SourceGraphic" stdDeviation="6" result="blur2" />
                    <feGaussianBlur in="SourceGraphic" stdDeviation="12" result="blur3" />
                    <feMerge>
                      <feMergeNode in="blur3" />
                      <feMergeNode in="blur2" />
                      <feMergeNode in="blur1" />
                      <feMergeNode in="SourceGraphic" />
                    </feMerge>
                  </filter>

                  {/* Searing Coherent Laser Gradient */}
                  <linearGradient id="metalLaserGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                    <stop offset="0%" stopColor="#ffffff" stopOpacity="1" />
                    <stop offset="15%" stopColor="#fef08a" stopOpacity="1" />
                    <stop offset="45%" stopColor="#ef4444" stopOpacity="0.95" />
                    <stop offset="100%" stopColor="#b91c1c" stopOpacity="0.8" />
                  </linearGradient>

                  {/* Industrial Engraving Cone Dispersion from Top-Left Camera Lens */}
                  <radialGradient id="engraveFanGrad" cx="10.0%" cy="8.2%" r="95%">
                    <stop offset="0%" stopColor="rgba(255, 255, 255, 0.6)" />
                    <stop offset="10%" stopColor="rgba(239, 68, 68, 0.4)" />
                    <stop offset="35%" stopColor="rgba(239, 68, 68, 0.15)" />
                    <stop offset="75%" stopColor="rgba(239, 68, 68, 0.03)" />
                    <stop offset="100%" stopColor="transparent" />
                  </radialGradient>
                </defs>

                {/* Sweeping Laser Fan Radiation Cone from Camera Lens across the room */}
                <polygon 
                  points="10.0%,8.2% 0%,40% 100%,40% 100%,80% 0%,80%" 
                  fill="url(#engraveFanGrad)" 
                  className="animate-pulse"
                />

                {/* 4 Direct High-Power Laser Engraving Beams to all 4 Cupboards (Pink, Blue, Green, Yellow) */}
                {/* Ray 1: Camera to Pink Cupboard (Left) */}
                <line 
                  x1="10.0%" y1="8.2%" x2="9.5%" y2="48%" 
                  stroke="url(#metalLaserGrad)" 
                  strokeWidth={laserScanStep === 4 ? "4.5" : "1.8"} 
                  filter="url(#metalLaserGlow)" 
                  opacity={laserScanStep === 4 ? 1 : 0.65}
                />
                <line 
                  x1="10.0%" y1="8.2%" x2="9.5%" y2="48%" 
                  stroke="#ffffff" 
                  strokeWidth={laserScanStep === 4 ? "1.8" : "0.8"} 
                  opacity={laserScanStep === 4 ? 1 : 0.5}
                />

                {/* Ray 2: Camera to Blue Cupboard (Center-Left) */}
                <line 
                  x1="10.0%" y1="8.2%" x2="35.5%" y2="48%" 
                  stroke="url(#metalLaserGrad)" 
                  strokeWidth={laserScanStep === 3 ? "4.5" : "1.8"} 
                  filter="url(#metalLaserGlow)" 
                  opacity={laserScanStep === 3 ? 1 : 0.65}
                />
                <line 
                  x1="10.0%" y1="8.2%" x2="35.5%" y2="48%" 
                  stroke="#ffffff" 
                  strokeWidth={laserScanStep === 3 ? "1.8" : "0.8"} 
                  opacity={laserScanStep === 3 ? 1 : 0.5}
                />

                {/* Ray 3: Camera to Green Cupboard (Center-Right) */}
                <line 
                  x1="10.0%" y1="8.2%" x2="65.5%" y2="48%" 
                  stroke="url(#metalLaserGrad)" 
                  strokeWidth={laserScanStep === 2 ? "4.5" : "1.8"} 
                  filter="url(#metalLaserGlow)" 
                  opacity={laserScanStep === 2 ? 1 : 0.65}
                />
                <line 
                  x1="10.0%" y1="8.2%" x2="65.5%" y2="48%" 
                  stroke="#ffffff" 
                  strokeWidth={laserScanStep === 2 ? "1.8" : "0.8"} 
                  opacity={laserScanStep === 2 ? 1 : 0.5}
                />

                {/* Ray 4: Camera to Yellow Cupboard (Right) */}
                <line 
                  x1="10.0%" y1="8.2%" x2="90.5%" y2="48%" 
                  stroke="url(#metalLaserGrad)" 
                  strokeWidth={laserScanStep === 1 ? "4.5" : "1.8"} 
                  filter="url(#metalLaserGlow)" 
                  opacity={laserScanStep === 1 ? 1 : 0.65}
                />
                <line 
                  x1="10.0%" y1="8.2%" x2="90.5%" y2="48%" 
                  stroke="#ffffff" 
                  strokeWidth={laserScanStep === 1 ? "1.8" : "0.8"} 
                  opacity={laserScanStep === 1 ? 1 : 0.5}
                />

                {/* Blazing Origin Laser Diode Emitter Spark */}
                <circle cx="10.0%" cy="8.2%" r="5" fill="#ffffff" filter="url(#metalLaserGlow)" />
                <circle cx="10.0%" cy="8.2%" r="14" fill="none" stroke="#ef4444" strokeWidth="2" opacity="0.9" className="animate-ping" />

                {/* Metal Engraving Focal Spot at the targeted cupboard with flying sparks */}
                {(() => {
                  const targetPositions = [
                    { x: '90.5%', y: '48%' }, // Yellow (Step 1)
                    { x: '65.5%', y: '48%' }, // Green (Step 2)
                    { x: '35.5%', y: '48%' }, // Blue (Step 3)
                    { x: '9.5%', y: '48%' }   // Pink (Step 4)
                  ];
                  const pos = targetPositions[(laserScanStep - 1) % targetPositions.length] || targetPositions[0];
                  return (
                    <g key={`spark-${laserScanStep}`}>
                      {/* Searing white-hot focal burn spark */}
                      <circle cx={pos.x} cy={pos.y} r="6" fill="#ffffff" filter="url(#metalLaserGlow)" />
                      <circle cx={pos.x} cy={pos.y} r="16" fill="none" stroke="#f59e0b" strokeWidth="2" opacity="0.8" className="animate-ping" />
                      {/* Radiating Micro-Sparks like laser metal etching */}
                      <line x1={pos.x} y1={pos.y} x2={`calc(${pos.x} + 8px)`} y2={`calc(${pos.y} - 12px)`} stroke="#fef08a" strokeWidth="1.5" />
                      <line x1={pos.x} y1={pos.y} x2={`calc(${pos.x} - 10px)`} y2={`calc(${pos.y} - 8px)`} stroke="#fef08a" strokeWidth="1.5" />
                      <line x1={pos.x} y1={pos.y} x2={`calc(${pos.x} + 11px)`} y2={`calc(${pos.y} + 9px)`} stroke="#fef08a" strokeWidth="1.5" />
                    </g>
                  );
                })()}
              </svg>

              {/* Sweeping Laser Raster Line Scanning across all Cupboards */}
              <motion.div 
                initial={{ left: '6%' }}
                animate={{ left: ['6%', '94%', '6%'] }}
                transition={{ duration: 2.1, ease: 'easeInOut', repeat: Infinity }}
                className="absolute inset-y-0 w-1.5 bg-gradient-to-b from-red-400 via-rose-500 to-red-400 shadow-[0_0_20px_#ef4444,0_0_40px_#ef4444,0_0_60px_#ef4444]"
              >
                <div className="absolute inset-y-0 -left-6 -right-6 bg-red-500/20 blur-md" />
              </motion.div>

              {/* 4️⃣ Futuristic High-Tech Data Analysis Monitor Screen at Bottom */}
              <div className="absolute bottom-3 left-1/2 transform -translate-x-1/2 z-50 w-full max-w-2xl px-3 pointer-events-auto">
                <div className="bg-slate-950/95 backdrop-blur-xl border-2 border-cyan-500/60 rounded-2xl p-3 shadow-[0_20px_60px_rgba(6,182,212,0.4),0_0_25px_rgba(239,68,68,0.3)] text-white relative overflow-hidden">
                  
                  {/* Subtle Sci-Fi Glass Scanlines & Corner Brackets */}
                  <div className="absolute inset-0 pointer-events-none opacity-10 bg-[repeating-linear-gradient(0deg,#fff,#fff_1px,transparent_1px,transparent_4px)]" />
                  <div className="absolute top-1 left-2 text-[8px] font-mono text-cyan-400 opacity-60">┌ REC: LIVE_ANALYTICS ┐</div>
                  <div className="absolute top-1 right-2 text-[8px] font-mono text-cyan-400 opacity-60">┌ SYS_VERIFY // 2026 ┐</div>

                  {/* Monitor Header with Telemetry & Skip Button */}
                  <div className="flex items-center justify-between border-b border-cyan-500/30 pb-2 mb-2 px-1">
                    <div className="flex items-center gap-2">
                      <div className="w-2.5 h-2.5 rounded-full bg-cyan-400 animate-ping shadow-[0_0_8px_#22d3ee]" />
                      <span className="text-xs font-black font-tajawal text-cyan-300 tracking-wider">
                        📡 شَاشَةُ التَّحْلِيلِ وَالمُعَالَجَةِ اللّحْظِيَّةِ لِلأَرْفُفِ
                      </span>
                    </div>

                    {/* Audio Equalizer Animated Frequency Waveform Bars */}
                    <div className="hidden sm:flex items-center gap-1 px-2 py-0.5 rounded bg-black/60 border border-cyan-500/30">
                      {[12, 18, 8, 22, 14, 20, 10, 16].map((h, i) => (
                        <motion.div
                          key={i}
                          animate={{ height: [4, h, 6] }}
                          transition={{ repeat: Infinity, duration: 0.6 + i * 0.1, ease: 'easeInOut' }}
                          className="w-1 bg-gradient-to-t from-cyan-500 to-red-400 rounded-full"
                        />
                      ))}
                    </div>

                    {/* Skip Scanning Button */}
                    <button
                      onClick={handleSkipLaserScan}
                      className="px-3 py-1 rounded-xl bg-red-600/90 hover:bg-red-500 text-white text-[11px] font-black transition cursor-pointer shadow-md flex items-center gap-1"
                    >
                      <span>تخطي الفحص</span>
                      <span>⏭</span>
                    </button>
                  </div>

                  {/* Real-Time Word Card Analysis Screen Lane */}
                  <div className="relative bg-slate-900/95 rounded-xl p-3 border border-cyan-500/30 mb-2 overflow-hidden min-h-[74px] flex items-center justify-between">
                    {/* Background Digital Grid Matrix */}
                    <div className="absolute inset-0 opacity-10 bg-[radial-gradient(#06b6d4_1px,transparent_1px)] [background-size:12px_12px]" />

                    {/* Laser Analysis Reticle Scanning through current word */}
                    <motion.div 
                      animate={{ x: [-160, 160, -160] }}
                      transition={{ repeat: Infinity, duration: 1.1, ease: 'easeInOut' }}
                      className="absolute inset-y-0 w-1 bg-gradient-to-b from-cyan-400 via-red-500 to-cyan-400 shadow-[0_0_15px_#22d3ee] z-20 pointer-events-none"
                    />

                    {/* Scanned Word Card Alternating in Real-Time */}
                    <AnimatePresence mode="wait">
                      {auditItems[realtimeScanIndex] && (
                        <motion.div 
                          key={auditItems[realtimeScanIndex].item.id}
                          initial={{ x: 50, opacity: 0, scale: 0.94 }}
                          animate={{ x: 0, opacity: 1, scale: 1 }}
                          exit={{ x: -50, opacity: 0, scale: 0.94 }}
                          transition={{ type: 'spring', stiffness: 360, damping: 26 }}
                          className="relative z-10 w-full flex items-center justify-between gap-3"
                        >
                          {/* Word Display with Prominent Tashkeel */}
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-slate-800 to-slate-950 border border-cyan-400/50 flex items-center justify-center text-lg shadow-inner">
                              🏷️
                            </div>
                            <div className="text-right">
                              <div className="text-lg md:text-xl font-black font-tajawal text-amber-300 drop-shadow-[0_0_8px_rgba(251,191,36,0.5)] leading-tight">
                                {auditItems[realtimeScanIndex].item.tashkeel}
                              </div>
                              <div className="text-[10px] text-slate-300 font-bold mt-0.5">
                                الرف الحالي: <span className="text-white font-black">{auditItems[realtimeScanIndex].placedShelfTitle}</span>
                              </div>
                            </div>
                          </div>

                          {/* Verification Engine Analysis Badge */}
                          <div className={`px-3 py-1.5 rounded-xl border font-black text-xs shadow-md flex items-center gap-2 ${
                            auditItems[realtimeScanIndex].isCorrect
                              ? 'bg-emerald-950/80 border-emerald-400/80 text-emerald-300 shadow-[0_0_15px_rgba(16,185,129,0.3)]'
                              : 'bg-rose-950/80 border-rose-400/80 text-rose-300 shadow-[0_0_15px_rgba(244,63,94,0.3)]'
                          }`}>
                            {auditItems[realtimeScanIndex].isCorrect ? (
                              <>
                                <CheckCircle2 size={15} className="text-emerald-400 animate-pulse" />
                                <span>مُطَابِق لِلْمَعْيَارِ النَّحْوِيّ ✓</span>
                              </>
                            ) : (
                              <>
                                <AlertCircle size={15} className="text-rose-400 animate-bounce" />
                                <span>غَيْرُ مُطَابِق (المطلوب: {auditItems[realtimeScanIndex].correctShelfTitle})</span>
                              </>
                            )}
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>

                  {/* Monitor Telemetry Progress Bar & Data Counter */}
                  <div className="space-y-1">
                    <div className="flex justify-between items-center text-[11px] font-bold text-white/80 px-1">
                      <span className="flex items-center gap-1 font-tajawal">
                        <span className="text-cyan-400">⚡</span>
                        <span>فحص الكروت والتحليل البصري:</span>
                      </span>
                      <span className="text-cyan-300 font-mono font-black">
                        {realtimeScanIndex + 1} / {auditItems.length} ({Math.round(((realtimeScanIndex + 1) / Math.max(1, auditItems.length)) * 100)}%)
                      </span>
                    </div>
                    <div className="w-full h-2 bg-white/10 rounded-full overflow-hidden p-0.5">
                      <motion.div 
                        className="h-full bg-gradient-to-r from-cyan-500 via-rose-500 to-emerald-400 rounded-full shadow-[0_0_10px_#06b6d4]"
                        style={{ width: `${((realtimeScanIndex + 1) / Math.max(1, auditItems.length)) * 100}%` }}
                      />
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}



          {/* 16 Cupboard Shelf Slots (4 Cupboards × 4 Shelves) */}
          {cupboards.map((cupboard) => {
            const { shelf, slots } = cupboard;
            return (
              <React.Fragment key={shelf.id}>
                {/* 4 Shelf Slots in this Cupboard, perfectly matched 1:1 in position, size, angle, tilt and rounded corners with the shelf templates */}
                {slots.map((slot) => {
                  const { rowIndex, left, top, width: slotW, height: slotH, angle } = slot;
                  const slotKey = `${shelf.id}_${rowIndex}`;
                  const cardInSlot = placedSlots[slotKey];

                  return (
                    <div
                      key={slotKey}
                      style={{ 
                        left, 
                        top, 
                        width: slotW, 
                        height: slotH,
                        transform: `rotate(${angle}deg)`,
                        transformOrigin: 'center center'
                      }}
                      onDragOver={(e) => {
                        e.preventDefault();
                        e.dataTransfer.dropEffect = 'move';
                      }}
                      onDrop={(e) => {
                        e.preventDefault();
                        const cardId = e.dataTransfer.getData('text/plain') || draggedCardId;
                        if (cardId) placeCardInSlot(cardId, slotKey);
                      }}
                      onClick={() => {
                        if (windGustActive) return;
                        if (selectedCardId) {
                          placeCardInSlot(selectedCardId, slotKey);
                        } else if (cardInSlot) {
                          returnCardToFloor(slotKey);
                        }
                      }}
                      className={`absolute rounded-[4px] transition-all flex items-center justify-center cursor-pointer ${
                        cardInSlot 
                          ? 'p-0 z-20 shadow-[0_2px_6px_rgba(0,0,0,0.35)]'
                          : selectedCardId
                          ? 'border border-dashed border-amber-400 bg-amber-400/25 hover:bg-amber-400/40 shadow-[0_0_12px_rgba(251,191,36,0.6)] animate-pulse z-10'
                          : 'border border-dashed border-amber-600/40 bg-amber-950/10 hover:border-amber-400/80 hover:bg-amber-400/15 z-0'
                      }`}
                      title={cardInSlot ? 'انقر لإعادة الكارت للأرض' : 'مكان الرف المخصص'}
                    >
                      {cardInSlot ? (
                        /* Placed Card: fits identically and perfectly flush within the shelf template */
                        <div 
                          draggable={!windGustActive}
                          onDragStart={(e) => {
                            if (windGustActive) return;
                            e.dataTransfer.setData('text/plain', cardInSlot.id);
                            setDraggedCardId(cardInSlot.id);
                          }}
                          onDragEnd={() => setDraggedCardId(null)}
                          className={`w-full h-full bg-[#fffefc] border border-amber-950/30 rounded-[4px] shadow-[0_2px_6px_rgba(0,0,0,0.3)] flex items-center justify-center px-1 text-center transition select-none ${
                            windStage === 'warning'
                              ? 'animate-[cardFlutterShake_0.08s_infinite]'
                              : 'transform hover:scale-[1.02] cursor-grab active:cursor-grabbing'
                          }`}
                        >
                          <span className="font-tajawal font-black text-slate-900 text-[11px] xs:text-xs sm:text-xs md:text-sm leading-tight text-center truncate px-0.5 select-none">
                            {cardInSlot.tashkeel}
                          </span>
                        </div>
                      ) : null}
                    </div>
                  );
                })}
              </React.Fragment>
            );
          })}

          {/* 3D Flying Cards during Cinematic Wind Gust */}
          {flyingCards.map((flying) => (
            <motion.div
              key={`flying-${flying.item.id}`}
              initial={{
                left: flying.from.left,
                top: flying.from.top,
                rotate: flying.from.angle,
                scale: 1,
                opacity: 1,
              }}
              animate={{
                left: [flying.from.left, flying.midLeft, flying.to.left],
                top: [flying.from.top, flying.midTop, flying.to.top],
                rotate: [flying.from.angle, flying.swirlAngle, flying.to.rotate],
                scale: [1, 1.18, 1],
                rotateX: [0, 42, 0],
                rotateY: [0, -32, 0],
              }}
              transition={{
                duration: flying.duration,
                delay: flying.delay,
                ease: [0.25, 0.1, 0.25, 1.0],
              }}
              style={{
                width: flying.from.width || CARD_WIDTH_PCT,
                height: flying.from.height || CARD_HEIGHT_PCT,
                position: 'absolute',
                transformOrigin: 'center center',
                zIndex: 60,
              }}
              className="bg-[#fffefc] border border-amber-950/40 rounded-[4px] shadow-[0_14px_30px_rgba(0,0,0,0.6)] flex items-center justify-center px-1 text-center pointer-events-none select-none"
            >
              <span className="font-tajawal font-black text-slate-900 text-[11px] xs:text-xs sm:text-xs md:text-sm leading-tight text-center truncate px-0.5 select-none">
                {flying.item.tashkeel}
              </span>
            </motion.div>
          ))}

          {/* Realistic Atmospheric Cold Air Mist & Turbulence Billowing from AC Vent */}
          {(acBlowing || windStage === 'warning' || windStage === 'gust') && (
            <div className="absolute inset-0 pointer-events-none z-30 overflow-hidden">
              {/* Primary Cold Air Plume expanding downward-left across the room from top-right AC */}
              <div 
                style={{
                  right: '4.0%',
                  top: '10.5%',
                  width: '85%',
                  height: '75%',
                  background: 'radial-gradient(ellipse at 92% 8%, rgba(255,255,255,0.35) 0%, rgba(224,242,254,0.22) 25%, rgba(186,230,253,0.08) 55%, transparent 78%)',
                  filter: 'blur(16px)',
                  mixBlendMode: 'screen',
                }}
                className="absolute animate-[acMistWave_1.8s_infinite_ease-in-out]"
              />

              {/* Secondary High-Velocity Aerodynamic Draft Wave */}
              <div 
                style={{
                  right: '7.5%',
                  top: '12.5%',
                  width: '90%',
                  height: '65%',
                  background: 'linear-gradient(245deg, rgba(255,255,255,0.28) 0%, rgba(224,242,254,0.18) 30%, rgba(147,197,253,0.05) 60%, transparent 85%)',
                  filter: 'blur(20px)',
                  mixBlendMode: 'screen',
                }}
                className="absolute animate-[acMistFlow_2.1s_infinite_ease-out]"
              />

              {/* Subtle Atmospheric Air Density Waves across the cupboards */}
              <div 
                style={{
                  left: '2.0%',
                  top: '18.0%',
                  width: '96%',
                  height: '55%',
                  background: 'radial-gradient(ellipse at 35% 30%, rgba(255,255,255,0.18) 0%, rgba(224,242,254,0.08) 45%, transparent 70%)',
                  filter: 'blur(24px)',
                  mixBlendMode: 'screen',
                }}
                className="absolute animate-pulse"
              />

              {/* Micro Condensation Sparkles in the Air Stream */}
              {[
                { x: '12%', y: '22%', delay: '0s', size: 3 },
                { x: '24%', y: '28%', delay: '0.4s', size: 4 },
                { x: '38%', y: '33%', delay: '0.2s', size: 3 },
                { x: '52%', y: '26%', delay: '0.6s', size: 4 },
                { x: '68%', y: '35%', delay: '0.3s', size: 3 },
                { x: '82%', y: '30%', delay: '0.7s', size: 4 },
              ].map((sparkle, sIdx) => (
                <div
                  key={`sparkle-${sIdx}`}
                  style={{
                    left: sparkle.x,
                    top: sparkle.y,
                    width: `${sparkle.size}px`,
                    height: `${sparkle.size}px`,
                    animationDelay: sparkle.delay,
                  }}
                  className="absolute rounded-full bg-cyan-100 shadow-[0_0_8px_rgba(255,255,255,0.9)] animate-ping opacity-75"
                />
              ))}
            </div>
          )}

          {/* 16 Scattered Cards Lying On The Floor (Exact identical dimensions CARD_WIDTH_PCT & CARD_HEIGHT_PCT, matching shelf blank cards) */}
          {scatteredCards.map((card, idx) => {
            const pos = FLOOR_SLOTS[idx % FLOOR_SLOTS.length];
            const isSelected = selectedCardId === card.id;

            return (
              <div
                key={card.id}
                draggable={!windGustActive}
                onDragStart={(e) => {
                  if (windGustActive) return;
                  e.dataTransfer.setData('text/plain', card.id);
                  setDraggedCardId(card.id);
                }}
                onDragEnd={() => setDraggedCardId(null)}
                onClick={() => {
                  if (windGustActive) return;
                  setSelectedCardId(isSelected ? null : card.id);
                }}
                style={{
                  left: pos.left,
                  top: pos.top,
                  width: CARD_WIDTH_PCT,
                  height: CARD_HEIGHT_PCT,
                  transform: `rotate(${pos.rotate}deg)`,
                  transformOrigin: 'center center',
                  zIndex: isSelected ? 50 : (pos.zIndex || 20)
                }}
                className={`absolute bg-[#fffefc] rounded-[4px] border transition-all duration-150 flex items-center justify-center px-1 text-center cursor-grab active:cursor-grabbing hover:scale-105 select-none ${
                  isSelected 
                    ? 'border-2 border-amber-500 ring-2 ring-amber-400/70 shadow-[0_4px_16px_rgba(251,191,36,0.6)] scale-105' 
                    : 'border-amber-950/30 shadow-[0_4px_10px_rgba(0,0,0,0.38)] hover:border-amber-400'
                }`}
                title="اسحب الكارت أو انقر عليه ثم اختر رفه المناسب في الدواليب"
              >
                <span className="font-tajawal font-black text-slate-900 text-[11px] xs:text-xs sm:text-xs md:text-sm leading-tight text-center truncate px-0.5 select-none">
                  {card.tashkeel}
                </span>
              </div>
            );
          })}
        </div>

        {/* Floating Sound Toggle at Bottom-Left */}
        <button 
          onClick={toggleSound}
          className="fixed bottom-4 left-4 z-50 p-3 bg-black/65 hover:bg-black/85 backdrop-blur-md border border-white/25 text-white rounded-2xl shadow-2xl transition transform active:scale-90 cursor-pointer"
          title="كتم/تشغيل الصوت"
        >
          {soundOn ? <Volume2 size={20} className="text-amber-400" /> : <VolumeX size={20} className="text-red-400" />}
        </button>
      </div>
    );
  }

  // --------------------------------------------------------------------------
  // RENDER: SCENE 4 & 5 - CASHIER CHECKOUT & REAL TV SCREEN SUSPENDED IN TOP-LEFT
  // --------------------------------------------------------------------------
  const correctCount = auditItems.filter(a => a.isCorrect).length;
  const incorrectCount = auditItems.length - correctCount;
  const isPerfect = correctCount === auditItems.length && auditItems.length > 0;

  return (
    <div className="relative w-full h-full min-h-screen bg-slate-950 overflow-hidden flex flex-col items-center justify-center font-sans select-none" dir="rtl">
      {/* Scoped CSS for Realistic Ceiling-Suspended TV & Ticket Dispenser */}
      <style>{`
        .screen-receipt-root {
          --paper: #ffffff;
          --paper-ink: #0f172a;
          --paper-muted: #64748b;
          --paper-line: #cbd5e1;
        }
        /* Realistic Commercial Flat-Panel Television Frame with Rigid Fixed Dimensions */
        .real-tv-frame {
          position: relative;
          width: 310px;
          height: 142px;
          flex-shrink: 0;
          box-sizing: border-box;
          background: linear-gradient(135deg, #1f2937 0%, #111827 50%, #1f2937 100%);
          border: 3.5px solid #374151;
          border-radius: 6px;
          box-shadow: 
            0 20px 45px rgba(0, 0, 0, 0.9),
            0 6px 16px rgba(0, 0, 0, 0.7),
            inset 0 1px 1px rgba(255, 255, 255, 0.3),
            inset 0 -1px 2px rgba(0, 0, 0, 0.9);
        }
        /* Realistic Glossy TV Display Screen with Locked Fixed Dimensions (Never Expands) */
        .tv-screen-display {
          width: 100%;
          height: 106px;
          min-height: 106px;
          max-height: 106px;
          flex-shrink: 0;
          box-sizing: border-box;
          background: radial-gradient(ellipse at 50% 30%, #1e3a8a 0%, #0c1a3b 60%, #030712 100%);
          border: 1.5px solid #1e293b;
          border-radius: 3px;
          box-shadow: inset 0 0 25px rgba(0, 0, 0, 0.95);
          position: relative;
          overflow: hidden;
        }
        /* Realistic TV Chin with IR Sensor & Power LED */
        .tv-chin {
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 2.5px 8px;
          background: linear-gradient(180deg, #1f2937 0%, #111827 100%);
          border-top: 1px solid #374151;
          border-radius: 0 0 5px 5px;
        }
        /* Built-In Commercial Dispenser Mouth at Bottom of TV Unit */
        .tv-slot-lip {
          position: absolute;
          bottom: -6px;
          left: 12px;
          right: 12px;
          height: 8px;
          background: linear-gradient(180deg, #020617 0%, #1f2937 65%, #0f172a 100%);
          border-radius: 0 0 4px 4px;
          border: 1px solid #475569;
          border-top: none;
          box-shadow: 0 4px 10px rgba(0, 0, 0, 0.75);
          z-index: 35;
        }
        .paper-wrapper {
          position: relative;
          transform: translateY(-100%);
          will-change: transform;
        }
        .receipt-card {
          background: var(--paper);
          color: var(--paper-ink);
          padding: 10px 12px;
          border-radius: 4px;
          box-shadow: 0 14px 35px rgba(0, 0, 0, 0.5);
          cursor: pointer;
          position: relative;
          transition: filter 0.2s;
        }
        .receipt-card:hover {
          filter: brightness(0.98);
        }
        .perf {
          position: relative;
          margin: 6px -12px;
          height: 0;
          border-top: 1.5px dashed var(--paper-line);
        }
        .perf::before,
        .perf::after {
          content: "";
          position: absolute;
          top: -7px;
          width: 14px;
          height: 14px;
          border-radius: 50%;
          background: #090d16;
        }
        .perf::before { left: -7px; }
        .perf::after  { right: -7px; }
        .barcode-area {
          text-align: center;
          margin-top: 5px;
        }
        .printer-btn {
          background: #f59e0b;
          border: none;
          color: #0f172a;
          font-weight: bold;
          padding: 7px 16px;
          border-radius: 8px;
          cursor: pointer;
          transition: all 0.2s;
        }
        .printer-btn:hover {
          background: #fbbf24;
          transform: translateY(-1px);
        }
      `}</style>

      {/* Full-Width Uncut Cashier Container (100% Width & Height, Zero Side Crops) */}
      <div className="relative w-full h-full min-h-screen overflow-hidden flex flex-col justify-between screen-receipt-root">
        
        {/* Crisp Supermarket Cashier Checkout Background */}
        <img 
          src={cashierCheckoutImg} 
          alt="Supermarket Cashier"
          loading="eager"
          decoding="sync"
          className="absolute inset-0 w-full h-full object-fill select-none pointer-events-none"
        />

        {/* Single Top-Right Return Arrow Button */}
        <button 
          onClick={() => setPhase('aisle')}
          className="absolute top-4 right-4 z-50 p-2.5 bg-black/60 hover:bg-black/85 backdrop-blur-md border border-white/20 text-white rounded-xl shadow-xl transition active:scale-95 cursor-pointer pointer-events-auto flex items-center justify-center"
          title="العودة"
          aria-label="العودة"
        >
          <ArrowRight size={18} />
        </button>

        {/* 
          REAL COMMERCIAL TELEVISION SCREEN SUSPENDED DIRECTLY FROM THE CEILING (FLUSH AT TOP)
          Anchored right at the top ceiling edge (top: 0), raising the screen so it attaches directly 
          to the ceiling and drastically minimizes covering any items on the cashier belt!
        */}
        <div 
          className="absolute z-30 pointer-events-auto flex flex-col items-center"
          style={{
            left: '15%',
            top: '0%',
            transform: 'translateX(-50%)',
            transformOrigin: 'top center',
            width: '310px',
            maxWidth: '25vw'
          }}
        >
          {/* Heavy-Duty Dual Ceiling Mount Anchors Bolted Flush to Ceiling Edge (top: 0) */}
          <div className="w-full flex justify-between px-7 pointer-events-none z-10">
            {/* Left Ceiling Mount Flange & Short Drop Strut */}
            <div className="flex flex-col items-center">
              <div className="w-5 h-1.5 bg-slate-900 border-x border-b border-slate-600 rounded-b shadow" />
              <div className="w-2 h-3.5 bg-gradient-to-r from-slate-700 via-slate-400 to-slate-800 shadow-sm flex flex-col justify-around items-center">
                <div className="w-1 h-0.5 bg-slate-950 rounded-full" />
              </div>
            </div>
            {/* Right Ceiling Mount Flange & Short Drop Strut */}
            <div className="flex flex-col items-center">
              <div className="w-5 h-1.5 bg-slate-900 border-x border-b border-slate-600 rounded-b shadow" />
              <div className="w-2 h-3.5 bg-gradient-to-r from-slate-700 via-slate-400 to-slate-800 shadow-sm flex flex-col justify-around items-center">
                <div className="w-1 h-0.5 bg-slate-950 rounded-full" />
              </div>
            </div>
          </div>

          {/* The Real Television Unit (Fixed Dimensions from Start - Zero Growth/Shift) */}
          <div className="real-tv-frame p-1 z-20 -mt-0.5" style={{ width: '310px', height: '142px', flexShrink: 0 }}>
            {/* Television Display Screen Face (Locked Fixed Height - Never Expands) */}
            <div className="tv-screen-display w-full flex items-center justify-center p-3 text-center relative" style={{ width: '100%', height: '106px', flexShrink: 0 }}>
              {/* Authentic Diagonal Glossy Glass Screen Reflection */}
              <div className="absolute inset-0 bg-gradient-to-tr from-transparent via-white/[0.04] to-white/[0.13] pointer-events-none" />
              {/* Subtle Screen Scanline Texture */}
              <div className="absolute inset-0 bg-[repeating-linear-gradient(0deg,#000,#000_1px,transparent_1px,transparent_3px)] opacity-10 pointer-events-none" />

              {/* 
                THE DYNAMIC VOLUNTEER THANK YOU ANNOUNCEMENT
                Types out in real time letter-by-letter in pre-measured fixed viewport:
                "دكان المعرفة يشكر المتطوع/المتطوعة [الاسم] لجهوده/لجهودها في ترتيب أرفف قسم [القسم]"
              */}
              <div className="relative z-10 px-1 text-center w-full flex items-center justify-center min-h-[50px]">
                <p className="text-amber-300 font-tajawal font-black text-xs sm:text-[13px] leading-relaxed drop-shadow-[0_2px_4px_rgba(0,0,0,0.95)] m-0 inline">
                  {typedTvText}
                </p>
                {!isTvTextComplete && (
                  <span className="inline-block w-1.5 h-3.5 bg-amber-400 align-middle mr-1 animate-pulse shadow-[0_0_6px_#f59e0b]" />
                )}
              </div>
            </div>

            {/* Television Lower Chin: Sleek TV Bezel with Power LED & IR Sensor (Zero Extra Text) */}
            <div className="tv-chin">
              {/* IR Remote Sensor Window */}
              <div className="w-2.5 h-1 bg-black/95 rounded-sm border border-slate-700/60" title="IR Sensor" />

              {/* Subtle Center Metallic Division Accent */}
              <div className="w-6 h-0.5 bg-slate-700/50 rounded-full" />

              {/* Glowing TV Power LED Diode */}
              <div className="flex items-center gap-1" title="Power On">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 shadow-[0_0_8px_#34d399] animate-pulse" />
              </div>
            </div>

            {/* Built-in Dispenser Mouth Lip at Underside of Television Frame */}
            <div className="tv-slot-lip" />
          </div>

          {/* 
            Receipt Paper Sliding Downwards from the Bottom Lip of the TV Screen
            Emerged cleanly from the top-left ceiling position, completely clearing the cashier belt!
            All 16 words displayed cleanly in two columns with zero vertical scroll!
          */}
          <div 
            className="w-full relative z-10 overflow-hidden" 
            style={{ 
              marginTop: '-5px',
              padding: '0 6px 12px 6px'
            }}
          >
            <div className="paper-wrapper" ref={paperWrapperRef}>
              <div 
                className="receipt-card"
                ref={receiptElemRef}
                role="button"
                tabIndex={0}
                aria-label="إيصال المتطوع، انقر للتمزيق"
                onClick={tearReceipt}
              >
                {/* Store Header */}
                <h3 className="font-tajawal text-slate-950 font-black text-center text-xs sm:text-sm m-0">
                  🛒 دُكَّانُ المَعْرِفَةِ
                </h3>
                <p className="font-bold text-slate-800 text-center text-[9.5px] m-0">
                  إِيصَالُ شُكْرٍ وَتَقْدِيرٍ • {currentDept.titleAr}
                </p>
                <p className="text-[9px] text-slate-600 text-center mt-0.5 m-0">
                  {volunteerRole}: <strong className="text-slate-950">{studentName}</strong>
                </p>

                {/* Score Summary Box */}
                <div className="my-1 py-0.5 px-1.5 bg-slate-100 rounded text-center border border-slate-200">
                  <div className="text-[9.5px] text-slate-800 font-black">
                    النتيجة الإجمالية: {correctCount} / 16 ({Math.round((correctCount / 16) * 100)}%)
                  </div>
                  <div className="text-[8.5px] text-emerald-700 font-black">
                    {isPerfect ? 'جميع الكلمات في أماكنها الصحيحة' : `${correctCount} كلمات في مكانها الصحيح`}
                  </div>
                </div>

                {/* 16 Words Verification List - Crystal Clear, High-Contrast, Zero Truncation */}
                <div className="my-1 border border-slate-300 rounded overflow-hidden bg-white shadow-sm">
                  <div className="bg-slate-100 px-2 py-0.5 text-[8.5px] font-black text-slate-800 flex justify-between border-b border-slate-300">
                    <span>قَائِمَةُ الكَلِمَاتِ (16/16)</span>
                    <span>التَّدْقِيقُ الصَّحِيحُ</span>
                  </div>
                  <div className="grid grid-cols-2 gap-1 p-1 text-[9px] overflow-visible">
                    {auditItems.map((audit) => (
                      <div 
                        key={audit.item.id} 
                        className={`flex items-center justify-between px-1.5 py-1 rounded border ${
                          audit.isCorrect 
                            ? 'bg-emerald-50/95 border-emerald-300 text-slate-950 font-bold' 
                            : 'bg-rose-50/95 border-rose-300 text-slate-950 font-bold'
                        }`}
                      >
                        <span className="font-black font-tajawal text-[10px] leading-tight text-slate-950 whitespace-nowrap" title={audit.item.tashkeel}>
                          {audit.item.tashkeel}
                        </span>
                        <div className="flex items-center gap-1 font-black text-[8px] shrink-0">
                          {audit.isCorrect ? (
                            <span className="text-emerald-800 font-black flex items-center gap-0.5">
                              <span className="text-emerald-700 font-extrabold text-[9px]">✔</span>
                              <span className="whitespace-nowrap">{audit.placedShelfTitle}</span>
                            </span>
                          ) : (
                            <span className="text-rose-800 font-black flex items-center gap-0.5" title={`الصواب: ${audit.correctShelfTitle}`}>
                              <span className="text-rose-700 font-extrabold text-[9px]">✖</span>
                              <span className="whitespace-nowrap">{audit.correctShelfTitle}</span>
                            </span>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                <p className="text-[9.5px] font-black text-slate-900 text-center mt-1 font-tajawal m-0">
                  {isPerfect ? 'وسام الإتقان التام' : 'شكراً لمساعدتك في ترتيب المتجر!'}
                </p>

                {/* Perforation Line for Tearing */}
                <div className="perf"></div>

                {/* Barcode Area */}
                <div className="barcode-area">
                  <svg 
                    id="barcodeSvg" 
                    width="100%" 
                    height="24" 
                    viewBox="0 0 200 40" 
                    preserveAspectRatio="none"
                  >
                    {barcodeBars.map((bar, index) => (
                      <rect
                        key={index}
                        x={bar.x}
                        y={0}
                        width={bar.width}
                        height={40}
                        fill="#15162a"
                      />
                    ))}
                  </svg>
                  <div className="text-[7.5px] font-mono text-slate-500 text-center">#9200-AR-2026</div>
                </div>

                {printerState === 'ready' && (
                  <div className="text-center text-[8px] text-slate-500 mt-0.5 animate-pulse font-bold">
                    انقر لتمزيق الإيصال ✂️ (تحميل PDF فوري)
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Reprint Controls if torn */}
          {printerState === 'torn' && (
            <div className="controls flex items-center justify-center mt-2">
              <button 
                onClick={startPrint} 
                className="printer-btn flex items-center gap-1.5 text-xs shadow-xl cursor-pointer"
              >
                <Printer size={13} />
                <span>إعادة طباعة الإيصال 🖨️</span>
              </button>
            </div>
          )}
        </div>

      </div>
    </div>
  );
};
