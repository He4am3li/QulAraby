import React, { useEffect, useRef, useState, useMemo, useCallback } from "react";
import { 
  ArrowLeft, Rocket, Star, Volume2, VolumeX, Shield,
  Award, Play, Lock, ChevronRight, RotateCcw, Flame,
  Radio, AlertTriangle, FastForward, Sparkles, Navigation, Zap
} from "lucide-react";
import { CONTENT, PLANETS, Q, LegacyGameStage as Stage, Planet, STAGES_LIST } from "../../data/spaceJourneyData";

// Breathtaking Living Turquoise Cosmos, Photorealistic Planets & 3D Sci-Fi Spacecraft
import solarSystemCosmosBg from "/src/assets/images/solar_system_cosmos_bg_1790238722241.jpg";
import turquoiseCosmosBg from "/src/assets/images/turquoise_cosmos_sky_1790183779372.jpg";
import vibrantCinematicSpaceNebula from "/src/assets/images/vibrant_cinematic_space_nebula_1790179537071.jpg";
import realisticSunStar from "/src/assets/images/realistic_sun_star_1790259897845.jpg";
import realisticOceanicPlanet from "/src/assets/images/realistic_oceanic_planet_1790179595627.jpg";
import realisticRedMars from "/src/assets/images/realistic_red_mars_1790180155847.jpg";
import realisticSaturnRings from "/src/assets/images/realistic_saturn_rings_1790180143290.jpg";
import realisticGoldenGasGiant from "/src/assets/images/realistic_golden_gas_giant_1790179581145.jpg";
import realisticPurplePlanet from "/src/assets/images/realistic_purple_planet_1790180185554.jpg";
import realisticCyanPlanet from "/src/assets/images/realistic_cyan_planet_1790180199214.jpg";
import realisticEmeraldPlanet from "/src/assets/images/realistic_emerald_planet_1790265672429.jpg";
import realisticOrangePlanet from "/src/assets/images/realistic_orange_planet_1790265686144.jpg";
import realisticMoonSurface from "/src/assets/images/realistic_moon_surface_1790180169936.jpg";
import goldenRingPlanet from "/src/assets/images/golden_ring_planet_1790151390300.jpg";
import deepTealCometSpace from "/src/assets/images/deep_teal_comet_space_1790160141525.jpg";
import fieryCosmicStorm from "/src/assets/images/fiery_cosmic_storm_1790151406415.jpg";
import cinematicWarpFlight from "/src/assets/images/cinematic_warp_flight_1790151420851.jpg";
import peacefulUpliftingCosmos from "/src/assets/images/peaceful_uplifting_cosmos_1790180117277.jpg";
import realisticDeepCosmos from "/src/assets/images/realistic_deep_cosmos_1790181508926.jpg";
import cosmicConstellationMapBg from "/src/assets/images/cosmic_constellation_map_bg_1790178119639.jpg";
import cockpitSpaceHighway from "/src/assets/images/cockpit_space_highway_1790151369700.jpg";
import interiorVolcanicMars from "/src/assets/images/interior_volcanic_mars_1790504448984.jpg";
import interiorOceanicWorld from "/src/assets/images/interior_oceanic_world_1790504463163.jpg";
import interiorEmeraldGeode from "/src/assets/images/interior_emerald_geode_1790504477592.jpg";
import interiorAmberDunes from "/src/assets/images/interior_amber_dunes_1790504488297.jpg";
import interiorGasGiantClouds from "/src/assets/images/interior_gas_giant_clouds_1790504501041.jpg";
import planetVolcanicMars from "/src/assets/images/planet_volcanic_mars_1790582850947.jpg";
import planetOceanicDeep from "/src/assets/images/planet_oceanic_deep_1790582862835.jpg";
import planetGasGiantRings from "/src/assets/images/planet_gas_giant_rings_1790582875867.jpg";
import planetEmeraldCrystals from "/src/assets/images/planet_emerald_crystals_1790582889099.jpg";
import planetLunarCraters from "/src/assets/images/planet_lunar_craters_1790582905844.jpg";
import retroAstronautRocket from "/src/assets/images/retro_astronaut_rocket.png";
import astronautOnRope from "/src/assets/images/astronaut_on_rope.png";
import astronautMissionHero from "/src/assets/images/astronaut_mission_hero.png";

type Save = { 
  stars: Record<string, number>; 
  best: Record<string, number>; 
  completed: string[];
  coins: number;
};

const KEY = "arabic-space-flight-v6";

function loadSave(): Save {
  try {
    const x = JSON.parse(localStorage.getItem(KEY) || "");
    return x && x.stars && x.best ? x : { stars: {}, best: {}, completed: [], coins: 150 };
  } catch {
    return { stars: {}, best: {}, completed: [], coins: 150 };
  }
}

function saveGame(x: Save) {
  try {
    localStorage.setItem(KEY, JSON.stringify(x));
  } catch (e) {
    console.error(e);
  }
}

function shuffle<T>(arr: T[]): T[] {
  return [...arr].sort(() => Math.random() - 0.5);
}

// --- Cinematic High-Fidelity Audio Synthesizer (Realistic Sci-Fi Rocket & Deep Space Ambient) ---
class SpaceAudioEngine {
  ctx: AudioContext | null = null;
  isMuted: boolean = false;
  ambientMasterGain: GainNode | null = null;
  chimeTimeout: any = null;
  padTimeout: any = null;
  isAmbientPlaying: boolean = false;

  init() {
    if (!this.ctx) {
      const Ctx = window.AudioContext || (window as any).webkitAudioContext;
      if (Ctx) {
        this.ctx = new Ctx();
      }
    }
    if (this.ctx && this.ctx.state === "suspended") {
      this.ctx.resume();
    }
  }

  // Smart Ethereal Celestial Soundscape (No continuous buzzing drone or noise loop)
  // Replaces harsh static drone with vast quietude, spaced-out crystalline star chimes & gentle harmonic breath
  startAmbient() {
    if (this.isMuted || this.isAmbientPlaying) return;
    this.init();
    if (!this.ctx) return;

    try {
      this.isAmbientPlaying = true;
      const t = this.ctx.currentTime;
      const masterGain = this.ctx.createGain();
      masterGain.gain.setValueAtTime(0.0001, t);
      masterGain.gain.linearRampToValueAtTime(0.28, t + 1.2);
      masterGain.connect(this.ctx.destination);
      this.ambientMasterGain = masterGain;

      // 1. Subtle, gentle breathing warm celestial pad (every 22-34s, completely fades to silence in between)
      const playWarmPadSwell = () => {
        if (!this.isAmbientPlaying || !this.ctx || !this.ambientMasterGain) return;
        try {
          const now = this.ctx.currentTime;
          const padDur = 7.5;
          // Celestial pure harmonic intervals (216Hz and 324Hz - cosmic pure fifth)
          [216, 324].forEach((freq) => {
            if (!this.ctx || !this.ambientMasterGain) return;
            const osc = this.ctx.createOscillator();
            const gain = this.ctx.createGain();
            const filter = this.ctx.createBiquadFilter();

            osc.type = "sine";
            osc.frequency.setValueAtTime(freq, now);

            filter.type = "lowpass";
            filter.frequency.setValueAtTime(360, now);

            // Whisper-soft envelope: 2.8s gentle swell, 2s float, 2.7s fade to complete silence
            gain.gain.setValueAtTime(0.0001, now);
            gain.gain.linearRampToValueAtTime(0.016, now + 2.8);
            gain.gain.setValueAtTime(0.016, now + 4.5);
            gain.gain.exponentialRampToValueAtTime(0.0001, now + padDur);

            osc.connect(filter);
            filter.connect(gain);
            gain.connect(this.ambientMasterGain);

            osc.start(now);
            osc.stop(now + padDur + 0.1);
          });
        } catch {}

        if (this.isAmbientPlaying) {
          const nextPadDelay = 22000 + Math.random() * 12000;
          this.padTimeout = setTimeout(playWarmPadSwell, nextPadDelay);
        }
      };

      // 2. Delicate, sporadic crystalline star chimes (soft pentatonic notes every 8-14s)
      const playCelestialChime = () => {
        if (!this.isAmbientPlaying || !this.ctx || !this.ambientMasterGain) return;
        try {
          const now = this.ctx.currentTime;
          // Ethereal celestial pentatonic scale (D5, E5, F#5, A5, B5, D6, E6)
          const scale = [587.33, 659.25, 739.99, 880.0, 987.77, 1174.66, 1318.51];
          const freq = scale[Math.floor(Math.random() * scale.length)];

          const osc = this.ctx.createOscillator();
          const overtone = this.ctx.createOscillator();
          const chimeGain = this.ctx.createGain();
          const filter = this.ctx.createBiquadFilter();

          osc.type = "sine";
          osc.frequency.setValueAtTime(freq, now);

          overtone.type = "sine";
          overtone.frequency.setValueAtTime(freq * 1.5, now);

          filter.type = "bandpass";
          filter.frequency.setValueAtTime(freq, now);
          filter.Q.setValueAtTime(1.8, now);

          // Soft bell strike envelope: 40ms attack, 3.2s natural exponential decay
          chimeGain.gain.setValueAtTime(0.0001, now);
          chimeGain.gain.linearRampToValueAtTime(0.022, now + 0.04);
          chimeGain.gain.exponentialRampToValueAtTime(0.0001, now + 3.2);

          osc.connect(filter);
          overtone.connect(filter);
          filter.connect(chimeGain);
          chimeGain.connect(this.ambientMasterGain);

          osc.start(now);
          overtone.start(now);
          osc.stop(now + 3.3);
          overtone.stop(now + 1.8);
        } catch {}

        if (this.isAmbientPlaying) {
          const nextChimeDelay = 8000 + Math.random() * 6000;
          this.chimeTimeout = setTimeout(playCelestialChime, nextChimeDelay);
        }
      };

      // Initial first chime after 1.8s, first warm breath after 5s
      this.chimeTimeout = setTimeout(playCelestialChime, 1800);
      this.padTimeout = setTimeout(playWarmPadSwell, 5200);
    } catch {
      // Audio fallback
    }
  }

  stopAmbient(fadeDuration: number = 0.6) {
    if (!this.isAmbientPlaying) return;
    this.isAmbientPlaying = false;
    if (this.chimeTimeout) {
      clearTimeout(this.chimeTimeout);
      this.chimeTimeout = null;
    }
    if (this.padTimeout) {
      clearTimeout(this.padTimeout);
      this.padTimeout = null;
    }
    if (this.ctx && this.ambientMasterGain) {
      try {
        const t = this.ctx.currentTime;
        this.ambientMasterGain.gain.setValueAtTime(this.ambientMasterGain.gain.value, t);
        this.ambientMasterGain.gain.linearRampToValueAtTime(0.0001, t + fadeDuration);
      } catch {}
    }
    this.ambientMasterGain = null;
  }

  toggleMute(isMuted: boolean) {
    this.isMuted = isMuted;
    if (isMuted) {
      this.stopAmbient(0.3);
    } else {
      this.startAmbient();
    }
  }

  // Realistic Two-Stage Rocket Ignition & Liftoff Audio Sequence (Ignition Rumble -> Pressurization -> Liftoff Roar)
  ignitionAndThrust() {
    if (this.isMuted || !this.ctx) return;
    try {
      const t = this.ctx.currentTime;
      const totalDur = 2.8;

      // 1. Initial Ignition Spark / Pyrotechnic Pressure Pop (Low bass thud)
      const popOsc = this.ctx.createOscillator();
      const popGain = this.ctx.createGain();
      popOsc.type = "triangle";
      popOsc.frequency.setValueAtTime(85, t);
      popOsc.frequency.exponentialRampToValueAtTime(32, t + 0.35);
      popGain.gain.setValueAtTime(0.28, t);
      popGain.gain.exponentialRampToValueAtTime(0.001, t + 0.45);
      popOsc.connect(popGain);
      popGain.connect(this.ctx.destination);
      popOsc.start(t);
      popOsc.stop(t + 0.45);

      // 2. High-Speed Turbine Spool-Up Whine (Rising Pitch during pre-ignition)
      const whineOsc = this.ctx.createOscillator();
      const whineGain = this.ctx.createGain();
      whineOsc.type = "sine";
      whineOsc.frequency.setValueAtTime(120, t);
      whineOsc.frequency.exponentialRampToValueAtTime(540, t + 1.2);
      whineGain.gain.setValueAtTime(0.01, t);
      whineGain.gain.linearRampToValueAtTime(0.07, t + 0.7);
      whineGain.gain.exponentialRampToValueAtTime(0.001, t + totalDur);
      whineOsc.connect(whineGain);
      whineGain.connect(this.ctx.destination);
      whineOsc.start(t);
      whineOsc.stop(t + totalDur);

      // 3. Volumetric Combustion Exhaust Roar (Thick Pink Noise with Expanding Lowpass Filter)
      const bSize = Math.floor(this.ctx.sampleRate * totalDur);
      const buffer = this.ctx.createBuffer(1, bSize, this.ctx.sampleRate);
      const data = buffer.getChannelData(0);
      let lastVal = 0;
      for (let i = 0; i < bSize; i++) {
        const white = Math.random() * 2 - 1;
        lastVal = (lastVal * 0.93) + (white * 0.07);
        data[i] = lastVal * 3.8;
      }
      const noiseSrc = this.ctx.createBufferSource();
      noiseSrc.buffer = buffer;

      const lpFilter = this.ctx.createBiquadFilter();
      lpFilter.type = "lowpass";
      lpFilter.frequency.setValueAtTime(90, t); // Heavy muffled low rumble on pad
      lpFilter.frequency.exponentialRampToValueAtTime(460, t + 1.2); // Roars up as thrust reaches 100%
      lpFilter.frequency.exponentialRampToValueAtTime(260, t + totalDur);

      const noiseGain = this.ctx.createGain();
      noiseGain.gain.setValueAtTime(0.03, t);
      noiseGain.gain.linearRampToValueAtTime(0.26, t + 1.2); // Maximum power liftoff
      noiseGain.gain.exponentialRampToValueAtTime(0.001, t + totalDur);

      noiseSrc.connect(lpFilter);
      lpFilter.connect(noiseGain);
      noiseGain.connect(this.ctx.destination);
      noiseSrc.start(t);
      noiseSrc.stop(t + totalDur);

      // 4. Harmonic Ascension during Liftoff Trajectory (Begins at t + 1.2s)
      const propOsc = this.ctx.createOscillator();
      const propGain = this.ctx.createGain();
      propOsc.type = "triangle";
      propOsc.frequency.setValueAtTime(80, t + 1.2);
      propOsc.frequency.exponentialRampToValueAtTime(240, t + totalDur);
      propGain.gain.setValueAtTime(0.0001, t);
      propGain.gain.setValueAtTime(0.07, t + 1.2);
      propGain.gain.exponentialRampToValueAtTime(0.001, t + totalDur);
      propOsc.connect(propGain);
      propGain.connect(this.ctx.destination);
      propOsc.start(t + 1.2);
      propOsc.stop(t + totalDur);
    } catch {}
  }

  // Cinematic Sci-Fi Rocket Launch Sound (Smooth, Deep, Majestic Doppler Ascension)
  realisticRocketLaunch() {
    this.ignitionAndThrust();
  }

  laser() {
    if (this.isMuted || !this.ctx) return;
    try {
      const t = this.ctx.currentTime;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      osc.type = "sawtooth";
      osc.frequency.setValueAtTime(1100, t);
      osc.frequency.exponentialRampToValueAtTime(220, t + 0.09);
      gain.gain.setValueAtTime(0.05, t);
      gain.gain.exponentialRampToValueAtTime(0.001, t + 0.09);
      osc.connect(gain);
      gain.connect(this.ctx.destination);
      osc.start(t);
      osc.stop(t + 0.09);
    } catch {}
  }

  correct() {
    if (this.isMuted || !this.ctx) return;
    try {
      const t = this.ctx.currentTime;
      [587.33, 739.99, 880, 1174.66].forEach((f, i) => {
        const osc = this.ctx!.createOscillator();
        const gain = this.ctx!.createGain();
        osc.type = "sine";
        osc.frequency.setValueAtTime(f, t + i * 0.05);
        gain.gain.setValueAtTime(0.07, t + i * 0.05);
        gain.gain.exponentialRampToValueAtTime(0.001, t + i * 0.05 + 0.22);
        osc.connect(gain);
        gain.connect(this.ctx!.destination);
        osc.start(t + i * 0.05);
        osc.stop(t + i * 0.05 + 0.22);
      });
    } catch {}
  }

  wrong() {
    if (this.isMuted || !this.ctx) return;
    try {
      const t = this.ctx.currentTime;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      osc.type = "sawtooth";
      osc.frequency.setValueAtTime(180, t);
      osc.frequency.exponentialRampToValueAtTime(70, t + 0.25);
      gain.gain.setValueAtTime(0.09, t);
      gain.gain.exponentialRampToValueAtTime(0.001, t + 0.25);
      osc.connect(gain);
      gain.connect(this.ctx.destination);
      osc.start(t);
      osc.stop(t + 0.25);
    } catch {}
  }

  powerup() {
    if (this.isMuted || !this.ctx) return;
    try {
      const t = this.ctx.currentTime;
      [440, 554.37, 659.25, 880, 1108.73].forEach((f, i) => {
        const osc = this.ctx!.createOscillator();
        const gain = this.ctx!.createGain();
        osc.type = "sine";
        osc.frequency.setValueAtTime(f, t + i * 0.04);
        gain.gain.setValueAtTime(0.08, t + i * 0.04);
        gain.gain.exponentialRampToValueAtTime(0.001, t + i * 0.04 + 0.28);
        osc.connect(gain);
        gain.connect(this.ctx!.destination);
        osc.start(t + i * 0.04);
        osc.stop(t + i * 0.04 + 0.28);
      });
    } catch {}
  }

  nearMiss() {
    if (this.isMuted || !this.ctx) return;
    try {
      const t = this.ctx.currentTime;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      osc.type = "triangle";
      osc.frequency.setValueAtTime(600, t);
      osc.frequency.exponentialRampToValueAtTime(150, t + 0.15);
      gain.gain.setValueAtTime(0.06, t);
      gain.gain.exponentialRampToValueAtTime(0.001, t + 0.15);
      osc.connect(gain);
      gain.connect(this.ctx.destination);
      osc.start(t);
      osc.stop(t + 0.15);
    } catch {}
  }

  empShockwave() {
    if (this.isMuted || !this.ctx) return;
    try {
      const t = this.ctx.currentTime;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      osc.type = "sawtooth";
      osc.frequency.setValueAtTime(180, t);
      osc.frequency.exponentialRampToValueAtTime(40, t + 0.45);
      gain.gain.setValueAtTime(0.12, t);
      gain.gain.exponentialRampToValueAtTime(0.001, t + 0.45);
      osc.connect(gain);
      gain.connect(this.ctx.destination);
      osc.start(t);
      osc.stop(t + 0.45);
    } catch {}
  }

  rockExplode() {
    if (this.isMuted || !this.ctx) return;
    try {
      const t = this.ctx.currentTime;
      const bSize = this.ctx.sampleRate * 0.2;
      const buffer = this.ctx.createBuffer(1, bSize, this.ctx.sampleRate);
      const data = buffer.getChannelData(0);
      for (let i = 0; i < bSize; i++) data[i] = Math.random() * 2 - 1;

      const noise = this.ctx.createBufferSource();
      noise.buffer = buffer;
      const filter = this.ctx.createBiquadFilter();
      filter.type = "lowpass";
      filter.frequency.setValueAtTime(350, t);
      filter.frequency.exponentialRampToValueAtTime(45, t + 0.2);

      const gain = this.ctx.createGain();
      gain.gain.setValueAtTime(0.09, t);
      gain.gain.exponentialRampToValueAtTime(0.001, t + 0.2);

      noise.connect(filter);
      filter.connect(gain);
      gain.connect(this.ctx.destination);
      noise.start(t);
      noise.stop(t + 0.2);
    } catch {}
  }

  warpGate() {
    if (this.isMuted || !this.ctx) return;
    try {
      const t = this.ctx.currentTime;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      osc.type = "sine";
      osc.frequency.setValueAtTime(140, t);
      osc.frequency.exponentialRampToValueAtTime(880, t + 0.65);
      gain.gain.setValueAtTime(0.09, t);
      gain.gain.exponentialRampToValueAtTime(0.001, t + 0.75);
      osc.connect(gain);
      gain.connect(this.ctx.destination);
      osc.start(t);
      osc.stop(t + 0.75);
    } catch {}
  }

  select() {
    if (this.isMuted || !this.ctx) return;
    try {
      const t = this.ctx.currentTime;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      osc.type = "sine";
      osc.frequency.setValueAtTime(523.25, t);
      osc.frequency.exponentialRampToValueAtTime(783.99, t + 0.12);
      gain.gain.setValueAtTime(0.06, t);
      gain.gain.exponentialRampToValueAtTime(0.001, t + 0.15);
      osc.connect(gain);
      gain.connect(this.ctx.destination);
      osc.start(t);
      osc.stop(t + 0.15);
    } catch {}
  }

  // Subtle Ethereal Meteor Streak Sound (Gentle, low-volume ion whoosh & celestial starlight shimmer)
  meteorStreak() {
    if (this.isMuted || !this.ctx) return;
    try {
      const t = this.ctx.currentTime;
      const dur = 0.95;

      // 1. Soft Bandpassed Ion Streak (Airy gentle Doppler whoosh - distinct from low ambient drone)
      const bSize = Math.floor(this.ctx.sampleRate * dur);
      const buffer = this.ctx.createBuffer(1, bSize, this.ctx.sampleRate);
      const data = buffer.getChannelData(0);
      let lastVal = 0;
      for (let i = 0; i < bSize; i++) {
        const white = Math.random() * 2 - 1;
        lastVal = (lastVal * 0.88) + (white * 0.12);
        data[i] = lastVal * 1.5;
      }
      const noise = this.ctx.createBufferSource();
      noise.buffer = buffer;

      const bpFilter = this.ctx.createBiquadFilter();
      bpFilter.type = "bandpass";
      bpFilter.frequency.setValueAtTime(1600, t);
      bpFilter.frequency.exponentialRampToValueAtTime(550, t + dur);
      bpFilter.Q.setValueAtTime(2.4, t);

      const noiseGain = this.ctx.createGain();
      noiseGain.gain.setValueAtTime(0.0001, t);
      noiseGain.gain.linearRampToValueAtTime(0.035, t + 0.12); // Very low, gentle volume
      noiseGain.gain.exponentialRampToValueAtTime(0.0001, t + dur);

      noise.connect(bpFilter);
      bpFilter.connect(noiseGain);
      noiseGain.connect(this.ctx.destination);
      noise.start(t);
      noise.stop(t + dur);

      // 2. Delicate High Crystalline Glissando (Celestial Starlight Trail)
      const shimmerOsc = this.ctx.createOscillator();
      const shimmerGain = this.ctx.createGain();
      shimmerOsc.type = "sine";
      shimmerOsc.frequency.setValueAtTime(1420, t);
      shimmerOsc.frequency.exponentialRampToValueAtTime(980, t + dur);

      shimmerGain.gain.setValueAtTime(0.0001, t);
      shimmerGain.gain.linearRampToValueAtTime(0.016, t + 0.08); // Whisper quiet starlight glint
      shimmerGain.gain.exponentialRampToValueAtTime(0.0001, t + dur);

      shimmerOsc.connect(shimmerGain);
      shimmerGain.connect(this.ctx.destination);
      shimmerOsc.start(t);
      shimmerOsc.stop(t + dur);
    } catch {}
  }

  // Sci-Fi Holographic Comms Transmission Chirp & Telemetry Sound
  hologramTransmission() {
    if (this.isMuted || !this.ctx) return;
    try {
      const t = this.ctx.currentTime;
      // 1. Triple telemetry chirp
      [880, 1318.5, 1760, 2200].forEach((freq, idx) => {
        const osc = this.ctx!.createOscillator();
        const gain = this.ctx!.createGain();
        osc.type = "sine";
        osc.frequency.setValueAtTime(freq, t + idx * 0.055);
        gain.gain.setValueAtTime(0.0001, t + idx * 0.055);
        gain.gain.linearRampToValueAtTime(0.045, t + idx * 0.055 + 0.015);
        gain.gain.exponentialRampToValueAtTime(0.0001, t + idx * 0.055 + 0.12);
        osc.connect(gain);
        gain.connect(this.ctx!.destination);
        osc.start(t + idx * 0.055);
        osc.stop(t + idx * 0.055 + 0.13);
      });
      // 2. Soft atmospheric carrier wave
      const carrier = this.ctx.createOscillator();
      const carrierGain = this.ctx.createGain();
      carrier.type = "triangle";
      carrier.frequency.setValueAtTime(520, t + 0.22);
      carrier.frequency.exponentialRampToValueAtTime(1040, t + 0.55);
      carrierGain.gain.setValueAtTime(0.0001, t + 0.22);
      carrierGain.gain.linearRampToValueAtTime(0.025, t + 0.3);
      carrierGain.gain.exponentialRampToValueAtTime(0.0001, t + 0.75);
      carrier.connect(carrierGain);
      carrierGain.connect(this.ctx.destination);
      carrier.start(t + 0.22);
      carrier.stop(t + 0.75);
    } catch {}
  }

  // Soft mechanical cable deploy / reel whoosh
  ropeDeploy() {
    if (this.isMuted || !this.ctx) return;
    try {
      const t = this.ctx.currentTime;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      osc.type = "triangle";
      osc.frequency.setValueAtTime(320, t);
      osc.frequency.exponentialRampToValueAtTime(160, t + 0.45);
      gain.gain.setValueAtTime(0.0001, t);
      gain.gain.linearRampToValueAtTime(0.03, t + 0.05);
      gain.gain.exponentialRampToValueAtTime(0.0001, t + 0.45);
      osc.connect(gain);
      gain.connect(this.ctx.destination);
      osc.start(t);
      osc.stop(t + 0.45);
    } catch {}
  }

  // Futuristic digital holographic letter chirp
  typewriterChirp() {
    if (this.isMuted || !this.ctx) return;
    try {
      const t = this.ctx.currentTime;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      osc.type = "sine";
      const freq = 1600 + Math.random() * 600;
      osc.frequency.setValueAtTime(freq, t);
      osc.frequency.exponentialRampToValueAtTime(freq * 0.7, t + 0.03);
      gain.gain.setValueAtTime(0.0001, t);
      gain.gain.linearRampToValueAtTime(0.018, t + 0.004);
      gain.gain.exponentialRampToValueAtTime(0.0001, t + 0.03);
      osc.connect(gain);
      gain.connect(this.ctx.destination);
      osc.start(t);
      osc.stop(t + 0.035);
    } catch {}
  }

  // Sci-Fi Holographic terminal opening upward beam sound
  hologramOpen() {
    if (this.isMuted || !this.ctx) return;
    try {
      const t = this.ctx.currentTime;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      osc.type = "sine";
      osc.frequency.setValueAtTime(240, t);
      osc.frequency.exponentialRampToValueAtTime(1450, t + 0.45);
      gain.gain.setValueAtTime(0.0001, t);
      gain.gain.linearRampToValueAtTime(0.045, t + 0.08);
      gain.gain.exponentialRampToValueAtTime(0.0001, t + 0.5);
      osc.connect(gain);
      gain.connect(this.ctx.destination);
      osc.start(t);
      osc.stop(t + 0.5);
    } catch {}
  }

  // Sci-Fi Holographic terminal collapsing downward beam sound
  hologramClose() {
    if (this.isMuted || !this.ctx) return;
    try {
      const t = this.ctx.currentTime;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      osc.type = "sine";
      osc.frequency.setValueAtTime(1200, t);
      osc.frequency.exponentialRampToValueAtTime(180, t + 0.35);
      gain.gain.setValueAtTime(0.0001, t);
      gain.gain.linearRampToValueAtTime(0.038, t + 0.05);
      gain.gain.exponentialRampToValueAtTime(0.0001, t + 0.4);
      osc.connect(gain);
      gain.connect(this.ctx.destination);
      osc.start(t);
      osc.stop(t + 0.4);
    } catch {}
  }
}

const audio = new SpaceAudioEngine();

// ==============================================================
// 3D CONCENTRIC SOLAR SYSTEM ARCHITECTURE (5 ORBITS & 10 CELESTIAL STATIONS)
// ==============================================================

const SYSTEM_CENTER = { x: 50, y: 43 }; // Gravitational Stellar Core Percentage Center

interface OrbitRingConfig {
  index: number;
  rx: number;
  ry: number;
  name: string;
}

// Naturally proportioned elliptical orbits (10 dedicated concentric rings for each celestial planet)
const ORBIT_RINGS: OrbitRingConfig[] = [
  { index: 0, rx: 11.2, ry: 6.7, name: "المدار الأول" },
  { index: 1, rx: 15.0, ry: 9.0, name: "المدار الثاني" },
  { index: 2, rx: 18.8, ry: 11.2, name: "المدار الثالث" },
  { index: 3, rx: 22.6, ry: 13.5, name: "المدار الرابع" },
  { index: 4, rx: 26.4, ry: 15.8, name: "المدار الخامس" },
  { index: 5, rx: 30.2, ry: 18.0, name: "المدار السادس" },
  { index: 6, rx: 34.0, ry: 20.3, name: "المدار السابع" },
  { index: 7, rx: 37.8, ry: 22.6, name: "المدار الثامن" },
  { index: 8, rx: 41.6, ry: 24.8, name: "المدار التاسع" },
  { index: 9, rx: 45.4, ry: 27.1, name: "المدار العاشر" }
];

// Belt of drifting micro-asteroids between Orbit 2 and Orbit 3
const ASTEROID_BELT_NODES = [
  { id: 1, angle: 18, size: 4 },
  { id: 2, angle: 62, size: 3.5 },
  { id: 3, angle: 110, size: 4.5 },
  { id: 4, angle: 155, size: 3.5 },
  { id: 5, angle: 200, size: 5 },
  { id: 6, angle: 245, size: 4 },
  { id: 7, angle: 290, size: 4 },
  { id: 8, angle: 335, size: 3.5 }
];

interface MapPlanetNode {
  id: string;
  name: string;
  sub: string;
  orbitIndex: number; // 0 to 9 (each planet has its own dedicated concentric orbit track)
  startAngle: number; // Initial position on elliptical orbit in degrees (0..360)
  orbitPeriod: number; // Synchronized harmonic cosmic clockwork (s)
  baseSize: number; // Base sphere size in pixels
  type: string;
  img: string; // Photorealistic NASA planetary photographic asset
  glowColor: string;
  rotationDuration: number; // Self-rotation duration around its own axis (s)
  x: number;
  y: number;
  size: number;
}

// 10 CANONICAL CELESTIAL STATIONS WITH HARMONIC 36° DECAGRAM BALANCED DISTRIBUTION
// Distributed uniformly around the 360° compass (0°, 36°, 72°, 108°, 144°, 180°, 216°, 252°, 288°, 324°).
// Each of the 10 planets has its OWN dedicated orbit ring (0..9) with radially interleaved placement
// (0 -> 5 -> 1 -> 6 -> 2 -> 7 -> 3 -> 8 -> 4 -> 9). All planets share the exact same 76s harmonic
// period with organic sinusoidal velocity modulation, guaranteeing they remain permanently and
// enchantingly balanced across every quadrant of the cosmos without ever clumping or leaving gaps.
const MAP_NODES: MapPlanetNode[] = [
  { 
    id: "sentence", 
    name: "الجملة", 
    sub: "اسمية • فعلية", 
    orbitIndex: 0,
    startAngle: 0, // Sector 0 (East / 0°)
    orbitPeriod: 76,
    baseSize: 64,
    type: "sentence", 
    img: realisticCyanPlanet, 
    glowColor: "rgba(6, 182, 212, 0.9)",
    rotationDuration: 6.5,
    x: 61.2,
    y: 43.0,
    size: 64
  },
  { 
    id: "letters", 
    name: "الحروف", 
    sub: "نقاط • مد • شدة", 
    orbitIndex: 5,
    startAngle: 36, // Sector 1 (East-North-East / 36°)
    orbitPeriod: 76,
    baseSize: 74,
    type: "letters", 
    img: goldenRingPlanet, 
    glowColor: "rgba(99, 102, 241, 0.9)",
    rotationDuration: 10.5,
    x: 74.4,
    y: 53.6,
    size: 74
  },
  { 
    id: "hamza", 
    name: "الهمزات", 
    sub: "وصل • قطع • متوسطة", 
    orbitIndex: 1,
    startAngle: 72, // Sector 2 (South-East / 72°)
    orbitPeriod: 76,
    baseSize: 66,
    type: "hamza", 
    img: realisticRedMars, 
    glowColor: "rgba(225, 29, 72, 0.9)",
    rotationDuration: 5.0,
    x: 54.6,
    y: 51.6,
    size: 66
  },
  { 
    id: "styles", 
    name: "الأساليب", 
    sub: "استفهام • نفي • أمر", 
    orbitIndex: 6,
    startAngle: 108, // Sector 3 (South-South-East / 108°)
    orbitPeriod: 76,
    baseSize: 74,
    type: "styles", 
    img: realisticGoldenGasGiant, 
    glowColor: "rgba(217, 119, 6, 0.9)",
    rotationDuration: 6.0,
    x: 39.5,
    y: 62.3,
    size: 74
  },
  { 
    id: "meanings", 
    name: "المعنى", 
    sub: "مرادفات • أضداد", 
    orbitIndex: 2,
    startAngle: 144, // Sector 4 (South-West / 144°)
    orbitPeriod: 76,
    baseSize: 64,
    type: "meanings", 
    img: realisticOrangePlanet, 
    glowColor: "rgba(234, 88, 12, 0.9)",
    rotationDuration: 12.0,
    x: 34.8,
    y: 49.6,
    size: 64
  },
  { 
    id: "morphology", 
    name: "التصريف", 
    sub: "تثنية • جمع • أفعال", 
    orbitIndex: 7,
    startAngle: 180, // Sector 5 (West / 180°)
    orbitPeriod: 76,
    baseSize: 74,
    type: "morphology", 
    img: realisticPurplePlanet, 
    glowColor: "rgba(168, 85, 247, 0.9)",
    rotationDuration: 8.5,
    x: 12.2,
    y: 43.0,
    size: 74
  },
  { 
    id: "word", 
    name: "الكلمة", 
    sub: "اسم • فعل • حرف", 
    orbitIndex: 3,
    startAngle: 216, // Sector 6 (West-South-West / 216°)
    orbitPeriod: 76,
    baseSize: 72,
    type: "word", 
    img: realisticOceanicPlanet, 
    glowColor: "rgba(2, 132, 199, 0.9)",
    rotationDuration: 4.5,
    x: 31.7,
    y: 35.1,
    size: 72
  },
  { 
    id: "syntax", 
    name: "الإعراب", 
    sub: "رفع • نصب • جر", 
    orbitIndex: 8,
    startAngle: 252, // Sector 7 (North-North-West / 252°)
    orbitPeriod: 76,
    baseSize: 88,
    type: "syntax", 
    img: realisticSaturnRings, 
    glowColor: "rgba(234, 179, 8, 0.9)",
    rotationDuration: 7.5,
    x: 37.1,
    y: 19.4,
    size: 88
  },
  { 
    id: "structures", 
    name: "التركيب", 
    sub: "إضافة • صفة • جر", 
    orbitIndex: 4,
    startAngle: 288, // Sector 8 (North / 288°)
    orbitPeriod: 76,
    baseSize: 76,
    type: "structures", 
    img: realisticEmeraldPlanet, 
    glowColor: "rgba(5, 150, 105, 0.9)",
    rotationDuration: 5.5,
    x: 58.2,
    y: 28.0,
    size: 76
  },
  { 
    id: "spelling", 
    name: "الكتابة", 
    sub: "تاء • تنوين • ترقيم", 
    orbitIndex: 9,
    startAngle: 324, // Sector 9 (North-East / 324°)
    orbitPeriod: 76,
    baseSize: 66,
    type: "spelling", 
    img: realisticMoonSurface, 
    glowColor: "rgba(148, 163, 184, 0.9)",
    rotationDuration: 9.5,
    x: 86.7,
    y: 27.1,
    size: 66
  }
];

// ==============================================================
// UNIQUE LIVING ATMOSPHERES & HOLOGRAPHIC MISSIONS FOR ALL 10 PLANETS
// ==============================================================
export interface FloatingSpaceRock {
  id: number;
  x: number;
  y: number;
  size: number;
  duration: number;
  delay: number;
  rotSpeed: number;
  color: string;
}

export interface RockPalette {
  highlight: string;
  mid: string;
  shadow: string;
  void: string;
  craterShadow: string;
  craterRim: string;
  veinGlow: string;
  backlight: string;
}

export interface CometPalette {
  core: string;
  comaInner: string;
  comaOuter: string;
  tailGrad: [string, string, string, string];
  tailCore: string;
  sparkle: string;
}

export interface PlanetAtmosphere {
  id: string;
  name: string;
  sub: string;
  distressTarget: string;
  environmentName: string;
  distressMessage: string;
  targetSamplePills: string[];
  wrongSamplePills: string[];
  objectiveNotice: string;
  skyGradient: string;
  nebulaGlow: string;
  cosmosBgImg: string;
  planetImg: string;
  interiorLandscapeImg: string;
  horizonImg: string;
  ambientColor: string;
  accentNeon: string;
  accentBorder: string;
  rockPalette: RockPalette;
  cometPalette: CometPalette;
  meteorStreakColor: string;
  rockBaseColor: string;
  rockGlowColor: string;
  rockAccentColor: string;
  floatingRocks: FloatingSpaceRock[];
}

export const PLANET_ATMOSPHERES: Record<string, PlanetAtmosphere> = {
  letters: {
    id: "letters",
    name: "كوكب الحروف",
    sub: "حروف الجر الأصلية • رسم الحروف",
    distressTarget: "حروف الجر الأصلية",
    environmentName: "سدم وغبار كوكب الحروف البلورية",
    distressMessage: "المهمة: اصطد حروف الجر الأصلية السليمة!",
    targetSamplePills: ["مِنْ", "إِلَى", "عَنْ", "عَلَى", "فِي", "الْبَاء", "اللَّام", "الْكَاف"],
    wrongSamplePills: ["إِنَّ (ناسخ)", "أَنَّ (ناسخ)", "هَلْ (استفهام)", "ثُمَّ (عطف)"],
    objectiveNotice: "اصطد بلورات حروف الجر الأصلية وتفادَ الحروف الناسخة والكويكبات السريعة!",
    skyGradient: "radial-gradient(ellipse at 50% 30%, #0c1538 0%, #060b24 55%, #020412 100%)",
    nebulaGlow: "rgba(99, 102, 241, 0.35)",
    cosmosBgImg: vibrantCinematicSpaceNebula,
    planetImg: goldenRingPlanet,
    interiorLandscapeImg: vibrantCinematicSpaceNebula,
    horizonImg: goldenRingPlanet,
    ambientColor: "#6366f1",
    accentNeon: "#818cf8",
    accentBorder: "rgba(99, 102, 241, 0.65)",
    rockPalette: {
      highlight: "#c7d2fe",
      mid: "#4f46e5",
      shadow: "#1e1b4b",
      void: "#0a0927",
      craterShadow: "#131138",
      craterRim: "rgba(129, 140, 248, 0.65)",
      veinGlow: "#a5b4fc",
      backlight: "rgba(99, 102, 241, 0.55)"
    },
    cometPalette: {
      core: "#ffffff",
      comaInner: "rgba(199, 210, 254, 0.95)",
      comaOuter: "rgba(99, 102, 241, 0.35)",
      tailGrad: ["rgba(255, 255, 255, 0.95)", "rgba(129, 140, 248, 0.85)", "rgba(99, 102, 241, 0.5)", "rgba(49, 46, 129, 0)"],
      tailCore: "#ffffff",
      sparkle: "#c7d2fe"
    },
    meteorStreakColor: "#818cf8",
    rockBaseColor: "#1e1b4b",
    rockGlowColor: "#818cf8",
    rockAccentColor: "#c7d2fe",
    floatingRocks: [
      { id: 1, x: 12, y: 22, size: 28, duration: 24, delay: 0, rotSpeed: 45, color: "#1e1b4b" },
      { id: 2, x: 84, y: 18, size: 36, duration: 29, delay: 3, rotSpeed: -50, color: "#312e81" },
      { id: 3, x: 18, y: 72, size: 22, duration: 20, delay: 1.5, rotSpeed: 38, color: "#1e1b4b" },
      { id: 4, x: 88, y: 76, size: 32, duration: 26, delay: 4, rotSpeed: -42, color: "#312e81" },
      { id: 5, x: 74, y: 44, size: 18, duration: 18, delay: 2, rotSpeed: 60, color: "#1e1b4b" }
    ]
  },
  word: {
    id: "word",
    name: "كوكب الكلمة",
    sub: "الأسماء الصريحة • الأفعال • الحروف",
    distressTarget: "الأسماء الصريحة النقية",
    environmentName: "أمواج وأعماق كوكب الكلمة المحيطية العميقة",
    distressMessage: "المهمة: اصطد الأسماء الصريحة النقية!",
    targetSamplePills: ["طَالِب", "طَبِيب", "حِصَان", "شَجَرَة", "قَلَم", "كِتَاب", "عُمَان", "زَهْرَة"],
    wrongSamplePills: ["يَكْتُبُ (فعل)", "سَافَرَ (فعل)", "فِي (حرف)", "عَلَى (حرف)"],
    objectiveNotice: "التقط الأسماء فقط وتفادَ الأفعال والحروف والصخور الكونية المتساقطة!",
    skyGradient: "radial-gradient(ellipse at 50% 25%, #082f49 0%, #031c2d 55%, #010c14 100%)",
    nebulaGlow: "rgba(2, 132, 199, 0.38)",
    cosmosBgImg: planetOceanicDeep,
    planetImg: realisticOceanicPlanet,
    interiorLandscapeImg: planetOceanicDeep,
    horizonImg: realisticOceanicPlanet,
    ambientColor: "#0284c7",
    accentNeon: "#38bdf8",
    accentBorder: "rgba(2, 132, 199, 0.65)",
    rockPalette: {
      highlight: "#bae6fd",
      mid: "#0284c7",
      shadow: "#082f49",
      void: "#021422",
      craterShadow: "#041c2c",
      craterRim: "rgba(56, 189, 248, 0.65)",
      veinGlow: "#00f0ff",
      backlight: "rgba(56, 189, 248, 0.55)"
    },
    cometPalette: {
      core: "#ffffff",
      comaInner: "rgba(186, 230, 253, 0.95)",
      comaOuter: "rgba(2, 132, 199, 0.35)",
      tailGrad: ["rgba(255, 255, 255, 0.95)", "rgba(56, 189, 248, 0.85)", "rgba(2, 132, 199, 0.5)", "rgba(12, 74, 110, 0)"],
      tailCore: "#ffffff",
      sparkle: "#bae6fd"
    },
    meteorStreakColor: "#38bdf8",
    rockBaseColor: "#082f49",
    rockGlowColor: "#38bdf8",
    rockAccentColor: "#bae6fd",
    floatingRocks: [
      { id: 1, x: 14, y: 26, size: 30, duration: 26, delay: 0.5, rotSpeed: 40, color: "#0c2b3d" },
      { id: 2, x: 82, y: 20, size: 38, duration: 32, delay: 2, rotSpeed: -48, color: "#075985" },
      { id: 3, x: 22, y: 68, size: 24, duration: 22, delay: 1, rotSpeed: 52, color: "#0c2b3d" },
      { id: 4, x: 85, y: 70, size: 34, duration: 28, delay: 3.5, rotSpeed: -35, color: "#075985" }
    ]
  },
  hamza: {
    id: "hamza",
    name: "كوكب الهمزات",
    sub: "وصل • قطع • متوسطة • متطرفة",
    distressTarget: "همزات الوصل والقطع السليمة",
    environmentName: "أودية الحمم البركانية والصخور البازلتية",
    distressMessage: "المهمة: اصطد همزات الوصل والقطع الصحيحة!",
    targetSamplePills: ["أَخَذَ", "إِكْرَام", "اسْتَغْفَرَ", "سَمَاء", "مَسْؤُول", "فِئَة", "دِفْء"],
    wrongSamplePills: ["إسم* (خطأ)", "أبن* (خطأ)", "أمرأة* (خطأ)", "استغفرَ* (خطأ)"],
    objectiveNotice: "التقط كلمات الهمزة الصحيحة وتفادَ الشظايا المشتعلة والكلمات الخاطئة!",
    skyGradient: "radial-gradient(ellipse at 50% 30%, #450a1a 0%, #20040c 55%, #0a0104 100%)",
    nebulaGlow: "rgba(225, 29, 72, 0.40)",
    cosmosBgImg: planetVolcanicMars,
    planetImg: realisticRedMars,
    interiorLandscapeImg: planetVolcanicMars,
    horizonImg: realisticRedMars,
    ambientColor: "#e11d48",
    accentNeon: "#fb7185",
    accentBorder: "rgba(225, 29, 72, 0.70)",
    rockPalette: {
      highlight: "#fed7aa",
      mid: "#e11d48",
      shadow: "#4c0519",
      void: "#1a0208",
      craterShadow: "#28030d",
      craterRim: "rgba(251, 113, 133, 0.65)",
      veinGlow: "#ff2d55",
      backlight: "rgba(244, 63, 94, 0.6)"
    },
    cometPalette: {
      core: "#ffffff",
      comaInner: "rgba(254, 205, 211, 0.95)",
      comaOuter: "rgba(225, 29, 72, 0.35)",
      tailGrad: ["rgba(255, 255, 255, 0.95)", "rgba(251, 113, 133, 0.85)", "rgba(225, 29, 72, 0.5)", "rgba(136, 19, 55, 0)"],
      tailCore: "#ffffff",
      sparkle: "#fecdd3"
    },
    meteorStreakColor: "#fb7185",
    rockBaseColor: "#4c0519",
    rockGlowColor: "#f43f5e",
    rockAccentColor: "#fed7aa",
    floatingRocks: [
      { id: 1, x: 10, y: 24, size: 32, duration: 22, delay: 0, rotSpeed: 55, color: "#4c0519" },
      { id: 2, x: 86, y: 28, size: 40, duration: 27, delay: 1.8, rotSpeed: -45, color: "#881337" },
      { id: 3, x: 20, y: 74, size: 26, duration: 25, delay: 3, rotSpeed: 42, color: "#4c0519" },
      { id: 4, x: 80, y: 78, size: 35, duration: 23, delay: 2.2, rotSpeed: -58, color: "#881337" }
    ]
  },
  sentence: {
    id: "sentence",
    name: "كوكب الجملة",
    sub: "الجمل الاسمية • المبتدأ والخبر",
    distressTarget: "الجمل الاسمية المفيدة التامة",
    environmentName: "أعماق البلازما الجليدية والأيونات السماوية",
    distressMessage: "المهمة: اصطد الجمل الاسمية المفيدة التامة!",
    targetSamplePills: ["العِلْمُ نُورٌ", "السَّمَاءُ صَافِيَةٌ", "الشَّمْسُ مُشْرِقَةٌ", "الْكِتَابُ مُفِيدٌ"],
    wrongSamplePills: ["يَكْتُبُ الطَّالِبُ", "فِي الصَّبَاحِ...", "قَرَأَ الْوَلَدُ"],
    objectiveNotice: "اصطد الجمل الاسمية المفيدة التامة وتجنب الجمل الناقصة والصخور الفضائية!",
    skyGradient: "radial-gradient(ellipse at 50% 28%, #083344 0%, #031c27 55%, #010d13 100%)",
    nebulaGlow: "rgba(6, 182, 212, 0.38)",
    cosmosBgImg: turquoiseCosmosBg,
    planetImg: realisticCyanPlanet,
    interiorLandscapeImg: turquoiseCosmosBg,
    horizonImg: realisticCyanPlanet,
    ambientColor: "#06b6d4",
    accentNeon: "#67e8f9",
    accentBorder: "rgba(6, 182, 212, 0.65)",
    rockPalette: {
      highlight: "#a5f3fc",
      mid: "#06b6d4",
      shadow: "#083344",
      void: "#021720",
      craterShadow: "#04232e",
      craterRim: "rgba(103, 232, 249, 0.65)",
      veinGlow: "#22d3ee",
      backlight: "rgba(6, 182, 212, 0.55)"
    },
    cometPalette: {
      core: "#ffffff",
      comaInner: "rgba(165, 243, 252, 0.95)",
      comaOuter: "rgba(6, 182, 212, 0.35)",
      tailGrad: ["rgba(255, 255, 255, 0.95)", "rgba(103, 232, 249, 0.85)", "rgba(6, 182, 212, 0.5)", "rgba(21, 94, 117, 0)"],
      tailCore: "#ffffff",
      sparkle: "#a5f3fc"
    },
    meteorStreakColor: "#22d3ee",
    rockBaseColor: "#083344",
    rockGlowColor: "#22d3ee",
    rockAccentColor: "#a5f3fc",
    floatingRocks: [
      { id: 1, x: 12, y: 18, size: 28, duration: 25, delay: 0.8, rotSpeed: 44, color: "#164e63" },
      { id: 2, x: 84, y: 22, size: 36, duration: 30, delay: 2.5, rotSpeed: -52, color: "#083344" },
      { id: 3, x: 16, y: 70, size: 24, duration: 22, delay: 1.2, rotSpeed: 38, color: "#164e63" },
      { id: 4, x: 82, y: 72, size: 30, duration: 27, delay: 4, rotSpeed: -40, color: "#083344" }
    ]
  },
  styles: {
    id: "styles",
    name: "كوكب الأساليب",
    sub: "استفهام • نداء • تعجب • أمر",
    distressTarget: "أساليب النداء والاستفهام والتعجب",
    environmentName: "عواصف الغاز الشمسي والحرارة الذهبية",
    distressMessage: "المهمة: اصطد أساليب النداء والاستفهام والتعجب!",
    targetSamplePills: ["يَا مُحَمَّدُ!", "مَا أَجْمَلَ النُّجُومَ!", "هَلْ فَهِمْتَ؟", "اكْتُبْ دَرْسَكَ!"],
    wrongSamplePills: ["كَتَبَ التِّلْمِيذُ (خبر)", "الْجَوُّ بَارِدٌ (خبر)", "شَرِبَ الْمَاءَ"],
    objectiveNotice: "ميّز الأساليب البلاغية المطلوبة واصطدها وتفادَ الجمل الخبرية العادية!",
    skyGradient: "radial-gradient(ellipse at 50% 30%, #451a03 0%, #220b01 55%, #0f0500 100%)",
    nebulaGlow: "rgba(217, 119, 6, 0.40)",
    cosmosBgImg: solarSystemCosmosBg,
    planetImg: realisticGoldenGasGiant,
    interiorLandscapeImg: solarSystemCosmosBg,
    horizonImg: realisticGoldenGasGiant,
    ambientColor: "#d97706",
    accentNeon: "#fbbf24",
    accentBorder: "rgba(217, 119, 6, 0.70)",
    rockPalette: {
      highlight: "#fef08a",
      mid: "#d97706",
      shadow: "#451a03",
      void: "#1a0901",
      craterShadow: "#281002",
      craterRim: "rgba(251, 191, 36, 0.65)",
      veinGlow: "#f59e0b",
      backlight: "rgba(217, 119, 6, 0.55)"
    },
    cometPalette: {
      core: "#ffffff",
      comaInner: "rgba(254, 240, 138, 0.95)",
      comaOuter: "rgba(217, 119, 6, 0.35)",
      tailGrad: ["rgba(255, 255, 255, 0.95)", "rgba(251, 191, 36, 0.85)", "rgba(217, 119, 6, 0.5)", "rgba(120, 53, 15, 0)"],
      tailCore: "#ffffff",
      sparkle: "#fef08a"
    },
    meteorStreakColor: "#fbbf24",
    rockBaseColor: "#451a03",
    rockGlowColor: "#f59e0b",
    rockAccentColor: "#fef08a",
    floatingRocks: [
      { id: 1, x: 14, y: 25, size: 32, duration: 24, delay: 0.2, rotSpeed: 48, color: "#78350f" },
      { id: 2, x: 85, y: 24, size: 38, duration: 28, delay: 1.5, rotSpeed: -42, color: "#451a03" },
      { id: 3, x: 18, y: 75, size: 26, duration: 21, delay: 3.2, rotSpeed: 50, color: "#78350f" },
      { id: 4, x: 84, y: 74, size: 34, duration: 26, delay: 2.1, rotSpeed: -38, color: "#451a03" }
    ]
  },
  structures: {
    id: "structures",
    name: "كوكب التركيب",
    sub: "التراكيب الإضافية • الصفة • الجر",
    distressTarget: "التراكيب الإضافية والوصفية السليمة",
    environmentName: "أعماق الكهوف والمسلات الزمردية الكريستالية",
    distressMessage: "المهمة: اصطد التراكيب الإضافية والوصفية السليمة!",
    targetSamplePills: ["طَالِبُ العِلْمِ", "سَفِينَةُ الفَضَاءِ", "حَدِيقَةٌ نَضِرَةٌ", "فِي الْمَدْرَسَةِ"],
    wrongSamplePills: ["طَالِبٌ العِلْمُ*", "سَفِينَةً الفَضَاءِ*", "جَمِيلَةٌ حَدِيقَةٌ*"],
    objectiveNotice: "التقط التراكيب السليمة المترابطة وتفادَ التراكيب المشوهة والشظايا الفضائية!",
    skyGradient: "radial-gradient(ellipse at 50% 30%, #064e3b 0%, #022c22 55%, #01140e 100%)",
    nebulaGlow: "rgba(5, 150, 105, 0.38)",
    cosmosBgImg: planetEmeraldCrystals,
    planetImg: realisticEmeraldPlanet,
    interiorLandscapeImg: planetEmeraldCrystals,
    horizonImg: realisticEmeraldPlanet,
    ambientColor: "#059669",
    accentNeon: "#34d399",
    accentBorder: "rgba(5, 150, 105, 0.65)",
    rockPalette: {
      highlight: "#a7f3d0",
      mid: "#059669",
      shadow: "#064e3b",
      void: "#022118",
      craterShadow: "#032f22",
      craterRim: "rgba(52, 211, 153, 0.65)",
      veinGlow: "#10b981",
      backlight: "rgba(5, 150, 105, 0.55)"
    },
    cometPalette: {
      core: "#ffffff",
      comaInner: "rgba(167, 243, 208, 0.95)",
      comaOuter: "rgba(5, 150, 105, 0.35)",
      tailGrad: ["rgba(255, 255, 255, 0.95)", "rgba(52, 211, 153, 0.85)", "rgba(5, 150, 105, 0.5)", "rgba(4, 78, 59, 0)"],
      tailCore: "#ffffff",
      sparkle: "#a7f3d0"
    },
    meteorStreakColor: "#34d399",
    rockBaseColor: "#064e3b",
    rockGlowColor: "#10b981",
    rockAccentColor: "#a7f3d0",
    floatingRocks: [
      { id: 1, x: 11, y: 20, size: 30, duration: 26, delay: 0.4, rotSpeed: 42, color: "#064e3b" },
      { id: 2, x: 86, y: 24, size: 36, duration: 30, delay: 2.8, rotSpeed: -46, color: "#022c22" },
      { id: 3, x: 20, y: 72, size: 24, duration: 23, delay: 1.8, rotSpeed: 54, color: "#064e3b" },
      { id: 4, x: 80, y: 76, size: 32, duration: 27, delay: 3.5, rotSpeed: -36, color: "#022c22" }
    ]
  },
  syntax: {
    id: "syntax",
    name: "كوكب الإعراب",
    sub: "علامات الرفع الأصلية والفرعية • الفاعل والمبتدأ",
    distressTarget: "الكلمات المرفوعة (بالضمة، الواو، أو الألف)",
    environmentName: "الطبقات الجوية العلوية والغيوم الغازية الذهبية الدوارة",
    distressMessage: "المهمة: اصطد الكلمات المرفوعة بعلامات الرفع (الضمة، الألف، الواو)!",
    targetSamplePills: ["الطَّالِبُ (ضمة)", "الْمُعَلِّمُونَ (واو)", "الطَّالِبَانِ (ألف)", "الْمُهَنْدِسَاتُ (ضمة)", "أَبُوكَ (واو)"],
    wrongSamplePills: ["الْمُعَلِّمِينَ (نصب/جر)", "الطَّالِبَ (فتحة)", "أَبَاكَ (ألف نصب)"],
    objectiveNotice: "اصطد الكلمات المرفوعة بجميع علامات الرفع (الضمة، الواو، الألف) وتجنب المنصوبات والمجرورات وحطام الجليد!",
    skyGradient: "radial-gradient(ellipse at 50% 28%, #422006 0%, #1c0d02 55%, #0a0401 100%)",
    nebulaGlow: "rgba(234, 179, 8, 0.38)",
    cosmosBgImg: planetGasGiantRings,
    planetImg: realisticSaturnRings,
    interiorLandscapeImg: planetGasGiantRings,
    horizonImg: realisticSaturnRings,
    ambientColor: "#eab308",
    accentNeon: "#fde047",
    accentBorder: "rgba(234, 179, 8, 0.70)",
    rockPalette: {
      highlight: "#fef9c3",
      mid: "#ca8a04",
      shadow: "#422006",
      void: "#1a0c02",
      craterShadow: "#291303",
      craterRim: "rgba(250, 204, 21, 0.65)",
      veinGlow: "#eab308",
      backlight: "rgba(234, 179, 8, 0.55)"
    },
    cometPalette: {
      core: "#ffffff",
      comaInner: "rgba(254, 249, 195, 0.95)",
      comaOuter: "rgba(234, 179, 8, 0.35)",
      tailGrad: ["rgba(255, 255, 255, 0.95)", "rgba(250, 204, 21, 0.85)", "rgba(234, 179, 8, 0.5)", "rgba(113, 63, 18, 0)"],
      tailCore: "#ffffff",
      sparkle: "#fef9c3"
    },
    meteorStreakColor: "#fde047",
    rockBaseColor: "#713f12",
    rockGlowColor: "#eab308",
    rockAccentColor: "#fef9c3",
    floatingRocks: [
      { id: 1, x: 15, y: 22, size: 34, duration: 25, delay: 0.6, rotSpeed: 45, color: "#713f12" },
      { id: 2, x: 84, y: 26, size: 42, duration: 31, delay: 2.2, rotSpeed: -50, color: "#422006" },
      { id: 3, x: 18, y: 70, size: 26, duration: 22, delay: 1.4, rotSpeed: 40, color: "#713f12" },
      { id: 4, x: 82, y: 78, size: 36, duration: 29, delay: 3.8, rotSpeed: -44, color: "#422006" }
    ]
  },
  morphology: {
    id: "morphology",
    name: "كوكب التصريف",
    sub: "الأفعال • المشتقات • المثنى والجمع",
    distressTarget: "صيغ الأفعال والمشتقات الصرفية",
    environmentName: "التيارات الكهرومغناطيسية وسحب التصريف البنفسجية",
    distressMessage: "المهمة: اصطد صيغ الأفعال والمشتقات الصرفية!",
    targetSamplePills: ["كَاتِب (فاعل)", "مَكْتُوب (مفعول)", "انْطَلَقَ (ماضٍ)", "يَسْتَكْشِفُ (مضارع)"],
    wrongSamplePills: ["فِي", "عَلَى", "طَاوِلَة (جامد)", "جِدَار (جامد)"],
    objectiveNotice: "اصطد الصيغ الصرفية الصحيحة وتفادَ الأسماء الجامدة والحروف والصخور الفضائية!",
    skyGradient: "radial-gradient(ellipse at 50% 30%, #3b0764 0%, #1e0338 55%, #0b0114 100%)",
    nebulaGlow: "rgba(168, 85, 247, 0.40)",
    cosmosBgImg: cinematicWarpFlight,
    planetImg: realisticPurplePlanet,
    interiorLandscapeImg: cinematicWarpFlight,
    horizonImg: realisticPurplePlanet,
    ambientColor: "#a855f7",
    accentNeon: "#c084fc",
    accentBorder: "rgba(168, 85, 247, 0.70)",
    rockPalette: {
      highlight: "#f3e8ff",
      mid: "#9333ea",
      shadow: "#3b0764",
      void: "#18022b",
      craterShadow: "#24043f",
      craterRim: "rgba(192, 132, 252, 0.65)",
      veinGlow: "#c084fc",
      backlight: "rgba(168, 85, 247, 0.55)"
    },
    cometPalette: {
      core: "#ffffff",
      comaInner: "rgba(243, 232, 255, 0.95)",
      comaOuter: "rgba(168, 85, 247, 0.35)",
      tailGrad: ["rgba(255, 255, 255, 0.95)", "rgba(192, 132, 252, 0.85)", "rgba(168, 85, 247, 0.5)", "rgba(88, 28, 135, 0)"],
      tailCore: "#ffffff",
      sparkle: "#f3e8ff"
    },
    meteorStreakColor: "#c084fc",
    rockBaseColor: "#3b0764",
    rockGlowColor: "#c084fc",
    rockAccentColor: "#f3e8ff",
    floatingRocks: [
      { id: 1, x: 12, y: 24, size: 30, duration: 24, delay: 0.5, rotSpeed: 48, color: "#581c87" },
      { id: 2, x: 85, y: 20, size: 38, duration: 28, delay: 1.9, rotSpeed: -46, color: "#3b0764" },
      { id: 3, x: 22, y: 74, size: 26, duration: 23, delay: 3.1, rotSpeed: 52, color: "#581c87" },
      { id: 4, x: 81, y: 75, size: 34, duration: 27, delay: 2.3, rotSpeed: -38, color: "#3b0764" }
    ]
  },
  spelling: {
    id: "spelling",
    name: "كوكب الكتابة",
    sub: "التاء المربوطة • التاء المفتوحة • التنوين",
    distressTarget: "كلمات التاء المربوطة والمفتوحة والتنوين",
    environmentName: "فوهات وسهول ركام البازلت الفضي القمري",
    distressMessage: "المهمة: اصطد كلمات التاء والتنوين السليمة!",
    targetSamplePills: ["مَدْرَسَة", "مُعَلِّمَة", "بِنْت", "بُيُوت", "كِتَاباً", "قَلَمٌ", "ضَوْءاً"],
    wrongSamplePills: ["مدرست* (خطأ)", "بيوة* (خطأ)", "كتابن* (خطأ)", "قلمن* (خطأ)"],
    objectiveNotice: "التقط الكلمات المكتوبة وفق قواعد الإملاء وتفادَ الأخطاء الإملائية والشظايا!",
    skyGradient: "radial-gradient(ellipse at 50% 28%, #1e293b 0%, #0f172a 55%, #020617 100%)",
    nebulaGlow: "rgba(148, 163, 184, 0.35)",
    cosmosBgImg: planetLunarCraters,
    planetImg: realisticMoonSurface,
    interiorLandscapeImg: planetLunarCraters,
    horizonImg: realisticMoonSurface,
    ambientColor: "#94a3b8",
    accentNeon: "#cbd5e1",
    accentBorder: "rgba(148, 163, 184, 0.65)",
    rockPalette: {
      highlight: "#f8fafc",
      mid: "#64748b",
      shadow: "#1e293b",
      void: "#090d16",
      craterShadow: "#111827",
      craterRim: "rgba(203, 213, 225, 0.65)",
      veinGlow: "#e2e8f0",
      backlight: "rgba(148, 163, 184, 0.55)"
    },
    cometPalette: {
      core: "#ffffff",
      comaInner: "rgba(248, 250, 252, 0.95)",
      comaOuter: "rgba(148, 163, 184, 0.35)",
      tailGrad: ["rgba(255, 255, 255, 0.95)", "rgba(203, 213, 225, 0.85)", "rgba(148, 163, 184, 0.5)", "rgba(51, 65, 85, 0)"],
      tailCore: "#ffffff",
      sparkle: "#ffffff"
    },
    meteorStreakColor: "#cbd5e1",
    rockBaseColor: "#1e293b",
    rockGlowColor: "#94a3b8",
    rockAccentColor: "#ffffff",
    floatingRocks: [
      { id: 1, x: 13, y: 22, size: 32, duration: 26, delay: 0.7, rotSpeed: 40, color: "#334155" },
      { id: 2, x: 86, y: 25, size: 38, duration: 32, delay: 2.1, rotSpeed: -48, color: "#1e293b" },
      { id: 3, x: 17, y: 72, size: 24, duration: 22, delay: 1.5, rotSpeed: 55, color: "#334155" },
      { id: 4, x: 83, y: 76, size: 34, duration: 28, delay: 3.6, rotSpeed: -35, color: "#1e293b" }
    ]
  },
  meanings: {
    id: "meanings",
    name: "كوكب المعنى",
    sub: "المرادفات الفصيحة • الأضداد البلاغية",
    distressTarget: "المرادفات الفصيحة والأضداد البلاغية",
    environmentName: "كثبان الرمال الكهرمانية والنتوءات الصخرية الشاهقة",
    distressMessage: "المهمة: اصطد المرادفات والأضداد الدقيقة!",
    targetSamplePills: ["شُجَاع = بَطَل", "الْغَيْث = الْمَطَر", "نُور ≠ ظَلَام", "صِدْق ≠ كَذِب"],
    wrongSamplePills: ["مُرْتَفِع = مُنْخَفِض*", "بَعِيد = قَرِيب*", "حَارّ = بَارِد*"],
    objectiveNotice: "اصطد المرادفات والأضداد الدقيقة وتفادَ المعاني المتناقضة والكويكبات!",
    skyGradient: "radial-gradient(ellipse at 50% 30%, #431407 0%, #1f0701 55%, #0c0200 100%)",
    nebulaGlow: "rgba(234, 88, 12, 0.40)",
    cosmosBgImg: realisticDeepCosmos,
    planetImg: realisticOrangePlanet,
    interiorLandscapeImg: interiorAmberDunes,
    horizonImg: realisticOrangePlanet,
    ambientColor: "#ea580c",
    accentNeon: "#fb923c",
    accentBorder: "rgba(234, 88, 12, 0.70)",
    rockPalette: {
      highlight: "#ffedd5",
      mid: "#ea580c",
      shadow: "#431407",
      void: "#1c0702",
      craterShadow: "#2a0c04",
      craterRim: "rgba(251, 146, 60, 0.65)",
      veinGlow: "#f97316",
      backlight: "rgba(234, 88, 12, 0.55)"
    },
    cometPalette: {
      core: "#ffffff",
      comaInner: "rgba(255, 237, 213, 0.95)",
      comaOuter: "rgba(234, 88, 12, 0.35)",
      tailGrad: ["rgba(255, 255, 255, 0.95)", "rgba(251, 146, 60, 0.85)", "rgba(234, 88, 12, 0.5)", "rgba(124, 45, 18, 0)"],
      tailCore: "#ffffff",
      sparkle: "#fed7aa"
    },
    meteorStreakColor: "#fb923c",
    rockBaseColor: "#431407",
    rockGlowColor: "#ea580c",
    rockAccentColor: "#fde68a",
    floatingRocks: [
      { id: 1, x: 10, y: 22, size: 30, duration: 25, delay: 0.3, rotSpeed: 46, color: "#7c2d12" },
      { id: 2, x: 88, y: 26, size: 36, duration: 29, delay: 2.3, rotSpeed: -44, color: "#431407" },
      { id: 3, x: 16, y: 76, size: 24, duration: 22, delay: 1.6, rotSpeed: 52, color: "#7c2d12" },
      { id: 4, x: 82, y: 78, size: 34, duration: 28, delay: 3.4, rotSpeed: -38, color: "#431407" }
    ]
  }
};

// Helper: Generates GPU-accelerated 3D elliptical keyframes with natural planetary motion & smooth Z-depth
function generateSolarOrbitKeyframes(planets: MapPlanetNode[], rings: OrbitRingConfig[], center: { x: number; y: number }) {
  return planets.map(planet => {
    const ring = rings[planet.orbitIndex];
    const steps: string[] = [];
    const stepCount = 90; // High-precision 90 steps for ultra-silky sub-pixel motion
    for (let i = 0; i <= stepCount; i++) {
      const p = i / stepCount;
      // Keplerian motion: gentle orbital speed modulation (speeds up on front sweep, slows on rear sweep)
      const keplerVariation = Math.sin(p * 2 * Math.PI);
      const angleDeg = planet.startAngle + p * 360 + 7 * keplerVariation;
      const rad = (angleDeg * Math.PI) / 180;
      const x = center.x + ring.rx * Math.cos(rad);
      const y = center.y + ring.ry * Math.sin(rad);
      const alpha = (Math.sin(rad) + 1) / 2; // 0 at rear (top), 1 at front (bottom)
      const scale = (0.76 + 0.44 * alpha).toFixed(3);
      const brightness = (0.82 + 0.32 * alpha).toFixed(3);
      const zIndex = alpha > 0.48 ? 24 : 8;

      steps.push(`
        ${(p * 100).toFixed(1)}% {
          left: ${x.toFixed(2)}%;
          top: ${y.toFixed(2)}%;
          transform: translate3d(-50%, -50%, 0) scale(${scale});
          filter: brightness(${brightness});
          z-index: ${zIndex};
        }
      `);
    }
    return `
      @keyframes orbit_planet_${planet.id} {
        ${steps.join('\n')}
      }
    `;
  }).join('\n');
}

// Helper: Generates keyframes for the Asteroid Belt between Orbit 1 & Orbit 2
function generateAsteroidBeltKeyframe(center: { x: number; y: number }) {
  const rx = 24.5;
  const ry = 14.6;
  const count = 24;
  const steps: string[] = [];
  for (let i = 0; i <= count; i++) {
    const p = i / count;
    const rad = p * 2 * Math.PI;
    const x = center.x + rx * Math.cos(rad);
    const y = center.y + ry * Math.sin(rad);
    const alpha = (Math.sin(rad) + 1) / 2;
    const scale = (0.7 + 0.42 * alpha).toFixed(2);
    const zIndex = alpha > 0.48 ? 20 : 13;
    steps.push(`
      ${(p * 100).toFixed(1)}% {
        left: ${x.toFixed(2)}%;
        top: ${y.toFixed(2)}%;
        transform: translate3d(-50%, -50%, 0) scale(${scale});
        z-index: ${zIndex};
      }
    `);
  }
  return `
    @keyframes orbit_asteroid_belt {
      ${steps.join('\n')}
    }
  `;
}

const MAP_LINKS: [string, string][] = [
  ["letters", "hamza"],
  ["hamza", "word"],
  ["word", "spelling"],
  ["spelling", "styles"],
  ["hamza", "structures"],
  ["structures", "meanings"],
  ["meanings", "sentence"],
  ["sentence", "syntax"],
  ["syntax", "morphology"],
  ["morphology", "spelling"],
  ["word", "sentence"],
  ["letters", "structures"],
  ["styles", "morphology"]
];

// --- Multi-Layer Living Cosmos Entities & Shooting Stars ---
// Deep Layer Micro-Stars (Very distant, slow twinkle)
const DEEP_STARS = [
  { x: 5, y: 12, size: 1.0, delay: 0.2, duration: 6.5 },
  { x: 18, y: 8, size: 0.9, delay: 2.4, duration: 7.2 },
  { x: 31, y: 16, size: 1.1, delay: 1.1, duration: 5.8 },
  { x: 44, y: 4, size: 0.8, delay: 3.5, duration: 8.0 },
  { x: 58, y: 11, size: 1.2, delay: 0.7, duration: 6.1 },
  { x: 71, y: 5, size: 0.9, delay: 2.9, duration: 7.5 },
  { x: 86, y: 14, size: 1.0, delay: 1.8, duration: 6.8 },
  { x: 96, y: 9, size: 1.1, delay: 4.1, duration: 5.4 },
  { x: 11, y: 28, size: 0.8, delay: 3.2, duration: 7.9 },
  { x: 23, y: 38, size: 1.2, delay: 0.5, duration: 6.3 },
  { x: 39, y: 32, size: 0.9, delay: 2.1, duration: 8.2 },
  { x: 62, y: 27, size: 1.0, delay: 1.6, duration: 5.9 },
  { x: 80, y: 36, size: 1.1, delay: 3.8, duration: 6.6 },
  { x: 93, y: 41, size: 0.8, delay: 0.9, duration: 7.1 },
  { x: 7, y: 64, size: 1.0, delay: 2.7, duration: 6.4 },
  { x: 28, y: 71, size: 1.1, delay: 1.4, duration: 5.7 },
  { x: 41, y: 58, size: 0.8, delay: 4.3, duration: 8.4 },
  { x: 59, y: 66, size: 1.2, delay: 0.3, duration: 6.0 },
  { x: 75, y: 72, size: 0.9, delay: 3.1, duration: 7.3 },
  { x: 89, y: 61, size: 1.0, delay: 1.9, duration: 6.7 },
  { x: 14, y: 88, size: 1.1, delay: 2.2, duration: 5.5 },
  { x: 36, y: 92, size: 0.8, delay: 3.9, duration: 7.8 },
  { x: 64, y: 86, size: 1.2, delay: 0.8, duration: 6.2 },
  { x: 84, y: 91, size: 0.9, delay: 2.5, duration: 8.1 },
  { x: 97, y: 82, size: 1.0, delay: 1.2, duration: 5.6 }
];

// Mid Layer Stars (Brighter, delicate diamond shimmer)
const MID_STARS = [
  { x: 12, y: 7, size: 2.2, isDiamond: true, delay: 0.4, duration: 4.5 },
  { x: 27, y: 14, size: 1.6, isDiamond: false, delay: 2.1, duration: 5.2 },
  { x: 42, y: 5, size: 2.0, isDiamond: false, delay: 1.3, duration: 4.8 },
  { x: 62, y: 13, size: 2.5, isDiamond: true, delay: 3.5, duration: 4.2 },
  { x: 82, y: 7, size: 1.8, isDiamond: false, delay: 0.8, duration: 5.0 },
  { x: 95, y: 24, size: 2.4, isDiamond: true, delay: 2.7, duration: 4.6 },
  { x: 17, y: 34, size: 1.6, isDiamond: false, delay: 1.9, duration: 4.9 },
  { x: 37, y: 23, size: 2.2, isDiamond: true, delay: 4.1, duration: 4.4 },
  { x: 65, y: 37, size: 1.9, isDiamond: false, delay: 0.2, duration: 5.1 },
  { x: 85, y: 31, size: 2.3, isDiamond: true, delay: 3.0, duration: 4.3 },
  { x: 6, y: 56, size: 1.6, isDiamond: false, delay: 1.5, duration: 5.5 },
  { x: 32, y: 63, size: 1.8, isDiamond: false, delay: 2.8, duration: 4.7 },
  { x: 48, y: 47, size: 2.5, isDiamond: true, delay: 0.6, duration: 4.1 },
  { x: 68, y: 59, size: 2.0, isDiamond: false, delay: 3.8, duration: 5.3 },
  { x: 88, y: 65, size: 1.7, isDiamond: false, delay: 1.1, duration: 4.8 },
  { x: 15, y: 76, size: 2.2, isDiamond: true, delay: 2.4, duration: 4.6 },
  { x: 35, y: 83, size: 1.7, isDiamond: false, delay: 0.9, duration: 5.6 },
  { x: 60, y: 79, size: 1.5, isDiamond: false, delay: 3.2, duration: 4.7 },
  { x: 82, y: 86, size: 2.4, isDiamond: true, delay: 1.7, duration: 4.5 },
  { x: 45, y: 89, size: 1.6, isDiamond: false, delay: 2.5, duration: 5.4 }
];

// Faint Distant Space Dust Particles (Drifting continuously across the cosmos)
const COSMIC_DUST = [
  { x: 14, y: 22, size: 1.4, delay: 0, duration: 60 },
  { x: 38, y: 44, size: 1.2, delay: 12, duration: 72 },
  { x: 68, y: 16, size: 1.5, delay: 6, duration: 78 },
  { x: 84, y: 52, size: 1.3, delay: 22, duration: 68 },
  { x: 28, y: 76, size: 1.4, delay: 30, duration: 82 },
  { x: 54, y: 84, size: 1.2, delay: 16, duration: 86 },
  { x: 92, y: 34, size: 1.3, delay: 28, duration: 74 },
  { x: 8, y: 48, size: 1.5, delay: 8, duration: 66 }
];

// Distant Cosmic Bodies: Slow-tumbling microscopic asteroids in deep space
const DISTANT_ASTEROIDS = [
  { id: 1, x: 9, y: 26, size: 7, animationName: "asteroidTumble1", duration: 85 },
  { id: 2, x: 88, y: 68, size: 9, animationName: "asteroidTumble2", duration: 98 },
  { id: 3, x: 47, y: 42, size: 6, animationName: "asteroidTumble3", duration: 110 }
];

// Realistic Occasional Shooting Stars (Non-distracting, prime interval cycles, varied trajectories)
const SHOOTING_STARS_CONFIG = [
  { id: "meteor-a", x: 84, y: 8, angle: -34, length: 110, anim: "shootingStarA", duration: 15, delay: 2.0 },
  { id: "meteor-b", x: 22, y: 12, angle: -48, length: 160, anim: "shootingStarB", duration: 23, delay: 7.5 },
  { id: "meteor-c", x: 48, y: 5, angle: -24, length: 85, anim: "shootingStarC", duration: 19, delay: 13.0 },
  { id: "meteor-d", x: 90, y: 36, angle: -38, length: 125, anim: "shootingStarD", duration: 27, delay: 18.5 }
];

// Rocket Floating Peacefully at Bottom-Center of Viewport (Lower edge)
const LAUNCH_PAD = { x: 50, y: 89 };

// Foreground Near-Field 3D Floating Cosmic Motes (Close to camera, produces authentic stereoscopic depth)
const FOREGROUND_COSMIC_MOTES = [
  { x: 14, y: 20, size: 9, blur: 2.2, duration: 18, delay: 0 },
  { x: 84, y: 26, size: 12, blur: 2.8, duration: 22, delay: 3 },
  { x: 22, y: 74, size: 10, blur: 2.5, duration: 20, delay: 7 },
  { x: 76, y: 80, size: 8, blur: 2.0, duration: 16, delay: 2 },
  { x: 44, y: 52, size: 13, blur: 3.0, duration: 25, delay: 5 },
  { x: 88, y: 64, size: 7, blur: 1.8, duration: 19, delay: 9 }
];

// --- Physics Entities for Arcade Flight ---
interface Laser { x: number; y: number; vy: number; }
interface Particle { x: number; y: number; vx: number; vy: number; life: number; maxLife: number; color: string; size: number; }
interface Asteroid { 
  id: number; 
  x: number; 
  y: number; 
  radius: number; 
  vy: number; 
  vx?: number; 
  rot: number; 
  vRot: number; 
  isStar?: boolean; 
  nearMissScored?: boolean;
}

interface PowerUpItem {
  id: number;
  x: number;
  y: number;
  vy: number;
  type: "shield" | "magnet" | "slowmo" | "bomb";
  pulse: number;
}

interface FloatingText {
  id: number;
  x: number;
  y: number;
  text: string;
  color: string;
  size: number;
  alpha: number;
  vy: number;
}
interface WordCrystal {
  id: number;
  text: string;
  isCorrect: boolean;
  explanation: string;
  x: number;
  y: number;
  vy: number;
  vx?: number;
  width: number;
  height: number;
  radius: number;
  rot?: number;
  pulsePhase?: number;
}

interface MissionChallenge {
  title: string;
  prompt: string;
  subPrompt: string;
  correctWords: string[];
  wrongWords: string[];
  explanationMap: Record<string, string>;
}

export interface ArabicSpaceJourneyProps {
  onBack?: () => void;
  onWin?: (xp: number) => void;
}

export const ArabicSpaceJourney: React.FC<ArabicSpaceJourneyProps> = ({ onBack, onWin }) => {
  const [screen, setScreen] = useState<"home" | "planet" | "planet_entry" | "flight" | "victory" | "gameover">("home");
  const [save, setSave] = useState<Save>(loadSave);
  const [currentPlanetId, setCurrentPlanetId] = useState<string | null>(null);
  const [selectedStageId, setSelectedStageId] = useState<string>("sentence-types");
  const [isMuted, setIsMuted] = useState(false);

  // Planet Descent & Hologram Comms State
  const [targetPlanetId, setTargetPlanetId] = useState<string>("letters");
  const [isDescentActive, setIsDescentActive] = useState<boolean>(false);
  const [descentPhase, setDescentPhase] = useState<
    "rocket_entry" | "rope_lowering" | "rope_retracting" | "rocket_departing" | "astronaut_settled" | "transmission_active" | "transmission_fading"
  >("rocket_entry");
  const descentTimers = useRef<NodeJS.Timeout[]>([]);
  const descentRafRef = useRef<number | null>(null);
  const [descentAnim, setDescentAnim] = useState({
    ropeProgress: 0,
    astronautTop: 24,
    astronautOpacity: 0,
    rocketY: 0,
    rocketScale: 1,
    rocketOpacity: 1
  });
  const [typedDistressText, setTypedDistressText] = useState<string>("");
  const [isTypingComplete, setIsTypingComplete] = useState<boolean>(false);
  const typewriterIntervalRef = useRef<NodeJS.Timeout | null>(null);

  // Asset Preloader & Cinematic Readiness System
  const [isAssetsLoaded, setIsAssetsLoaded] = useState(false);
  const [loadProgress, setLoadProgress] = useState(0);

  useEffect(() => {
    const assets = [
      solarSystemCosmosBg,
      turquoiseCosmosBg,
      vibrantCinematicSpaceNebula,
      realisticSunStar,
      realisticOceanicPlanet,
      realisticRedMars,
      realisticSaturnRings,
      realisticGoldenGasGiant,
      realisticPurplePlanet,
      realisticCyanPlanet,
      realisticEmeraldPlanet,
      realisticOrangePlanet,
      realisticMoonSurface,
      goldenRingPlanet,
      retroAstronautRocket,
      astronautOnRope,
      astronautMissionHero
    ];

    let count = 0;
    const total = assets.length;

    const preload = async () => {
      try {
        await Promise.all(
          assets.map((src) => {
            return new Promise<void>((resolve) => {
              const img = new Image();
              let finished = false;
              const onFinish = () => {
                if (finished) return;
                finished = true;
                count++;
                setLoadProgress(Math.round((count / total) * 100));
                resolve();
              };
              img.onload = onFinish;
              img.onerror = onFinish;
              img.src = src;
              if (typeof img.decode === "function") {
                img.decode().then(onFinish).catch(onFinish);
              }
            });
          })
        );
      } catch {
        // Safe fallback
      } finally {
        setTimeout(() => {
          setIsAssetsLoaded(true);
        }, 220);
      }
    };

    preload();
  }, []);

  // Cosmic Ambient Soundscape Management (Deep Space Hum / Vacuum Resonance)
  useEffect(() => {
    if (screen === "home" && !isMuted) {
      const handleUserGesture = () => {
        audio.init();
        audio.startAmbient();
        window.removeEventListener("pointerdown", handleUserGesture);
        window.removeEventListener("keydown", handleUserGesture);
      };

      if (audio.ctx && audio.ctx.state === "running") {
        audio.startAmbient();
      } else {
        window.addEventListener("pointerdown", handleUserGesture, { once: true });
        window.addEventListener("keydown", handleUserGesture, { once: true });
      }

      return () => {
        window.removeEventListener("pointerdown", handleUserGesture);
        window.removeEventListener("keydown", handleUserGesture);
      };
    } else {
      audio.stopAmbient(0.8);
    }
  }, [screen, isMuted]);

  // Clean up ambient audio nodes on unmount
  useEffect(() => {
    return () => {
      audio.stopAmbient(0.3);
    };
  }, []);

  // Dynamic Shooting Stars with Real-Time Synchronized Audio Cue
  const [activeMeteors, setActiveMeteors] = useState<{
    id: number;
    startX: number;
    startY: number;
    anim: "meteorStreakFlyA" | "meteorStreakFlyB" | "meteorStreakFlyC";
    length: number;
    duration: number;
  }[]>([]);

  useEffect(() => {
    if (screen !== "home") {
      setActiveMeteors([]);
      return;
    }

    let timeoutId: NodeJS.Timeout;
    let isCancelled = false;

    const spawnMeteor = () => {
      if (isCancelled) return;
      const anims: ("meteorStreakFlyA" | "meteorStreakFlyB" | "meteorStreakFlyC")[] = [
        "meteorStreakFlyA",
        "meteorStreakFlyB",
        "meteorStreakFlyC"
      ];
      const selectedAnim = anims[Math.floor(Math.random() * anims.length)];

      const startX = 66 + Math.random() * 25; // 66% to 91% (upper right sky)
      const startY = 4 + Math.random() * 22;  // 4% to 26%
      const length = 110 + Math.random() * 55;
      const duration = 1.1 + Math.random() * 0.35; // ~1.1s to 1.45s
      const id = Date.now() + Math.random();

      // Trigger delicate, subtle ethereal meteor audio streak at the exact appearance moment!
      audio.meteorStreak();

      setActiveMeteors((prev) => [...prev, { id, startX, startY, anim: selectedAnim, length, duration }]);

      setTimeout(() => {
        if (!isCancelled) {
          setActiveMeteors((prev) => prev.filter((m) => m.id !== id));
        }
      }, duration * 1000 + 100);

      // Schedule next meteor (7 to 13 seconds interval)
      const nextDelay = 7000 + Math.random() * 6000;
      timeoutId = setTimeout(spawnMeteor, nextDelay);
    };

    // First meteor triggers after 3.2 seconds
    timeoutId = setTimeout(spawnMeteor, 3200);

    return () => {
      isCancelled = true;
      clearTimeout(timeoutId);
      setActiveMeteors([]);
    };
  }, [screen]);

  // Animated Rocket State (Smooth Curved Arc Physics)
  const [rocketPos, setRocketPos] = useState({ x: LAUNCH_PAD.x, y: LAUNCH_PAD.y });
  const [rocketAngle, setRocketAngle] = useState(0);
  const [launchPhase, setLaunchPhase] = useState<"idle" | "igniting" | "flying">("idle");
  const [isRumbling, setIsRumbling] = useState(false);
  const isRocketFlying = launchPhase === "flying";
  const isIgniting = launchPhase === "igniting";
  const [hoveredPlanetId, setHoveredPlanetId] = useState<string | null>(null);

  // Flight Mode Stats
  const [currentChallenge, setCurrentChallenge] = useState<MissionChallenge | null>(null);
  const [distanceRemaining, setDistanceRemaining] = useState(800);
  const [crystalsCaught, setCrystalsCaught] = useState(0);
  const TARGET_CRYSTALS = 8;
  const [shields, setShields] = useState(3);
  const [score, setScore] = useState(0);
  const [combo, setCombo] = useState(0);
  const [isSuperComet, setIsSuperComet] = useState(false);

  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const retroRocketImgRef = useRef<HTMLImageElement | null>(null);
  const astronautImgRef = useRef<HTMLImageElement | null>(null);
  const astronautHeroImgRef = useRef<HTMLImageElement | null>(null);

  useEffect(() => {
    const img = new Image();
    img.src = retroAstronautRocket;
    img.onload = () => {
      retroRocketImgRef.current = img;
    };

    const astro = new Image();
    astro.src = astronautOnRope;
    astro.onload = () => {
      astronautImgRef.current = astro;
    };

    const hero = new Image();
    hero.src = astronautMissionHero;
    hero.onload = () => {
      astronautHeroImgRef.current = hero;
    };
  }, []);

  // Flight Engine Mutable Ref (Full 2D movement across entire planet canvas)
  const flightState = useRef({
    shipX: 0,
    shipY: 0,
    shipVx: 0,
    shipVy: 0,
    targetX: 0,
    targetY: 0,
    tilt: 0,
    lasers: [] as Laser[],
    asteroids: [] as Asteroid[],
    crystals: [] as WordCrystal[],
    powerups: [] as PowerUpItem[],
    floatingTexts: [] as FloatingText[],
    particles: [] as Particle[],
    shootingStars: [] as { x: number; y: number; vx: number; vy: number; length: number; alpha: number; color: string }[],
    stars: [] as { x: number; y: number; z: number; size: number; alpha: number }[],
    keys: { left: false, right: false, up: false, down: false },
    screenShake: 0,
    lastSpawnTime: 0,
    lastPowerupSpawnTime: 0,
    lastMeteorsSpawnTime: 0,
    nextEntityId: 1,
    invulnerableTimer: 0,
    activeMagnetTimer: 0,
    activeSlowMoTimer: 0
  });

  const selectedNode = (currentPlanetId ? MAP_NODES.find((n) => n.id === currentPlanetId) : null) || MAP_NODES[0];
  const activeStage = STAGES_LIST.find((s) => s.id === selectedStageId) || STAGES_LIST[0];

  // Dynamic real-time target coordinates tracking for rocket banking and trajectory photon beam
  const [targetCoords, setTargetCoords] = useState<{ x: number; y: number }>({ x: 50, y: 50 });

  useEffect(() => {
    const targetId = hoveredPlanetId || currentPlanetId;
    if (!targetId) return;

    const updateTargetCoords = () => {
      const el = document.getElementById(`planet-node-${targetId}`);
      const container = document.getElementById("solar-system-container");
      if (el && container) {
        const cRect = container.getBoundingClientRect();
        const tRect = el.getBoundingClientRect();
        if (cRect.width > 0 && cRect.height > 0) {
          setTargetCoords({
            x: ((tRect.left + tRect.width / 2 - cRect.left) / cRect.width) * 100,
            y: ((tRect.top + tRect.height / 2 - cRect.top) / cRect.height) * 100
          });
        }
      }
    };
    updateTargetCoords();
    const interval = setInterval(updateTargetCoords, 50);
    return () => clearInterval(interval);
  }, [hoveredPlanetId, currentPlanetId]);

  // Dynamic Real-Time Planet Proximity Scaling (Continuous smooth scaling based on rocket distance)
  const [planetProximityScales, setPlanetProximityScales] = useState<Record<string, number>>({});

  useEffect(() => {
    if (screen !== "home") return;

    const updatePlanetScales = () => {
      const container = document.getElementById("solar-system-container");
      if (!container) return;
      const cRect = container.getBoundingClientRect();
      if (cRect.width === 0 || cRect.height === 0) return;

      const scales: Record<string, number> = {};

      MAP_NODES.forEach((node) => {
        const el = document.getElementById(`planet-node-${node.id}`);
        if (!el) {
          scales[node.id] = 1.0;
          return;
        }
        const pRect = el.getBoundingClientRect();
        // Exact real-time percentage coordinates of planet center in container
        const px = ((pRect.left + pRect.width / 2 - cRect.left) / cRect.width) * 100;
        const py = ((pRect.top + pRect.height / 2 - cRect.top) / cRect.height) * 100;

        // Euclidean distance in viewport percentage between rocket and planet center
        const dx = px - rocketPos.x;
        const dy = py - rocketPos.y;
        const dist = Math.sqrt(dx * dx + dy * dy);

        // Natural astronomical proximity scale:
        // Far away (dist >= 68%): normal base scale (1.0)
        // Close approach (dist approaches 0%): smoothly expands up to 1.28
        // Smoothstep curve ensures gradual, silky transitions without abrupt jumps
        const maxDist = 68;
        const minDist = 3.5;
        const clampedDist = Math.max(minDist, Math.min(maxDist, dist));
        const t = (maxDist - clampedDist) / (maxDist - minDist); // 0 at far distance, 1 at closest
        const smoothStep = t * t * (3 - 2 * t);
        const dynamicScale = 1.0 + 0.28 * smoothStep;

        scales[node.id] = Number(dynamicScale.toFixed(3));
      });

      setPlanetProximityScales(scales);
    };

    updatePlanetScales();
    const interval = setInterval(updatePlanetScales, 40); // 25 fps responsive real-time distance tracking
    return () => clearInterval(interval);
  }, [screen, rocketPos.x, rocketPos.y]);

  // Living Cosmos Pointer-Based Parallax Shift (Subtle 3D sensation behind interface)
  const [parallaxOffset, setParallaxOffset] = useState({ x: 0, y: 0 });
  const handleHomePointerMove = useCallback((e: React.PointerEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    if (!rect.width || !rect.height) return;
    const normX = (e.clientX - rect.left) / rect.width - 0.5;
    const normY = (e.clientY - rect.top) / rect.height - 0.5;
    setParallaxOffset({ x: normX, y: normY });
  }, []);

  // Dynamic rocket idle attitude: banks gracefully toward the active target planet's real-time position ONLY when hovered or clicked
  const activeTargetNode = useMemo(() => {
    const targetId = hoveredPlanetId || currentPlanetId;
    if (!targetId) return null;
    return MAP_NODES.find((n) => n.id === targetId) || null;
  }, [hoveredPlanetId, currentPlanetId]);

  const currentPlanetAtmosphere = useMemo(() => {
    const pId = targetPlanetId || currentPlanetId || (activeStage && activeStage.planetId) || "letters";
    return PLANET_ATMOSPHERES[pId] || PLANET_ATMOSPHERES["letters"];
  }, [targetPlanetId, currentPlanetId, activeStage]);

  const idleRocketAngle = useMemo(() => {
    if (isRocketFlying || isIgniting || !activeTargetNode) return 0;
    const dx = targetCoords.x - LAUNCH_PAD.x;
    const dy = targetCoords.y - LAUNCH_PAD.y;
    const rawDeg = (Math.atan2(dy, dx) * 180) / Math.PI + 90;
    // Subtly bank toward target (max ±18 degrees for realistic aerospace stance)
    return Math.max(-18, Math.min(18, rawDeg * 0.45));
  }, [targetCoords, isRocketFlying, isIgniting, activeTargetNode]);

  // ONE CLICK = SELECT + LAUNCH: Instantaneous focus, plasma ignition surge, screen rumble & curved trajectory
  const handleLaunchToPlanetWithArcPhysics = (planetId?: string | null) => {
    if (launchPhase !== "idle") return;
    const targetPlanetId = planetId || currentPlanetId || hoveredPlanetId || MAP_NODES[0].id;
    audio.init();
    audio.select();
    audio.ignitionAndThrust();
    setCurrentPlanetId(targetPlanetId);
    setLaunchPhase("igniting");
    setIsRumbling(true);
    setTimeout(() => setIsRumbling(false), 450);

    const targetNode = MAP_NODES.find((n) => n.id === targetPlanetId);
    if (!targetNode) {
      setLaunchPhase("idle");
      return;
    }

    const startX = LAUNCH_PAD.x;
    const startY = LAUNCH_PAD.y;

    // Read real-time coordinates of target planet element from DOM
    const targetEl = document.getElementById(`planet-node-${targetPlanetId}`);
    const containerEl = document.getElementById("solar-system-container");
    let endX = targetCoords.x;
    let endY = targetCoords.y;
    if (targetEl && containerEl) {
      const cRect = containerEl.getBoundingClientRect();
      const tRect = targetEl.getBoundingClientRect();
      if (cRect.width > 0 && cRect.height > 0) {
        endX = ((tRect.left + tRect.width / 2 - cRect.left) / cRect.width) * 100;
        endY = ((tRect.top + tRect.height / 2 - cRect.top) / cRect.height) * 100;
      }
    }

    // Curved Arc Control Point (arcs gracefully through deep 3D space)
    const midX = (startX + endX) / 2 + (startX > endX ? 14 : -14);
    const midY = Math.min(startY, endY) - 15;

    // Stage 1: Quick, punchy ignition and plasma pressurization (420ms)
    setTimeout(() => {
      setLaunchPhase("flying");

      const startTime = performance.now();
      const duration = 1150; // Cinematic rapid traversal across the solar system

      const animateArc = (now: number) => {
        const elapsed = now - startTime;
        const progress = Math.min(elapsed / duration, 1);
        
        // Cinematic non-linear acceleration easing curve
        const t = progress < 0.5 
          ? 2 * progress * progress 
          : 1 - Math.pow(-2 * progress + 2, 2) / 2;

        // Quadratic Bezier Formula
        const currX = (1 - t) * (1 - t) * startX + 2 * (1 - t) * t * midX + t * t * endX;
        const currY = (1 - t) * (1 - t) * startY + 2 * (1 - t) * t * midY + t * t * endY;

        // Tangent derivative for realistic flight banking angle
        const dx = 2 * (1 - t) * (midX - startX) + 2 * t * (endX - midX);
        const dy = 2 * (1 - t) * (midY - startY) + 2 * t * (endY - midY);
        const angleDeg = (Math.atan2(dy, dx) * 180) / Math.PI + 90;

        setRocketPos({ x: currX, y: currY });
        setRocketAngle(angleDeg);

        if (progress < 1) {
          requestAnimationFrame(animateArc);
        } else {
          // Reached planet destination! Transition directly into the selected planet's page with atmospheric descent
          setLaunchPhase("idle");
          setRocketAngle(0);
          setRocketPos({ x: LAUNCH_PAD.x, y: LAUNCH_PAD.y });
          const targetId = targetPlanetId;
          const stages = STAGES_LIST.filter((s) => s.planetId === targetId);
          const stageToLaunch = stages[0] || STAGES_LIST[0];
          launchFlightGame(stageToLaunch, true);
        }
      };

      requestAnimationFrame(animateArc);
    }, 420);
  };

  // Direct instant launch into planet page with descent scenario
  const launchDirectPlanetDescent = (planetId: string) => {
    audio.init();
    audio.select();
    audio.ignitionAndThrust();
    setCurrentPlanetId(planetId);
    setTargetPlanetId(planetId);
    const stages = STAGES_LIST.filter((s) => s.planetId === planetId);
    const stageToLaunch = stages[0] || STAGES_LIST[0];
    launchFlightGame(stageToLaunch, true);
  };

  // Planetary Atmospheric Descent & Temporary Space Comms Briefing Sequences (Directly inside Planet's Page)
  const startPlanetDescent = (planetId: string) => {
    setTargetPlanetId(planetId);
    setCurrentPlanetId(planetId);
    setIsDescentActive(true);
    setDescentPhase("rocket_entry");
    setTypedDistressText("");
    setIsTypingComplete(false);

    setDescentAnim({
      ropeProgress: 0,
      astronautTop: 26,
      astronautOpacity: 0,
      rocketY: -260,
      rocketScale: 0.85,
      rocketOpacity: 0
    });

    // Clear any existing timers and RAF
    if (descentRafRef.current) cancelAnimationFrame(descentRafRef.current);
    descentTimers.current.forEach(clearTimeout);
    descentTimers.current = [];
    if (typewriterIntervalRef.current) clearInterval(typewriterIntervalRef.current);

    const startTime = performance.now();
    let ropeAudioPlayed = false;
    let ropeRetractAudioPlayed = false;
    let departAudioPlayed = false;

    const animateDescent = (now: number) => {
      const elapsed = now - startTime;

      if (elapsed < 1200) {
        // Phase 1: 0 - 1200ms: Rocket arrives smoothly from top into orbit hover
        setDescentPhase("rocket_entry");
        const p = Math.min(1, elapsed / 1200);
        const ease = 1 - Math.pow(1 - p, 3); // cubic ease-out
        setDescentAnim({
          ropeProgress: 0,
          astronautTop: 26,
          astronautOpacity: 0,
          rocketY: -260 * (1 - ease),
          rocketScale: 0.85 + 0.15 * ease,
          rocketOpacity: ease
        });
      } else if (elapsed < 3900) {
        // Phase 2: 1200ms - 3900ms: Single rope extends from rocket nozzle to ground, astronaut descends along the rope
        if (!ropeAudioPlayed) {
          ropeAudioPlayed = true;
          audio.ropeDeploy();
        }
        setDescentPhase("rope_lowering");
        const p = Math.min(1, (elapsed - 1200) / 2700);
        const ease = p < 0.5 ? 2 * p * p : 1 - Math.pow(-2 * p + 2, 2) / 2; // smoothstep
        setDescentAnim({
          ropeProgress: ease,
          astronautTop: 26 + ease * 42, // descends from 26% (rocket nozzle) down to 68% (ground level)
          astronautOpacity: Math.min(1, p * 3.5), // fades in rapidly as he emerges from the rocket
          rocketY: 0,
          rocketScale: 1,
          rocketOpacity: 1
        });
      } else if (elapsed < 5100) {
        // Phase 3: 3900ms - 5100ms: Astronaut touches down on the ground, rope reels back up into rocket nozzle
        if (!ropeRetractAudioPlayed) {
          ropeRetractAudioPlayed = true;
          audio.ropeDeploy();
        }
        setDescentPhase("rope_retracting");
        const p = Math.min(1, (elapsed - 3900) / 1200);
        const ease = p * p;
        setDescentAnim({
          ropeProgress: Math.max(0, 1 - ease), // shrinks from 1 down to 0 into rocket nozzle
          astronautTop: 68, // firmly anchored on the ground
          astronautOpacity: 1,
          rocketY: 0,
          rocketScale: 1,
          rocketOpacity: 1
        });
      } else if (elapsed < 6500) {
        // Phase 4: 5100ms - 6500ms: Rocket departs back up into deep space rapidly in the horizon and vanishes!
        if (!departAudioPlayed) {
          departAudioPlayed = true;
          audio.ignitionAndThrust();
          setIsRumbling(true);
          setTimeout(() => setIsRumbling(false), 450);
        }
        setDescentPhase("rocket_departing");
        const p = Math.min(1, (elapsed - 5100) / 1400);
        const ease = p * p * p; // cubic acceleration
        setDescentAnim({
          ropeProgress: 0,
          astronautTop: 68,
          astronautOpacity: 1,
          rocketY: -1300 * ease,
          rocketScale: Math.max(0.04, 1 - 0.96 * ease),
          rocketOpacity: Math.max(0, 1 - ease * 1.4)
        });
      } else if (elapsed < 7300) {
        // Phase 5: 6500ms - 7300ms: Rocket is 100% gone! Astronaut settles stably alone at bottom-center of the planet.
        setDescentPhase("astronaut_settled");
        setDescentAnim({
          ropeProgress: 0,
          astronautTop: 68,
          astronautOpacity: 1,
          rocketY: -1500,
          rocketScale: 0,
          rocketOpacity: 0
        });
      } else {
        // Phase 6+: Hologram takes over
        setDescentAnim({
          ropeProgress: 0,
          astronautTop: 68,
          astronautOpacity: 1,
          rocketY: -1500,
          rocketScale: 0,
          rocketOpacity: 0
        });
        return;
      }

      descentRafRef.current = requestAnimationFrame(animateDescent);
    };

    descentRafRef.current = requestAnimationFrame(animateDescent);

    // Phase 6: 7300ms: AFTER rocket is gone, holographic message opens from bottom to top with brisk digital typing
    const t5 = setTimeout(() => {
      setDescentPhase("transmission_active");

      // Phase 7: After concise typing and crisp reading duration (3.5s total), message closes smoothly
      const tFade = setTimeout(() => {
        setDescentPhase("transmission_fading");

        // Phase 8: After holographic closing effect finishes (500ms), astronaut immediately begins active mission
        const tStartMission = setTimeout(() => {
          skipDescentToMission();
        }, 500);
        descentTimers.current.push(tStartMission);
      }, 3500);
      descentTimers.current.push(tFade);
    }, 7300);

    descentTimers.current.push(t5);
  };

  const skipDescentToMission = () => {
    if (descentRafRef.current) cancelAnimationFrame(descentRafRef.current);
    descentTimers.current.forEach(clearTimeout);
    descentTimers.current = [];
    if (typewriterIntervalRef.current) clearInterval(typewriterIntervalRef.current);
    isDescentActiveRef.current = false;
    setIsDescentActive(false);
  };

  // Holographic Message Fast Cyber Reveal Effect (Types letter-by-letter with brisk, crisp cadence)
  useEffect(() => {
    if (descentPhase === "transmission_active") {
      audio.hologramOpen();
      const atmosphere = PLANET_ATMOSPHERES[targetPlanetId || currentPlanetId || "letters"] || PLANET_ATMOSPHERES.letters;
      const msg = atmosphere.distressMessage;
      setTypedDistressText("");
      setIsTypingComplete(false);

      // 120ms delay allowing the holographic bottom-to-top opening animation to unfold
      const startDelay = setTimeout(() => {
        let charIdx = 0;
        if (typewriterIntervalRef.current) clearInterval(typewriterIntervalRef.current);

        typewriterIntervalRef.current = setInterval(() => {
          charIdx++;
          setTypedDistressText(msg.slice(0, charIdx));
          if (charIdx % 3 === 0) {
            audio.typewriterChirp();
          }

          if (charIdx >= msg.length) {
            if (typewriterIntervalRef.current) clearInterval(typewriterIntervalRef.current);
            setIsTypingComplete(true);
          }
        }, 15);
      }, 120);

      return () => {
        clearTimeout(startDelay);
        if (typewriterIntervalRef.current) clearInterval(typewriterIntervalRef.current);
      };
    } else if (descentPhase === "transmission_fading") {
      audio.hologramClose();
    }
  }, [descentPhase, targetPlanetId, currentPlanetId]);

  const handleStartMissionFromHologram = () => {
    if (descentPhase === "transmission_fading") {
      skipDescentToMission();
      return;
    }
    descentTimers.current.forEach(clearTimeout);
    descentTimers.current = [];
    if (typewriterIntervalRef.current) clearInterval(typewriterIntervalRef.current);
    setDescentPhase("transmission_fading");
    const tEnd = setTimeout(() => {
      skipDescentToMission();
    }, 550);
    descentTimers.current.push(tEnd);
  };

  // Build Mission Challenges
  const buildMissionChallenge = (stage: Stage): MissionChallenge => {
    // Check if dedicated challenge is defined in CONTENT for this planet
    const planetChallenge = CONTENT[stage.planetId]?.[0];
    if (planetChallenge) {
      return {
        title: planetChallenge.title,
        prompt: planetChallenge.prompt,
        subPrompt: planetChallenge.subPrompt,
        correctWords: planetChallenge.correctWords,
        wrongWords: planetChallenge.wrongWords,
        explanationMap: planetChallenge.explanationMap || {
          "ثُمَّ": "حرف عطف وليس حرف جر!",
          "إِنَّ": "حرف ناسخ وليس حرف جر!",
          "يَلْعَبُ": "فعل مضارع وليس اسماً!",
          "الْحُزْنُ": "يدل على الحزن وليس السرور!"
        }
      };
    }

    if (stage.id.includes("letters") || stage.planetId === "letters") {
      const jarLetters = ["مِنْ", "إِلَى", "عَنْ", "عَلَى", "فِي", "الْبَاء", "اللَّام", "الْكَاف"];
      const nonJar = ["إِنَّ", "أَنَّ", "لَكِنَّ", "لَعَلَّ", "هَلْ", "مَاذَا", "كَيْفَ", "ثُمَّ", "أَوْ", "لَمْ"];
      return {
        title: "كوكب الحروف",
        prompt: "اصطد: [حروف الجر الأصلية] العالقة فقط!",
        subPrompt: "مِنْ • إِلَى • عَنْ • عَلَى • فِي • الْبَاء • اللَّام • الْكَاف (وتفادَ الحروف الناسخة وأدوات الاستفهام)",
        correctWords: jarLetters,
        wrongWords: nonJar,
        explanationMap: {
          "إِنَّ": "حرف ناسخ وليس حرف جر!",
          "أَنَّ": "حرف ناسخ وليس حرف جر!",
          "هَلْ": "أداة استفهام وليست حرف جر!",
          "ثُمَّ": "حرف عطف وليس حرف جر!"
        }
      };
    }

    if (stage.id.includes("noun") || stage.planetId === "word") {
      const nouns = ["طالب", "طبيب", "ممرضة", "معلم", "حصان", "أرنب", "أسد", "شجرة", "قلم", "كتاب", "مكة"];
      const nonNouns = ["يَكْتُبُ", "يَجْرِي", "سَافَرَ", "قَرَأَ", "فِي", "عَلَى", "مِنْ", "إِلَى"];
      return {
        title: "مملكة الأسماء",
        prompt: "اصطد: أي كلمة تدل على [اسم]",
        subPrompt: "إنسان • حيوان • نبات • جماد • بلد (وتفادَ الأفعال والحروف)",
        correctWords: nouns,
        wrongWords: nonNouns,
        explanationMap: {
          "يَكْتُبُ": "فعل مضارع وليس اسماً!",
          "يَجْرِي": "فعل مضارع وليس اسماً!",
          "سَافَرَ": "فعل ماضٍ وليس اسماً!",
          "فِي": "حرف جر وليس اسماً!"
        }
      };
    }

    if (stage.id.includes("verb") || stage.planetId === "styles") {
      const verbs = ["كَتَبَ", "سَافَرَ", "قَرَأَ", "انْطَلَقَ", "جَلَسَ", "يَكْتُبُ", "يَسْمَعُ", "يَرْسُمُ"];
      const nonVerbs = ["طَالِب", "قَلَم", "كِتَاب", "شَجَرَة", "فِي", "عَلَى", "إِلَى"];
      return {
        title: "مدار الأفعال",
        prompt: "اصطد: أي كلمة تدل على [فعل]",
        subPrompt: "حدث مقترن بزمن (ماضٍ • مضارع • أمر) وتفادَ الأسماء",
        correctWords: verbs,
        wrongWords: nonVerbs,
        explanationMap: { "طَالِب": "اسم إنسان وليس فعلاً!", "قَلَم": "اسم جماد وليس فعلاً!" }
      };
    }

    const qList = stage.questions;
    const correctAnswers = Array.from(new Set(qList.map((q) => q.a)));
    const wrongAnswers = Array.from(new Set(qList.flatMap((q) => q.opts || []).filter((w) => !correctAnswers.includes(w))));
    return {
      title: stage.title,
      prompt: `اصطد: الإجابات الصحيحة لـ ${stage.title}`,
      subPrompt: "ركز على الإجابات الدقيقة وتفادَ المشتتات والصخور الكونية",
      correctWords: correctAnswers.length >= 4 ? correctAnswers : ["صحيح", "مطابق", ...correctAnswers],
      wrongWords: wrongAnswers.length >= 4 ? wrongAnswers : ["خاطئ", "غير مطابق", "مشتت"],
      explanationMap: {}
    };
  };

  const launchFlightGame = (stg: Stage, withDescent = true) => {
    audio.init();
    audio.warpGate();
    setSelectedStageId(stg.id);
    setCurrentPlanetId(stg.planetId);
    setTargetPlanetId(stg.planetId);

    const challenge = buildMissionChallenge(stg);
    setCurrentChallenge(challenge);

    setDistanceRemaining(800);
    setCrystalsCaught(0);
    setShields(3);
    setScore(0);
    setCombo(0);
    setIsSuperComet(false);

    const fs = flightState.current;
    fs.shipX = 0;
    fs.shipY = 0;
    fs.targetX = 0;
    fs.targetY = 0;
    fs.shipVx = 0;
    fs.shipVy = 0;
    fs.lasers = [];
    fs.asteroids = [];
    fs.crystals = [];
    fs.powerups = [];
    fs.floatingTexts = [];
    fs.particles = [];
    fs.invulnerableTimer = 0;
    fs.activeMagnetTimer = 0;
    fs.activeSlowMoTimer = 0;
    fs.lastPowerupSpawnTime = 0;

    setScreen("flight");

    if (withDescent) {
      startPlanetDescent(stg.planetId);
    } else {
      setIsDescentActive(false);
    }
  };

  const fireLaser = useCallback(() => {
    const fs = flightState.current;
    if (screen !== "flight") return;
    audio.laser();
    fs.lasers.push({ x: fs.shipX - 22, y: fs.shipY - 55, vy: -20 });
    fs.lasers.push({ x: fs.shipX + 22, y: fs.shipY - 55, vy: -20 });
  }, [screen]);

  const createSparks = (x: number, y: number, color: string, count = 16) => {
    const fs = flightState.current;
    for (let i = 0; i < count; i++) {
      const angle = Math.random() * Math.PI * 2;
      const speed = Math.random() * 4 + 2;
      fs.particles.push({
        x,
        y,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed,
        life: 1,
        maxLife: Math.random() * 20 + 15,
        color,
        size: Math.random() * 3 + 1.5
      });
    }
  };

  // Keyboard Controls (2D Arrow Keys & WASD)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      const fs = flightState.current;
      if (e.code === "ArrowLeft" || e.key === "a" || e.key === "A") fs.keys.left = true;
      if (e.code === "ArrowRight" || e.key === "d" || e.key === "D") fs.keys.right = true;
      if (e.code === "ArrowUp" || e.key === "w" || e.key === "W") fs.keys.up = true;
      if (e.code === "ArrowDown" || e.key === "s" || e.key === "S") fs.keys.down = true;
      if (e.code === "Space") {
        e.preventDefault();
        fireLaser();
      }
    };
    const handleKeyUp = (e: KeyboardEvent) => {
      const fs = flightState.current;
      if (e.code === "ArrowLeft" || e.key === "a" || e.key === "A") fs.keys.left = false;
      if (e.code === "ArrowRight" || e.key === "d" || e.key === "D") fs.keys.right = false;
      if (e.code === "ArrowUp" || e.key === "w" || e.key === "W") fs.keys.up = false;
      if (e.code === "ArrowDown" || e.key === "s" || e.key === "S") fs.keys.down = false;
    };
    window.addEventListener("keydown", handleKeyDown);
    window.addEventListener("keyup", handleKeyUp);
    return () => {
      window.removeEventListener("keydown", handleKeyDown);
      window.removeEventListener("keyup", handleKeyUp);
    };
  }, [fireLaser]);

  // Sync mutable refs so the 60FPS physics loop runs uninhibited without re-mounting or resetting player coordinates
  const distanceRemainingRef = useRef(distanceRemaining);
  const shieldsRef = useRef(shields);
  const comboRef = useRef(combo);
  const isSuperCometRef = useRef(isSuperComet);
  const isDescentActiveRef = useRef(isDescentActive);
  const currentChallengeRef = useRef(currentChallenge);
  const currentPlanetAtmosphereRef = useRef(currentPlanetAtmosphere);

  useEffect(() => {
    distanceRemainingRef.current = distanceRemaining;
    shieldsRef.current = shields;
    comboRef.current = combo;
    isSuperCometRef.current = isSuperComet;
    isDescentActiveRef.current = isDescentActive;
    currentChallengeRef.current = currentChallenge;
    currentPlanetAtmosphereRef.current = currentPlanetAtmosphere;
  }, [distanceRemaining, shields, combo, isSuperComet, isDescentActive, currentChallenge, currentPlanetAtmosphere]);

  // 60FPS Space Arcade Physics Canvas Loop
  useEffect(() => {
    if (screen !== "flight" || !canvasRef.current) return;
    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let animId: number;
    let width = (canvas.width = canvas.parentElement?.clientWidth || 900);
    let height = (canvas.height = canvas.parentElement?.clientHeight || 650);

    const fs = flightState.current;
    // Only initialize start coordinates if unset (prevents resetting when touching answers or answering questions)
    if (fs.shipX === 0 || fs.shipY === 0) {
      fs.shipX = width / 2;
      fs.shipY = height * 0.70;
      fs.targetX = width / 2;
      fs.targetY = height * 0.70;
    }

    if (fs.stars.length === 0) {
      for (let i = 0; i < 180; i++) {
        fs.stars.push({
          x: Math.random() * width,
          y: Math.random() * height,
          z: Math.random() * 3.5 + 0.8,
          size: Math.random() * 2 + 0.6,
          alpha: Math.random() * 0.7 + 0.3
        });
      }
    }

    const spawnCrystals = () => {
      if (isDescentActiveRef.current) return;
      const challenge = currentChallengeRef.current;
      if (!challenge) return;

      const correctWord = shuffle(challenge.correctWords)[0];
      const wrongWord1 = shuffle(challenge.wrongWords)[0];
      const wrongWord2 = shuffle(challenge.wrongWords.filter((w) => w !== wrongWord1))[0];

      const dist = distanceRemainingRef.current;
      const isSuper = isSuperCometRef.current;
      const itemsToSpawn = dist > 400 
        ? [{ text: correctWord, isCorrect: true }, { text: wrongWord1, isCorrect: false }]
        : [{ text: correctWord, isCorrect: true }, { text: wrongWord1, isCorrect: false }, { text: wrongWord2, isCorrect: false }];

      const lanes = itemsToSpawn.length === 2 ? [0.32, 0.68] : [0.22, 0.5, 0.78];
      const shuffledLanes = shuffle(lanes);
      const baseVy = 2.4 + (1 - dist / 800) * 1.3;

      itemsToSpawn.forEach((item, i) => {
        const laneX = width * shuffledLanes[i];
        // Calculate celestial orb radius based on word length
        const baseR = Math.max(38, Math.min(52, item.text.length * 8 + 14));
        fs.crystals.push({
          id: fs.nextEntityId++,
          text: item.text,
          isCorrect: item.isCorrect,
          explanation: challenge.explanationMap[item.text] || "إجابة غير صحيحة للمطلوب!",
          x: laneX,
          y: -60 - (i % 2) * 45,
          vy: isSuper ? baseVy * 1.3 : baseVy,
          vx: (Math.random() - 0.5) * 0.4,
          radius: baseR,
          width: baseR * 2,
          height: baseR * 2,
          rot: Math.random() * Math.PI * 2,
          pulsePhase: Math.random() * Math.PI * 2
        });
      });
    };

    if (!isDescentActiveRef.current) {
      spawnCrystals();
    }

    let lastTime = performance.now();

    const loop = (now: number) => {
      const dt = Math.min((now - lastTime) / 1000, 0.1);
      lastTime = now;

      // Ensure canvas dimensions match parent element in real-time
      const curW = canvas.parentElement?.clientWidth || width;
      const curH = canvas.parentElement?.clientHeight || height;
      if (curW > 0 && curH > 0 && (canvas.width !== curW || canvas.height !== curH)) {
        width = canvas.width = curW;
        height = canvas.height = curH;
      }
      if (fs.shipX <= 0 || fs.shipY <= 0) {
        fs.shipX = width / 2;
        fs.shipY = height * 0.70;
        fs.targetX = width / 2;
        fs.targetY = height * 0.70;
      }

      ctx.save();
      if (fs.screenShake > 0) {
        const sx = (Math.random() - 0.5) * fs.screenShake;
        const sy = (Math.random() - 0.5) * fs.screenShake;
        ctx.translate(sx, sy);
        fs.screenShake *= 0.88;
        if (fs.screenShake < 0.5) fs.screenShake = 0;
      }

      // Clear canvas cleanly so that the authentic living planet background is 100% visible!
      ctx.clearRect(0, 0, width, height);

      // Starfield (Subtle crystalline stars drifting through the living cosmos)
      const starSpeed = isSuperCometRef.current ? 14 : 5;
      fs.stars.forEach((star) => {
        star.y += star.z * (starSpeed / 3);
        if (star.y > height) {
          star.y = 0;
          star.x = Math.random() * width;
        }
        ctx.fillStyle = `rgba(240, 246, 255, ${star.alpha * 0.75})`;
        ctx.beginPath();
        ctx.arc(star.x, star.y, star.size, 0, Math.PI * 2);
        ctx.fill();
      });

      // Astronaut Movement (Full 2D Freedom, Snappy, Powerful, Zero-Lag across entire canvas)
      if (!isDescentActiveRef.current) {
        const accel = 5400; // Powerful high acceleration for zero-lag instant responsiveness
        if (fs.keys.left) fs.shipVx -= accel * dt;
        if (fs.keys.right) fs.shipVx += accel * dt;
        if (fs.keys.up) fs.shipVy -= accel * dt;
        if (fs.keys.down) fs.shipVy += accel * dt;

        // Snappy damping and max speed cap
        fs.shipVx *= 0.86;
        fs.shipVy *= 0.86;
        const maxV = 720;
        const curSpeed = Math.hypot(fs.shipVx, fs.shipVy);
        if (curSpeed > maxV) {
          fs.shipVx = (fs.shipVx / curSpeed) * maxV;
          fs.shipVy = (fs.shipVy / curSpeed) * maxV;
        }

        fs.shipX += fs.shipVx * dt;
        fs.shipY += fs.shipVy * dt;

        // If keyboard is active, sync target point to current position
        if (fs.keys.left || fs.keys.right || fs.keys.up || fs.keys.down) {
          fs.targetX = fs.shipX;
          fs.targetY = fs.shipY;
        } else {
          // If mouse or touch pointer is used, glide instantly with zero lag (0.38 responsiveness)
          const followFactor = 0.38;
          const dx = fs.targetX - fs.shipX;
          const dy = fs.targetY - fs.shipY;
          if (Math.abs(dx) > 1) {
            fs.shipX += dx * followFactor;
            fs.shipVx = dx * 14;
          }
          if (Math.abs(dy) > 1 && fs.targetY > 0) {
            fs.shipY += dy * followFactor;
            fs.shipVy = dy * 14;
          }
        }

        // Complete freedom to navigate to any point on the screen (all 4 corners and full interior)
        fs.shipX = Math.max(45, Math.min(width - 45, fs.shipX));
        fs.shipY = Math.max(70, Math.min(height - 70, fs.shipY));
        fs.tilt = Math.max(-0.35, Math.min(0.35, fs.shipVx * 0.0006));
      } else {
        fs.shipX = width / 2;
        fs.shipY = height * 0.70;
        fs.targetX = width / 2;
        fs.targetY = height * 0.70;
        fs.tilt = 0;
      }

      // Asteroids (Dynamic velocities, varied directions, diagonal cross-currents, high-speed space field)
      const asteroidInterval = isSuperCometRef.current ? 380 : 580;
      if (!isDescentActiveRef.current && now - fs.lastSpawnTime > asteroidInterval) {
        fs.lastSpawnTime = now;
        if (fs.asteroids.length < 10) {
          const spawnPattern = Math.random();
          let radius: number;
          let vy: number;
          let vx: number;
          let startX: number;
          let startY: number;

          if (isSuperCometRef.current) {
            radius = 16;
            startX = Math.random() * (width - 100) + 50;
            startY = -30;
            vy = Math.random() * 3 + 6.5;
            vx = (Math.random() - 0.5) * 4;
          } else if (spawnPattern < 0.25) {
            // Pattern A: High-Speed Diagonal Meteor darting from top-left or top-right!
            const fromLeft = Math.random() > 0.5;
            startX = fromLeft ? -20 : width + 20;
            startY = Math.random() * (height * 0.35);
            vx = fromLeft ? Math.random() * 3.5 + 4.0 : -(Math.random() * 3.5 + 4.0);
            vy = Math.random() * 3.0 + 3.5;
            radius = Math.random() * 10 + 14; // small & fast
          } else if (spawnPattern < 0.55) {
            // Pattern B: Fast Darting Meteor Fragment (High vertical & angled speed)
            startX = Math.random() * (width - 120) + 60;
            startY = -30;
            radius = Math.random() * 8 + 12; // 12 - 20px
            vy = Math.random() * 3.5 + 6.5; // High speed (6.5 - 10.0)
            vx = (Math.random() - 0.5) * 3.2;
          } else if (spawnPattern < 0.82) {
            // Pattern C: Medium Rotating Jagged Space Rock
            startX = Math.random() * (width - 140) + 70;
            startY = -50;
            radius = Math.random() * 12 + 24; // 24 - 36px
            vy = Math.random() * 2.2 + 3.4; // Medium speed (3.4 - 5.6)
            vx = (Math.random() - 0.5) * 2.0;
          } else {
            // Pattern D: Colossal Heavy Cosmic Boulder (Slow massive tumbling hazard)
            startX = Math.random() * (width - 180) + 90;
            startY = -80;
            radius = Math.random() * 18 + 48; // 48 - 66px
            vy = Math.random() * 1.2 + 1.6; // Slow (1.6 - 2.8)
            vx = (Math.random() - 0.5) * 1.2;
          }

          fs.asteroids.push({
            id: fs.nextEntityId++,
            x: startX,
            y: startY,
            radius,
            vy,
            vx,
            rot: Math.random() * Math.PI * 2,
            vRot: (Math.random() - 0.5) * 0.09,
            isStar: isSuperCometRef.current
          });
        }
      }

      // Lasers
      ctx.fillStyle = "#22d3ee";
      ctx.shadowColor = "#00f0ff";
      ctx.shadowBlur = 10;
      for (let i = fs.lasers.length - 1; i >= 0; i--) {
        const l = fs.lasers[i];
        l.y += l.vy;
        ctx.fillRect(l.x - 2.5, l.y, 5, 20);

        let hit = false;
        for (let j = fs.asteroids.length - 1; j >= 0; j--) {
          const ast = fs.asteroids[j];
          if (Math.hypot(l.x - ast.x, l.y - ast.y) < ast.radius + 6) {
            audio.rockExplode();
            createSparks(ast.x, ast.y, "#f59e0b", 22);
            fs.asteroids.splice(j, 1);
            setScore((s) => s + 25);
            hit = true;
            break;
          }
        }
        if (hit || l.y < -30) fs.lasers.splice(i, 1);
      }
      ctx.shadowBlur = 0;

      // 1. Dynamic Supersonic Shooting Stars & Meteors (الشهب الكونية المتوهجة)
      const meteorInterval = 2800;
      if (!isDescentActiveRef.current && now - fs.lastMeteorsSpawnTime > meteorInterval) {
        fs.lastMeteorsSpawnTime = now;
        const currentAtm = currentPlanetAtmosphereRef.current;
        const meteorColor = currentAtm?.meteorStreakColor || "#38bdf8";
        const startFromRight = Math.random() > 0.5;
        fs.shootingStars.push({
          x: startFromRight ? width + 20 : Math.random() * width * 0.8,
          y: Math.random() * (height * 0.35) - 30,
          vx: startFromRight ? -(Math.random() * 8 + 14) : Math.random() * 6 + 12,
          vy: Math.random() * 8 + 12,
          length: Math.random() * 80 + 130,
          alpha: 1.0,
          color: meteorColor
        });
      }

      // Draw and update Shooting Stars
      for (let i = fs.shootingStars.length - 1; i >= 0; i--) {
        const ms = fs.shootingStars[i];
        ms.x += ms.vx;
        ms.y += ms.vy;
        ms.alpha -= 0.024;

        if (ms.alpha > 0) {
          ctx.save();
          const angle = Math.atan2(ms.vy, ms.vx);
          ctx.translate(ms.x, ms.y);
          ctx.rotate(angle);

          const streakGrad = ctx.createLinearGradient(0, 0, -ms.length, 0);
          streakGrad.addColorStop(0, "#ffffff");
          streakGrad.addColorStop(0.25, ms.color);
          streakGrad.addColorStop(0.75, `${ms.color}44`);
          streakGrad.addColorStop(1, "transparent");

          ctx.fillStyle = streakGrad;
          ctx.beginPath();
          ctx.moveTo(0, 0);
          ctx.lineTo(-ms.length, -2.5);
          ctx.lineTo(-ms.length, 2.5);
          ctx.closePath();
          ctx.fill();

          // Superheated Meteor Head
          ctx.fillStyle = "#ffffff";
          ctx.shadowColor = ms.color;
          ctx.shadowBlur = 14;
          ctx.beginPath();
          ctx.arc(0, 0, 3.8, 0, Math.PI * 2);
          ctx.fill();
          ctx.shadowBlur = 0;
          ctx.restore();

          if (Math.random() > 0.35) {
            createSparks(ms.x, ms.y, ms.color, 1);
          }
        }

        if (ms.alpha <= 0 || ms.y > height + 100 || ms.x < -150 || ms.x > width + 150) {
          fs.shootingStars.splice(i, 1);
        }
      }

      // Draw Asteroids & Celestial Bodies (Photorealistic 3D Volumetric Models)
      const activeAtm = currentPlanetAtmosphereRef.current;
      const rockPal = activeAtm?.rockPalette || {
        highlight: "#cbd5e1",
        mid: "#64748b",
        shadow: "#334155",
        void: "#020617",
        craterShadow: "#090d16",
        craterRim: "rgba(226, 232, 240, 0.45)",
        veinGlow: "#38bdf8",
        backlight: "rgba(56, 189, 248, 0.35)"
      };
      const cometPal = activeAtm?.cometPalette || {
        core: "#ffffff",
        comaInner: "rgba(254, 240, 138, 0.95)",
        comaOuter: "rgba(234, 88, 12, 0.25)",
        tailGrad: ["rgba(255, 255, 255, 0.95)", "rgba(251, 191, 36, 0.85)", "rgba(245, 158, 11, 0.5)", "rgba(14, 165, 233, 0)"],
        tailCore: "#ffffff",
        sparkle: "#ffffff"
      };

      for (let i = fs.asteroids.length - 1; i >= 0; i--) {
        const ast = fs.asteroids[i];
        ast.y += ast.vy;
        if (ast.vx) ast.x += ast.vx;
        ast.rot += ast.vRot;

        ctx.save();
        ctx.translate(ast.x, ast.y);
        ctx.rotate(ast.rot);

        if (ast.isStar) {
          // --- REALISTIC 3D COMET / CELESTIAL BODY ---
          // 1. Long Volumetric Ion Plasma & Vapor Dust Tail extending backward along flight vector
          const tailLength = Math.max(55, ast.vy * 20);
          const tailGrad = ctx.createLinearGradient(0, 0, 0, -tailLength);
          tailGrad.addColorStop(0, cometPal.tailGrad[0]);
          tailGrad.addColorStop(0.2, cometPal.tailGrad[1]);
          tailGrad.addColorStop(0.6, cometPal.tailGrad[2]);
          tailGrad.addColorStop(1, cometPal.tailGrad[3]);

          ctx.save();
          ctx.fillStyle = tailGrad;
          ctx.beginPath();
          ctx.moveTo(-ast.radius * 0.8, 0);
          ctx.quadraticCurveTo(-ast.radius * 1.7, -tailLength * 0.45, -ast.radius * 0.2, -tailLength);
          ctx.lineTo(ast.radius * 0.2, -tailLength);
          ctx.quadraticCurveTo(ast.radius * 1.7, -tailLength * 0.45, ast.radius * 0.8, 0);
          ctx.closePath();
          ctx.fill();

          // Central hyper-speed ion stream
          ctx.fillStyle = cometPal.tailCore;
          ctx.fillRect(-1.5, -tailLength * 0.88, 3, tailLength * 0.88);
          ctx.restore();

          // 2. Volumetric Glowing Coma (Gaseous halo around nucleus)
          const comaGrad = ctx.createRadialGradient(0, 0, ast.radius * 0.15, 0, 0, ast.radius * 1.9);
          comaGrad.addColorStop(0, cometPal.comaInner);
          comaGrad.addColorStop(0.45, cometPal.comaOuter);
          comaGrad.addColorStop(1, "transparent");
          ctx.fillStyle = comaGrad;
          ctx.beginPath();
          ctx.arc(0, 0, ast.radius * 1.9, 0, Math.PI * 2);
          ctx.fill();

          // 3. 3D Spherical Nucleus with Photorealistic Surface Gradient
          const nucGrad = ctx.createRadialGradient(
            -ast.radius * 0.35,
            -ast.radius * 0.35,
            ast.radius * 0.1,
            0,
            0,
            ast.radius
          );
          nucGrad.addColorStop(0, cometPal.core);
          nucGrad.addColorStop(0.35, cometPal.sparkle);
          nucGrad.addColorStop(0.7, activeAtm?.ambientColor || "#f59e0b");
          nucGrad.addColorStop(1, rockPal.shadow);
          ctx.fillStyle = nucGrad;
          ctx.shadowColor = activeAtm?.accentNeon || "#f59e0b";
          ctx.shadowBlur = 18;
          ctx.beginPath();
          ctx.arc(0, 0, ast.radius, 0, Math.PI * 2);
          ctx.fill();
          ctx.shadowBlur = 0;

          // Surface solar flares micro-sparkles
          ctx.fillStyle = "#ffffff";
          ctx.beginPath();
          ctx.arc(-ast.radius * 0.3, -ast.radius * 0.3, 2, 0, Math.PI * 2);
          ctx.arc(ast.radius * 0.25, ast.radius * 0.2, 1.5, 0, Math.PI * 2);
          ctx.fill();
        } else {
          // --- REALISTIC 3D SPACE ROCK / ASTEROID ---
          // Deterministic organic vertex perturbations per asteroid based on its ID
          const seed = ast.id * 1337;
          const pts = 12; // 12-vertex organic rocky silhouette
          ctx.beginPath();
          for (let p = 0; p < pts; p++) {
            const angle = (p / pts) * Math.PI * 2;
            const wave = Math.sin(angle * 3 + seed) * 0.14 + Math.cos(angle * 5 + seed * 2) * 0.08;
            const r = ast.radius * (0.86 + wave);
            const px = Math.cos(angle) * r;
            const py = Math.sin(angle) * r;
            if (p === 0) ctx.moveTo(px, py);
            else ctx.lineTo(px, py);
          }
          ctx.closePath();

          // 1. Realistic 3D Volumetric Spherical Shading tailored to planet's mineral geology
          const rockGrad = ctx.createRadialGradient(
            -ast.radius * 0.35,
            -ast.radius * 0.38,
            ast.radius * 0.08,
            ast.radius * 0.12,
            ast.radius * 0.12,
            ast.radius * 1.05
          );
          rockGrad.addColorStop(0, rockPal.highlight); // High-contrast sunlit basalt crest
          rockGrad.addColorStop(0.24, rockPal.mid); // Lit mineral rock face
          rockGrad.addColorStop(0.58, rockPal.shadow); // Midtone rock crags
          rockGrad.addColorStop(0.88, rockPal.void); // Deep terminator shadow
          rockGrad.addColorStop(1, "#010307"); // Pitch black space void shadow
          ctx.fillStyle = rockGrad;
          ctx.fill();

          // Glowing Subsurface Mineral Fissures / Magma Veins
          ctx.save();
          ctx.strokeStyle = rockPal.veinGlow;
          ctx.lineWidth = 1.4;
          ctx.shadowColor = rockPal.veinGlow;
          ctx.shadowBlur = 6;
          ctx.beginPath();
          const vSeed = ast.id * 73;
          const v1x = Math.sin(vSeed) * ast.radius * 0.35;
          const v1y = Math.cos(vSeed) * ast.radius * 0.35;
          ctx.moveTo(v1x, v1y);
          ctx.lineTo(v1x + Math.sin(vSeed * 1.5) * ast.radius * 0.32, v1y + Math.cos(vSeed * 1.5) * ast.radius * 0.32);
          ctx.stroke();
          ctx.restore();

          // 2. Realistic 3D Craters with illuminated rims and cast shadow depths
          const craterOffsets = [
            { x: -0.25, y: -0.15, r: 0.28 },
            { x: 0.28, y: -0.22, r: 0.22 },
            { x: 0.12, y: 0.28, r: 0.25 }
          ];
          craterOffsets.forEach((c, idx) => {
            const cx = c.x * ast.radius;
            const cy = c.y * ast.radius;
            const cr = c.r * ast.radius;
            // Crater inner shadow
            ctx.save();
            ctx.beginPath();
            ctx.arc(cx, cy, cr, 0, Math.PI * 2);
            const cGrad = ctx.createRadialGradient(cx - cr * 0.3, cy - cr * 0.3, 0, cx, cy, cr);
            cGrad.addColorStop(0, rockPal.void);
            cGrad.addColorStop(0.8, rockPal.craterShadow);
            cGrad.addColorStop(1, rockPal.mid);
            ctx.fillStyle = cGrad;
            ctx.fill();
            // Crater bright illuminated rim on sun-opposing edge
            ctx.strokeStyle = idx % 2 === 0 ? rockPal.craterRim : "rgba(255, 255, 255, 0.28)";
            ctx.lineWidth = 1.2;
            ctx.beginPath();
            ctx.arc(cx, cy, cr, 0.2 * Math.PI, 1.1 * Math.PI);
            ctx.stroke();
            ctx.restore();
          });

          // 3. Subtle outer rim backlight from the atmospheric corona below
          ctx.strokeStyle = rockPal.backlight;
          ctx.lineWidth = 1.6;
          ctx.stroke();
        }
        ctx.restore();

        const shipDist = Math.hypot(fs.shipX - ast.x, fs.shipY - ast.y);
        if (shipDist < ast.radius + 38 && fs.invulnerableTimer <= 0) {
          if (ast.isStar) {
            audio.correct();
            setScore((s) => s + 50);
            createSparks(ast.x, ast.y, "#fbbf24", 15);
            fs.asteroids.splice(i, 1);
            continue;
          }

          audio.wrong();
          fs.screenShake = 16;
          createSparks(ast.x, ast.y, "#ef4444", 25);
          fs.asteroids.splice(i, 1);

          const nextShields = Math.max(0, shieldsRef.current - 1);
          shieldsRef.current = nextShields;
          setShields(nextShields);
          if (nextShields <= 0) {
            setTimeout(() => setScreen("gameover"), 0);
          }
          setCombo(0);
          setDistanceRemaining((d) => Math.min(800, d + 100));
          fs.invulnerableTimer = 1.4;
          continue;
        }

        if (ast.y > height + 80 || ast.x < -80 || ast.x > width + 80) fs.asteroids.splice(i, 1);
      }

      // Word Crystals: 3D Celestial Bodies (أجرام سماوية فلكية متوهجة بدلاً من المستطيلات)
      // UNIFORM STYLING: No visual giveaway of correct vs wrong options! Both have identical celestial aura!
      for (let i = fs.crystals.length - 1; i >= 0; i--) {
        const c = fs.crystals[i];
        c.y += c.vy;
        if (c.vx) c.x += c.vx;
        c.rot = (c.rot || 0) + 0.008;
        c.pulsePhase = (c.pulsePhase || 0) + 0.04;

        ctx.save();
        ctx.translate(c.x, c.y);

        const r = c.radius || 42;
        const pulse = Math.sin(c.pulsePhase || 0) * 1.5;

        // 1. Unified Deep Space Celestial Corona & Atmosphere Halo
        // Both correct and wrong options share the exact same luminous cosmic cyan/teal halo
        ctx.save();
        const haloGrad = ctx.createRadialGradient(0, 0, r * 0.75, 0, 0, r + 14 + pulse);
        haloGrad.addColorStop(0, "rgba(56, 189, 248, 0.28)");
        haloGrad.addColorStop(0.5, "rgba(34, 211, 238, 0.12)");
        haloGrad.addColorStop(1, "transparent");
        ctx.fillStyle = haloGrad;
        ctx.beginPath();
        ctx.arc(0, 0, r + 14 + pulse, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();

        // 2. Translucent Planetary Rings / Orbit Ring surrounding the celestial body
        ctx.save();
        ctx.strokeStyle = "rgba(103, 232, 249, 0.45)";
        ctx.lineWidth = 1.4;
        ctx.beginPath();
        ctx.ellipse(0, 0, r * 1.28 + pulse, r * 0.45, -0.22, 0, Math.PI * 2);
        ctx.stroke();
        ctx.restore();

        // 3. 3D Spherical Celestial Body with Volumetric Shading (جرم سماوي كروي واقعي)
        // High-contrast sunlit crest from upper-left to deep void shadow on bottom-right
        const sphereGrad = ctx.createRadialGradient(
          -r * 0.35,
          -r * 0.38,
          r * 0.08,
          0,
          0,
          r
        );
        sphereGrad.addColorStop(0, "#e0f2fe"); // Specular sunlit ice/mineral peak
        sphereGrad.addColorStop(0.22, "#0284c7"); // Vibrant blue-cyan celestial crust
        sphereGrad.addColorStop(0.55, "#0f2744"); // Midtone deep celestial mantle
        sphereGrad.addColorStop(0.85, "#030e1a"); // Deep terminator shadow
        sphereGrad.addColorStop(1, "#01050a"); // Space void shadow
        ctx.fillStyle = sphereGrad;
        ctx.shadowColor = "#38bdf8";
        ctx.shadowBlur = 12;
        ctx.beginPath();
        ctx.arc(0, 0, r, 0, Math.PI * 2);
        ctx.fill();
        ctx.shadowBlur = 0;

        // 4. Subtle Craters and Mineral Geodes on the celestial body surface
        ctx.save();
        ctx.clip(); // Keep craters within sphere
        const craters = [
          { ox: -0.32, oy: -0.15, cr: 0.20 },
          { ox: 0.34, oy: -0.25, cr: 0.18 },
          { ox: 0.15, oy: 0.32, cr: 0.22 }
        ];
        craters.forEach((cr) => {
          const cx = cr.ox * r;
          const cy = cr.oy * r;
          const crad = cr.cr * r;
          ctx.beginPath();
          ctx.arc(cx, cy, crad, 0, Math.PI * 2);
          const cGrad = ctx.createRadialGradient(cx - crad * 0.3, cy - crad * 0.3, 0, cx, cy, crad);
          cGrad.addColorStop(0, "rgba(2, 6, 23, 0.95)");
          cGrad.addColorStop(0.7, "rgba(8, 47, 73, 0.8)");
          cGrad.addColorStop(1, "rgba(56, 189, 248, 0.4)");
          ctx.fillStyle = cGrad;
          ctx.fill();
          // Crater sunlit rim
          ctx.strokeStyle = "rgba(186, 230, 253, 0.45)";
          ctx.lineWidth = 1.0;
          ctx.beginPath();
          ctx.arc(cx, cy, crad, 0.2 * Math.PI, 1.2 * Math.PI);
          ctx.stroke();
        });
        ctx.restore();

        // 5. Backlight rim corona
        ctx.strokeStyle = "rgba(56, 189, 248, 0.65)";
        ctx.lineWidth = 1.8;
        ctx.beginPath();
        ctx.arc(0, 0, r, 0, Math.PI * 2);
        ctx.stroke();

        // 6. Linguistic Arabic Typography inside the Celestial Body
        ctx.save();
        ctx.fillStyle = "#ffffff";
        ctx.shadowColor = "rgba(0, 0, 0, 0.95)";
        ctx.shadowBlur = 6;
        ctx.shadowOffsetX = 0;
        ctx.shadowOffsetY = 2;
        ctx.font = "bold 20px 'Cairo', sans-serif";
        ctx.textAlign = "center";
        ctx.textBaseline = "middle";
        ctx.fillText(c.text, 0, 1);
        ctx.restore();

        ctx.restore();

        // Collision Check: Astronaut collecting the Celestial Body
        const collDist = Math.hypot(fs.shipX - c.x, fs.shipY - c.y);
        const hitRadius = (c.radius || 42) + 38;

        if (collDist < hitRadius) {
          if (c.isCorrect) {
            audio.correct();
            createSparks(c.x, c.y, "#38bdf8", 32);
            createSparks(c.x, c.y, "#fef08a", 16);
            const currentCmb = comboRef.current;
            setScore((s) => s + 100 + currentCmb * 25);

            const nextCombo = currentCmb + 1;
            setCombo(nextCombo);

            if (nextCombo === 3) {
              setIsSuperComet(true);
              setTimeout(() => setIsSuperComet(false), 5500);
            }

            const nextDist = Math.max(0, distanceRemainingRef.current - 100);
            distanceRemainingRef.current = nextDist;
            setDistanceRemaining(nextDist);
            if (nextDist === 0) {
              setTimeout(() => handleWinStage(), 0);
            }

            setCrystalsCaught((cc) => cc + 1);

            // KEY USER REQUIREMENT:
            // "عند اختيار الخيار الصحيح يختفي بقية الخيارات، لا داعي لذلك"
            // Do NOT clear all crystals! ONLY remove this collected crystal:
            fs.crystals.splice(i, 1);

            // Spawn next wave only when needed (e.g. no correct words remaining or wave empty):
            const hasCorrectRemaining = fs.crystals.some((cr) => cr.isCorrect);
            if (!hasCorrectRemaining && distanceRemainingRef.current > 0) {
              spawnCrystals();
            }
            continue;
          } else {
            audio.wrong();
            fs.screenShake = 14;
            createSparks(c.x, c.y, "#f43f5e", 24);

            const nextShields = Math.max(0, shieldsRef.current - 1);
            shieldsRef.current = nextShields;
            setShields(nextShields);
            if (nextShields <= 0) {
              setTimeout(() => setScreen("gameover"), 0);
            }

            setCombo(0);
            setDistanceRemaining((d) => Math.min(800, d + 80));
            fs.crystals.splice(i, 1);
            continue;
          }
        } else if (c.y > height + 80 || c.x < -100 || c.x > width + 100) {
          fs.crystals.splice(i, 1);
        }
      }

      if (fs.crystals.length === 0 && distanceRemainingRef.current > 0 && !isDescentActiveRef.current) {
        spawnCrystals();
      }

      // Particles
      for (let i = fs.particles.length - 1; i >= 0; i--) {
        const p = fs.particles[i];
        p.x += p.vx;
        p.y += p.vy;
        p.life -= dt;
        const alpha = Math.max(0, p.life / p.maxLife);
        ctx.fillStyle = p.color;
        ctx.globalAlpha = alpha;
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
        ctx.fill();
        ctx.globalAlpha = 1;
        if (p.life <= 0) fs.particles.splice(i, 1);
      }

      // Render Astronaut Hero (The Player Character executing the mission instead of the rocket!)
      if (!isDescentActiveRef.current) {
        ctx.save();
        ctx.translate(fs.shipX, fs.shipY);
        ctx.rotate(fs.tilt);

        if (fs.invulnerableTimer > 0) {
          fs.invulnerableTimer -= dt;
          if (Math.floor(fs.invulnerableTimer * 10) % 2 === 0) ctx.globalAlpha = 0.4;
        }

        const astroW = 86;
        const astroH = 152;

        // === CINEMATIC PHOTOREALISTIC ROCKET THRUSTER PLUME ===
        // Dynamic thrust intensity based on movement:
        const isThrustingUp = fs.keys.up || fs.shipVy < -40;
        const isManeuvering = Math.abs(fs.shipVx) > 50 || Math.abs(fs.shipVy) > 50;
        const isSuper = isSuperCometRef.current;

        // Base flame length expands dramatically when thrusting!
        const flameLength = (isSuper ? 54 : isThrustingUp ? 48 : isManeuvering ? 34 : 22) + Math.random() * 8;
        const flameWidth = (isThrustingUp || isSuper ? 14 : 9) + Math.random() * 2;

        // Twin thrusters under astronaut's boots/jetpack at x = -11 and x = +11, y = 68
        const thrusterPositions = [-11, 11];

        thrusterPositions.forEach((tx) => {
          ctx.save();
          ctx.translate(tx, 68);

          // If maneuvering laterally, tilt flame slightly in opposite direction
          const flameTilt = -fs.shipVx * 0.0003;
          ctx.rotate(flameTilt);

          // 1. Ambient Volumetric Space Illumination (Backlight cast on cosmic dust)
          const ambientGlow = ctx.createRadialGradient(0, flameLength * 0.5, 2, 0, flameLength * 0.5, flameLength * 1.4);
          ambientGlow.addColorStop(0, isSuper ? "rgba(34, 211, 238, 0.45)" : isThrustingUp ? "rgba(251, 146, 60, 0.5)" : "rgba(56, 189, 248, 0.35)");
          ambientGlow.addColorStop(1, "transparent");
          ctx.fillStyle = ambientGlow;
          ctx.beginPath();
          ctx.arc(0, flameLength * 0.5, flameLength * 1.4, 0, Math.PI * 2);
          ctx.fill();

          // 2. Outer Supersonic Incandescent Flame Plume (Fiery cone expanding and tapering)
          const outerGrad = ctx.createLinearGradient(0, 0, 0, flameLength);
          if (isThrustingUp) {
            outerGrad.addColorStop(0, "#ffffff");
            outerGrad.addColorStop(0.2, "#38bdf8");
            outerGrad.addColorStop(0.55, "#f59e0b");
            outerGrad.addColorStop(0.85, "#ef4444");
            outerGrad.addColorStop(1, "transparent");
          } else {
            outerGrad.addColorStop(0, "#ffffff");
            outerGrad.addColorStop(0.3, "#38bdf8");
            outerGrad.addColorStop(0.75, "#0284c7");
            outerGrad.addColorStop(1, "transparent");
          }

          ctx.fillStyle = outerGrad;
          ctx.shadowColor = isThrustingUp ? "#f59e0b" : "#00f0ff";
          ctx.shadowBlur = 16;
          ctx.beginPath();
          ctx.moveTo(-flameWidth * 0.5, 0);
          ctx.quadraticCurveTo(-flameWidth * 0.85, flameLength * 0.4, 0, flameLength);
          ctx.quadraticCurveTo(flameWidth * 0.85, flameLength * 0.4, flameWidth * 0.5, 0);
          ctx.closePath();
          ctx.fill();

          // 3. Ultra-Hot Inner Supersonic Jet Core (Needle of intense blinding plasma)
          const coreGrad = ctx.createLinearGradient(0, 0, 0, flameLength * 0.65);
          coreGrad.addColorStop(0, "#ffffff");
          coreGrad.addColorStop(0.7, "#a5f3fc");
          coreGrad.addColorStop(1, "transparent");
          ctx.fillStyle = coreGrad;
          ctx.shadowColor = "#ffffff";
          ctx.shadowBlur = 10;
          ctx.beginPath();
          ctx.moveTo(-flameWidth * 0.25, 0);
          ctx.lineTo(0, flameLength * 0.65);
          ctx.lineTo(flameWidth * 0.25, 0);
          ctx.closePath();
          ctx.fill();

          // 4. Supersonic Shock Diamonds (Mach Diamonds inside the plasma plume)
          const diamondCount = isThrustingUp || isSuper ? 3 : 2;
          for (let d = 1; d <= diamondCount; d++) {
            const dy = (flameLength * 0.22) * d;
            const dw = Math.max(1.8, (flameWidth * 0.32) - d * 0.8);
            ctx.fillStyle = "rgba(255, 255, 255, 0.95)";
            ctx.beginPath();
            ctx.moveTo(0, dy - dw);
            ctx.lineTo(dw, dy);
            ctx.lineTo(0, dy + dw);
            ctx.lineTo(-dw, dy);
            ctx.closePath();
            ctx.fill();
          }

          ctx.shadowBlur = 0;
          ctx.restore();

          // 5. Continuous Stream of Fiery Micro-Embers / Jet Particles ejected backward
          if (Math.random() > (isThrustingUp ? 0.15 : 0.45)) {
            const sparkAngle = Math.PI * 0.5 + (Math.random() - 0.5) * 0.5;
            const sparkSpeed = Math.random() * 4 + (isThrustingUp ? 6 : 3);
            fs.particles.push({
              x: fs.shipX + tx,
              y: fs.shipY + 68 + flameLength * 0.6,
              vx: Math.cos(sparkAngle) * sparkSpeed + (Math.random() - 0.5) * 2,
              vy: Math.sin(sparkAngle) * sparkSpeed + 4,
              life: 1,
              maxLife: Math.random() * 12 + 8,
              color: isThrustingUp ? (Math.random() > 0.5 ? "#f59e0b" : "#fbbf24") : "#38bdf8",
              size: Math.random() * 2.2 + 1.2
            });
          }
        });

        // Draw Astronaut Hero Sprite (Consistently first astronaut design)
        if (astronautImgRef.current && astronautImgRef.current.complete && astronautImgRef.current.naturalWidth > 0) {
          ctx.drawImage(astronautImgRef.current, -astroW / 2, -astroH / 2, astroW, astroH);
        } else if (astronautHeroImgRef.current && astronautHeroImgRef.current.complete && astronautHeroImgRef.current.naturalWidth > 0) {
          ctx.drawImage(astronautHeroImgRef.current, -astroW / 2, -astroH / 2, astroW, astroH);
        } else if (retroRocketImgRef.current && retroRocketImgRef.current.complete && retroRocketImgRef.current.naturalWidth > 0) {
          ctx.drawImage(retroRocketImgRef.current, -astroW / 2, -astroH / 2, astroW, astroH);
        } else {
          // Fallback vector astronaut during asset load
          ctx.save();
          ctx.fillStyle = "#ffffff";
          ctx.beginPath();
          ctx.roundRect(-22, -45, 44, 70, 18);
          ctx.fill();
          ctx.fillStyle = "#38bdf8";
          ctx.beginPath();
          ctx.roundRect(-16, -38, 32, 22, 10);
          ctx.fill();
          ctx.restore();
        }

        ctx.restore();
      }

      ctx.restore();

      animId = requestAnimationFrame(loop);
    };

    // Kick off physics loop
    animId = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(animId);
  }, [screen]);

  const handleWinStage = () => {
    audio.warpGate();
    flightState.current.shipX = 0;
    flightState.current.shipY = 0;
    flightState.current.targetX = 0;
    flightState.current.targetY = 0;
    flightState.current.shipVx = 0;
    flightState.current.shipVy = 0;
    const starsEarned = shields >= 3 ? 3 : shields >= 2 ? 2 : 1;
    const newSave: Save = {
      ...save,
      stars: { ...save.stars, [activeStage.id]: Math.max(save.stars[activeStage.id] || 0, starsEarned) },
      best: { ...save.best, [activeStage.id]: Math.max(save.best[activeStage.id] || 0, score + 800) },
      completed: Array.from(new Set([...save.completed, activeStage.id])),
      coins: save.coins + 100
    };
    setSave(newSave);
    saveGame(newSave);

    if (onWin) {
      setTimeout(() => onWin(score + 800), 0);
    }
    setTimeout(() => {
      setScreen("victory");
    }, 700);
  };

  const handlePointerMove = (e: React.PointerEvent<HTMLCanvasElement>) => {
    if (screen !== "flight" || !canvasRef.current || isDescentActive) return;
    const rect = canvasRef.current.getBoundingClientRect();
    flightState.current.targetX = e.clientX - rect.left;
    flightState.current.targetY = e.clientY - rect.top;
  };

  // Dynamic Photon Guidance Beam between Rocket Nose and Target Planet (Only active when hovering or locked on planet)
  const trajectoryPath = useMemo(() => {
    if (!activeTargetNode) {
      return { svgD: "", dots: [] };
    }
    const startX = LAUNCH_PAD.x;
    const startY = LAUNCH_PAD.y - 7;
    const endX = targetCoords.x;
    const endY = targetCoords.y;

    const midX = (startX + endX) / 2 + (startX > endX ? 14 : -14);
    const midY = Math.min(startY, endY) - 15;

    const dots: { x: number; y: number }[] = [];
    const count = 22;
    for (let i = 1; i < count; i++) {
      const t = i / count;
      const x = (1 - t) * (1 - t) * startX + 2 * (1 - t) * t * midX + t * t * endX;
      const y = (1 - t) * (1 - t) * startY + 2 * (1 - t) * t * midY + t * t * endY;
      dots.push({ x, y });
    }

    return {
      svgD: `M ${startX} ${startY} Q ${midX} ${midY} ${endX} ${endY}`,
      dots
    };
  }, [targetCoords, activeTargetNode]);

  return (
    <div className="w-full h-full min-h-screen bg-[#040510] text-[#eef7ff] relative overflow-hidden select-none font-sans" dir="rtl">
      
      {/* ============================================================== */}
      {/* 1. خريطة الكواكب الفضائية الواقعية والبهيجة (النسخة السينيمائية الحية) */}
      {/* ============================================================== */}
      {screen === "home" && (
        <div 
          className={`relative w-full h-screen overflow-hidden flex flex-col justify-between items-center select-none ${
            isRumbling ? "animate-[screenRumble_0.45s_ease-in-out]" : ""
          }`}
          onPointerMove={handleHomePointerMove}
          style={{ backgroundColor: "#020617" }}
        >
          {/* Photorealistic High-Definition Deep Space Cosmos Background (Moving Cinematic Parallax Pan) */}
          <div 
            className="absolute inset-[-8%] bg-cover bg-center pointer-events-none will-change-transform opacity-95"
            style={{ 
              backgroundImage: `url(${solarSystemCosmosBg})`,
              animation: "cosmicPanDrift 45s ease-in-out infinite alternate"
            }}
          />
          {/* Moving Atmospheric Nebula & Stardust Stream Overlay */}
          <div 
            className="absolute inset-[-10%] pointer-events-none mix-blend-screen opacity-35 will-change-transform"
            style={{
              background: "radial-gradient(ellipse at 30% 40%, rgba(34,211,238,0.25) 0%, transparent 60%), radial-gradient(ellipse at 70% 60%, rgba(129,140,248,0.2) 0%, transparent 60%)",
              animation: "livingNebulaSwirl1 55s linear infinite"
            }}
          />
          {/* Atmospheric Depth Vignette */}
          <div className="absolute inset-0 pointer-events-none bg-gradient-to-b from-[#020617]/25 via-transparent to-[#020617]/35" />

          {/* Atmospheric Rim Glow on Bottom-Left Giant Celestial Body */}
          <div 
            className="absolute -bottom-[16%] -left-[12%] w-[42vw] h-[42vw] max-w-[520px] max-h-[520px] rounded-full pointer-events-none"
            style={{
              background: "radial-gradient(circle at 45% 45%, transparent 66%, rgba(34, 211, 238, 0.35) 86%, rgba(103, 232, 249, 0.75) 100%)",
              filter: "blur(5px)"
            }}
          />

          {/* Keyframe Styles for Living Space Background, Multi-Layer Parallax, Distant Bodies, and Realistic Meteors */}
          <style>{`
            @keyframes cosmicPanDrift {
              0% { transform: scale(1.04) translate3d(-1%, -1%, 0); }
              50% { transform: scale(1.09) translate3d(2%, -2%, 0); }
              100% { transform: scale(1.04) translate3d(-1.5%, 1.5%, 0); }
            }
            @keyframes sunSurfaceSpin {
              0% { transform: rotate(0deg) scale(1.05); }
              50% { transform: rotate(180deg) scale(1.12); }
              100% { transform: rotate(360deg) scale(1.05); }
            }
            @keyframes floatingSpaceMote {
              0%, 100% { transform: translate3d(0, 0, 0) scale(1); opacity: 0.35; }
              50% { transform: translate3d(24px, -20px, 15px) scale(1.25); opacity: 0.85; }
            }
            @keyframes deepNebulaPulse {
              0%, 100% { transform: scale(1) rotate(0deg); opacity: 0.28; }
              50% { transform: scale(1.08) rotate(2deg); opacity: 0.42; }
            }
            @keyframes planetSelfSpin {
              from { transform: rotate(0deg); }
              to { transform: rotate(360deg); }
            }
            @keyframes rocketIdleZeroG {
              0%, 100% { transform: translateY(0px) rotate(0deg); }
              50% { transform: translateY(-5px) rotate(0.6deg); }
            }
            @keyframes starCalmBreathe {
              0%, 100% { opacity: 0.25; transform: scale(0.85); }
              50% { opacity: 0.95; transform: scale(1.15); }
            }
            @keyframes diamondGlint {
              0%, 100% { opacity: 0.3; transform: scale(0.7) rotate(0deg); }
              50% { opacity: 1; transform: scale(1.25) rotate(45deg); }
            }
            @keyframes cosmicDustDrift {
              0% { transform: translate3d(0, 0, 0); opacity: 0.25; }
              50% { transform: translate3d(28px, -18px, 0); opacity: 0.75; }
              100% { transform: translate3d(0, 0, 0); opacity: 0.25; }
            }
            @keyframes deepStarsSlowDrift {
              0% { transform: translate3d(0, 0, 0); }
              50% { transform: translate3d(12px, -8px, 0); }
              100% { transform: translate3d(0, 0, 0); }
            }
            @keyframes exhaustParticleDrift {
              0% { transform: translateY(0) scale(1); opacity: 0.9; }
              100% { transform: translateY(30px) scale(0.15); opacity: 0; }
            }
            @keyframes enginePlasmaFlicker {
              0%, 100% { transform: scaleY(1) scaleX(1); opacity: 0.95; }
              50% { transform: scaleY(1.08) scaleX(0.95); opacity: 1; }
              75% { transform: scaleY(0.94) scaleX(1.03); opacity: 0.92; }
            }
            @keyframes shockDiamondPulse {
              0%, 100% { opacity: 0.95; transform: scale(1); }
              50% { opacity: 0.65; transform: scale(1.18); }
            }
            @keyframes launchVaporPuff {
              0% { transform: translate(-50%, 0) scale(0.35); opacity: 0.85; }
              50% { transform: translate(-50%, 18px) scale(1.1); opacity: 0.55; }
              100% { transform: translate(-50%, 42px) scale(1.9); opacity: 0; }
            }
            @keyframes launchSparkEject {
              0% { transform: translate(0, 0) scale(1); opacity: 1; }
              100% { transform: translate(var(--tx, 0px), var(--ty, 35px)) scale(0.2); opacity: 0; }
            }
            @keyframes screenRumble {
              0%, 100% { transform: translate(0, 0); }
              20% { transform: translate(-1.5px, 1.2px); }
              40% { transform: translate(1.8px, -1.4px); }
              60% { transform: translate(-1.2px, -1.6px); }
              80% { transform: translate(1.4px, 1.0px); }
            }
            /* Planetary Descent & Rope Deployment Keyframes */
            @keyframes rocketArrivalSlideDown {
              0% { transform: translateY(-160px) scale(0.85); opacity: 0; }
              70% { transform: translateY(10px) scale(1.02); opacity: 1; }
              100% { transform: translateY(0px) scale(1); opacity: 1; }
            }
            @keyframes rocketDepartSlideUp {
              0% { transform: translateY(0px) scale(1); opacity: 1; filter: blur(0px); }
              15% { transform: translateY(12px) scale(1.05); opacity: 1; filter: blur(0px); }
              35% { transform: translateY(-160px) scale(0.75); opacity: 0.95; filter: blur(1px); }
              100% { transform: translateY(-1200px) scale(0.06); opacity: 0; filter: blur(8px); }
            }
            @keyframes ropeExtendDown {
              0% { height: 0px; opacity: 0; }
              5% { opacity: 1; }
              100% { height: calc(68vh - 195px); opacity: 1; }
            }
            @keyframes ropeRetractUp {
              0% { height: calc(68vh - 195px); opacity: 1; }
              85% { height: 14px; opacity: 0.85; }
              100% { height: 0px; opacity: 0; }
            }
            @keyframes astronautSlideDownRope {
              0% { top: 195px; opacity: 0; transform: translate(-50%, 0) scale(0.75); }
              8% { top: 205px; opacity: 1; transform: translate(-50%, 0) scale(0.9); }
              100% { top: 68%; opacity: 1; transform: translate(-50%, 0) scale(1); }
            }
            @keyframes cosmicRopeSway {
              0%, 100% { transform: translate3d(0, 0, 0) rotate(0deg); }
              25% { transform: translate3d(-8px, 3px, 0) rotate(-1.5deg); }
              75% { transform: translate3d(8px, 2px, 0) rotate(1.5deg); }
            }
            @keyframes astronautFloatingZeroG {
              0%, 100% { transform: translate3d(0, 0, 0) rotate(0deg); }
              50% { transform: translate3d(0, -8px, 0) rotate(1deg); }
            }
            @keyframes astronautSettledGlow {
              0%, 100% { opacity: 0.45; transform: scale(1); }
              50% { opacity: 0.9; transform: scale(1.18); }
            }
            @keyframes panoramicCosmosGlide {
              0% { transform: scale(1.08) translate3d(0, 0, 0); }
              50% { transform: scale(1.15) translate3d(-18px, -12px, 0); }
              100% { transform: scale(1.08) translate3d(14px, 10px, 0); }
            }
            @keyframes planetAtmosphereGlide {
              0% { transform: scale(1.05) translate3d(0, 0, 0); }
              50% { transform: scale(1.12) translate3d(-20px, -12px, 0); }
              100% { transform: scale(1.05) translate3d(16px, 10px, 0); }
            }
            @keyframes lavaRiverPulse {
              0%, 100% { opacity: 0.5; filter: drop-shadow(0 0 15px #f43f5e) brightness(1); }
              50% { opacity: 0.95; filter: drop-shadow(0 0 35px #ff0055) brightness(1.35); }
            }
            @keyframes heatShimmerWave {
              0%, 100% { transform: scaleY(1) skewX(0deg); opacity: 0.45; }
              50% { transform: scaleY(1.06) skewX(1.5deg); opacity: 0.8; }
            }
            @keyframes oceanCausticPulse {
              0%, 100% { transform: scale(1) translate3d(0, 0, 0); opacity: 0.35; }
              50% { transform: scale(1.1) translate3d(-12px, 6px, 0); opacity: 0.75; }
            }
            @keyframes bubbleFloatUp {
              0% { transform: translate3d(0, 35px, 0) scale(0.8); opacity: 0; }
              25% { opacity: 0.85; }
              80% { opacity: 0.9; }
              100% { transform: translate3d(12px, -50px, 0) scale(1.2); opacity: 0; }
            }
            @keyframes jovianCloudStream {
              0% { transform: translate3d(-6%, 0, 0); }
              50% { transform: translate3d(6%, 0, 0); }
              100% { transform: translate3d(-6%, 0, 0); }
            }
            @keyframes crystalPrismGleam {
              0%, 100% { opacity: 0.35; filter: hue-rotate(0deg) drop-shadow(0 0 10px #10b981); }
              50% { opacity: 0.9; filter: hue-rotate(25deg) drop-shadow(0 0 28px #34d399); }
            }
            @keyframes lunarDustFloat {
              0%, 100% { transform: translate3d(0, 0, 0); opacity: 0.4; }
              50% { transform: translate3d(8px, -12px, 0); opacity: 0.85; }
            }
            @keyframes auroraCurtainDance {
              0%, 100% { transform: scaleY(1.0) skewX(0deg); opacity: 0.45; }
              33% { transform: scaleY(1.22) skewX(3deg); opacity: 0.85; }
              66% { transform: scaleY(1.1) skewX(-2deg); opacity: 0.65; }
            }
            @keyframes livingNebulaSwirl1 {
              0% { transform: scale(1.05) rotate(0deg) translate3d(0, 0, 0); }
              50% { transform: scale(1.18) rotate(180deg) translate3d(-20px, 15px, 0); }
              100% { transform: scale(1.05) rotate(360deg) translate3d(0, 0, 0); }
            }
            @keyframes livingNebulaSwirl2 {
              0% { transform: scale(1.12) rotate(360deg) translate3d(0, 0, 0); }
              50% { transform: scale(0.96) rotate(180deg) translate3d(24px, -18px, 0); }
              100% { transform: scale(1.12) rotate(0deg) translate3d(0, 0, 0); }
            }
            @keyframes livingCosmicPulse {
              0%, 100% { opacity: 0.42; transform: scale(1.0); filter: hue-rotate(0deg); }
              50% { opacity: 0.72; transform: scale(1.08); filter: hue-rotate(18deg); }
            }
            @keyframes godRaysPulse {
              0%, 100% { opacity: 0.12; transform: rotate(0deg) scale(1.0); }
              50% { opacity: 0.28; transform: rotate(3deg) scale(1.06); }
            }
            @keyframes auroraWaveUndulation {
              0%, 100% { transform: scaleY(1.0) translate3d(0, 0, 0); opacity: 0.35; }
              33% { transform: scaleY(1.25) translate3d(-30px, 12px, 0); opacity: 0.65; }
              66% { transform: scaleY(1.12) translate3d(25px, -10px, 0); opacity: 0.48; }
            }
            @keyframes planetLimbRotation {
              0% { transform: translate3d(0, 0, 0); }
              50% { transform: translate3d(-25px, 2px, 0); }
              100% { transform: translate3d(0, 0, 0); }
            }
            @keyframes plasmaArcFlicker {
              0%, 100% { opacity: 0.2; transform: scale(1.0); }
              20% { opacity: 0.85; transform: scale(1.04); }
              40% { opacity: 0.1; }
              60% { opacity: 0.75; transform: scale(0.98); }
              80% { opacity: 0.3; }
            }
            @keyframes solarFlareWave {
              0%, 100% { transform: scale(1.0) rotate(0deg); opacity: 0.45; }
              50% { transform: scale(1.22) rotate(12deg); opacity: 0.85; }
            }
            @keyframes interiorEnvironmentDrift {
              0% { transform: scale(1.06) translate3d(0, 0, 0); }
              33% { transform: scale(1.12) translate3d(-14px, -10px, 0); }
              66% { transform: scale(1.09) translate3d(12px, 8px, 0); }
              100% { transform: scale(1.06) translate3d(0, 0, 0); }
            }
            @keyframes interiorAtmospherePulse {
              0%, 100% { opacity: 0.38; transform: scale(1); }
              50% { opacity: 0.58; transform: scale(1.06); }
            }
            @keyframes liveAuroraSurge {
              0% { transform: scale(1.0) rotate(0deg) translate3d(0, 0, 0); opacity: 0.35; filter: hue-rotate(0deg); }
              33% { transform: scale(1.14) rotate(2deg) translate3d(-18px, 14px, 0); opacity: 0.68; filter: hue-rotate(15deg); }
              66% { transform: scale(1.07) rotate(-2deg) translate3d(18px, -14px, 0); opacity: 0.48; filter: hue-rotate(-15deg); }
              100% { transform: scale(1.0) rotate(0deg) translate3d(0, 0, 0); opacity: 0.35; filter: hue-rotate(0deg); }
            }
            @keyframes cosmicStreamFlow {
              0% { transform: translate3d(-10%, -10%, 0) rotate(-15deg); opacity: 0.2; }
              50% { transform: translate3d(10%, 10%, 0) rotate(-15deg); opacity: 0.65; }
              100% { transform: translate3d(-10%, -10%, 0) rotate(-15deg); opacity: 0.2; }
            }
            @keyframes mineralShardTumble {
              0% { transform: translate3d(0, 0, 0) rotate(0deg); }
              50% { transform: translate3d(-18px, -24px, 0) rotate(180deg); }
              100% { transform: translate3d(0, 0, 0) rotate(360deg); }
            }
            @keyframes hologramOpenFromBottom {
              0% {
                clip-path: polygon(0 100%, 100% 100%, 100% 100%, 0 100%);
                opacity: 0;
                transform: translate(-50%, 25px) scaleY(0.08);
                filter: brightness(2.6) drop-shadow(0 0 35px #22d3ee);
              }
              25% {
                opacity: 1;
                filter: brightness(1.8) drop-shadow(0 0 25px #22d3ee);
              }
              100% {
                clip-path: polygon(0 0, 100% 0, 100% 100%, 0 100%);
                opacity: 1;
                transform: translate(-50%, 0) scaleY(1);
                filter: brightness(1) drop-shadow(0 0 20px rgba(34,211,238,0.35));
              }
            }
            @keyframes hologramCloseToBottom {
              0% {
                clip-path: polygon(0 0, 100% 0, 100% 100%, 0 100%);
                opacity: 1;
                transform: translate(-50%, 0) scaleY(1);
                filter: brightness(1);
              }
              30% {
                filter: brightness(2.2) drop-shadow(0 0 30px #22d3ee);
                opacity: 0.95;
              }
              100% {
                clip-path: polygon(0 100%, 100% 100%, 100% 100%, 0 100%);
                opacity: 0;
                transform: translate(-50%, 25px) scaleY(0.05);
                filter: brightness(3.5) drop-shadow(0 0 50px #22d3ee);
              }
            }
            @keyframes scanlineBeamRise {
              0% { top: 100%; opacity: 1; }
              100% { top: 0%; opacity: 0; }
            }
            @keyframes scanlineBeamSink {
              0% { top: 0%; opacity: 1; }
              100% { top: 100%; opacity: 0; }
            }
            @keyframes transmissionHoloAppear {
              0% { transform: translate(-50%, 0) scale(0.95); opacity: 0; filter: blur(6px); }
              100% { transform: translate(-50%, 0) scale(1); opacity: 1; filter: blur(0px); }
            }
            @keyframes transmissionHoloDisappear {
              0% { transform: translate(-50%, 0) scale(1); opacity: 1; filter: blur(0px); }
              100% { transform: translate(-50%, -10px) scale(0.95); opacity: 0; filter: blur(6px); }
            }
            @keyframes transmissionTimerDrain {
              0% { width: 100%; }
              100% { width: 0%; }
            }
            @keyframes hologramExpand {
              0% { transform: scale(0.85); opacity: 0; filter: blur(12px); }
              100% { transform: scale(1); opacity: 1; filter: blur(0px); }
            }
            @keyframes hologramBeamPulse {
              0%, 100% { opacity: 0.3; transform: scaleX(1); }
              50% { opacity: 0.85; transform: scaleX(1.4); }
            }
            @keyframes hologramWave {
              0%, 100% { transform: scaleY(0.4); opacity: 0.45; }
              50% { transform: scaleY(1.3); opacity: 1; }
            }
            @keyframes spaceRockFloat1 {
              0%, 100% { transform: translate3d(0, 0, 0) rotate(0deg); }
              50% { transform: translate3d(18px, -15px, 0) rotate(180deg); }
            }
            @keyframes spaceRockFloat2 {
              0%, 100% { transform: translate3d(0, 0, 0) rotate(0deg); }
              50% { transform: translate3d(-16px, 12px, 0) rotate(-180deg); }
            }
            @keyframes spaceRockFloat3 {
              0%, 100% { transform: translate3d(0, 0, 0) rotate(0deg); }
              50% { transform: translate3d(12px, 14px, 0) rotate(180deg); }
            }
            /* Gaseous Nebulas Living Drift Keyframes */
            @keyframes nebulaDrift1 {
              0%, 100% { transform: translate3d(0, 0, 0) scale(1) rotate(0deg); opacity: 0.65; }
              50% { transform: translate3d(35px, 20px, 0) scale(1.12) rotate(5deg); opacity: 0.9; }
            }
            @keyframes nebulaDrift2 {
              0%, 100% { transform: translate3d(0, 0, 0) scale(1) rotate(0deg); opacity: 0.6; }
              50% { transform: translate3d(-30px, 25px, 0) scale(1.15) rotate(-6deg); opacity: 0.85; }
            }
            @keyframes nebulaDrift3 {
              0%, 100% { transform: translate3d(0, 0, 0) scale(1); opacity: 0.5; }
              50% { transform: translate3d(20px, -20px, 0) scale(1.08); opacity: 0.8; }
            }
            /* Distant Moon & Asteroid Tumbling Keyframes */
            @keyframes distantMoonDrift {
              0%, 100% { transform: translate3d(0, 0, 0); }
              50% { transform: translate3d(8px, -5px, 0); }
            }
            @keyframes asteroidTumble1 {
              0% { transform: translate3d(0, 0, 0) rotate(0deg); }
              50% { transform: translate3d(30px, -20px, 0) rotate(180deg); }
              100% { transform: translate3d(0, 0, 0) rotate(360deg); }
            }
            @keyframes asteroidTumble2 {
              0% { transform: translate3d(0, 0, 0) rotate(0deg); }
              50% { transform: translate3d(-25px, -18px, 0) rotate(-180deg); }
              100% { transform: translate3d(0, 0, 0) rotate(-360deg); }
            }
            @keyframes asteroidTumble3 {
              0% { transform: translate3d(0, 0, 0) rotate(0deg); }
              50% { transform: translate3d(18px, 25px, 0) rotate(180deg); }
              100% { transform: translate3d(0, 0, 0) rotate(360deg); }
            }
            /* Realistic Occasional Meteors (Synchronized with gentle sound cue) */
            @keyframes meteorStreakFlyA {
              0% { transform: translate3d(0, 0, 0) rotate(-34deg) scale(0.3); opacity: 0; }
              10% { transform: translate3d(-35px, 24px, 0) rotate(-34deg) scale(1); opacity: 1; }
              75% { opacity: 0.92; }
              100% { transform: translate3d(-360px, 245px, 0) rotate(-34deg) scale(0.1); opacity: 0; }
            }
            @keyframes meteorStreakFlyB {
              0% { transform: translate3d(0, 0, 0) rotate(-46deg) scale(0.3); opacity: 0; }
              10% { transform: translate3d(-28px, 30px, 0) rotate(-46deg) scale(1.05); opacity: 1; }
              75% { opacity: 0.95; }
              100% { transform: translate3d(-310px, 325px, 0) rotate(-46deg) scale(0.1); opacity: 0; }
            }
            @keyframes meteorStreakFlyC {
              0% { transform: translate3d(0, 0, 0) rotate(-22deg) scale(0.3); opacity: 0; }
              12% { transform: translate3d(-42px, 16px, 0) rotate(-22deg) scale(0.95); opacity: 1; }
              75% { opacity: 0.9; }
              100% { transform: translate3d(-340px, 135px, 0) rotate(-22deg) scale(0.1); opacity: 0; }
            }
            /* 3D Concentric Keplerian Orbits with 3D Depth, Foreshortening, and Solar Lighting */
            ${generateSolarOrbitKeyframes(MAP_NODES, ORBIT_RINGS, SYSTEM_CENTER)}
            ${generateAsteroidBeltKeyframe(SYSTEM_CENTER)}
          `}</style>

          {/* ========================================================== */}
          {/* MULTI-LAYER LIVING COSMOS (LAYERED DEPTH WITH PARALLAX)    */}
          {/* ========================================================== */}

          {/* LAYER 1: DEEP PARALLAX PLANE (Nebulas, Micro-Stars, Distant Moon) */}
          <div 
            className="absolute inset-0 pointer-events-none overflow-hidden z-0 transition-transform duration-500 ease-out will-change-transform"
            style={{
              transform: `translate3d(${parallaxOffset.x * -9}px, ${parallaxOffset.y * -9}px, 0)`
            }}
          >
            {/* High-Definition Living Cosmic Nebula Canvas */}
            <div 
              className="absolute inset-[-12%] w-[124%] h-[124%] pointer-events-none opacity-30 mix-blend-screen"
              style={{
                backgroundImage: `url(${vibrantCinematicSpaceNebula})`,
                backgroundSize: 'cover',
                backgroundPosition: 'center',
                animation: 'deepNebulaPulse 32s ease-in-out infinite'
              }}
            />

            {/* Gaseous Deep Nebulas Moving Ultra-Slowly */}
            <div 
              className="absolute -top-[12%] -left-[12%] w-[60%] h-[60%] rounded-full bg-emerald-600/12 blur-[130px]" 
              style={{ animation: "nebulaDrift1 55s ease-in-out infinite" }} 
            />
            <div 
              className="absolute top-[28%] -right-[12%] w-[55%] h-[55%] rounded-full bg-teal-600/12 blur-[140px]" 
              style={{ animation: "nebulaDrift2 68s ease-in-out infinite", animationDelay: "4s" }} 
            />
            <div 
              className="absolute -bottom-[12%] left-[22%] w-[65%] h-[50%] rounded-full bg-cyan-950/30 blur-[130px]" 
              style={{ animation: "nebulaDrift3 45s ease-in-out infinite", animationDelay: "2s" }} 
            />

            {/* Distant Micro Dwarf Moon Silhouette with Emerald Crescent Light */}
            <div 
              className="absolute pointer-events-none rounded-full"
              style={{
                top: "14%",
                left: "8%",
                width: "24px",
                height: "24px",
                background: "radial-gradient(circle at 35% 35%, #0f272a 0%, #031014 90%)",
                boxShadow: "inset -2px -2px 6px rgba(45,212,191,0.55), 0 0 12px rgba(6,78,59,0.35)",
                animation: "distantMoonDrift 70s ease-in-out infinite"
              }}
            />

            {/* Deep Microscopic Stars (25 stars, slow twinkle & micro drift) */}
            <div className="absolute inset-0" style={{ animation: "deepStarsSlowDrift 140s linear infinite" }}>
              {DEEP_STARS.map((star, idx) => (
                <div
                  key={`deep-star-${idx}`}
                  className="absolute rounded-full bg-cyan-100"
                  style={{
                    left: `${star.x}%`,
                    top: `${star.y}%`,
                    width: `${star.size}px`,
                    height: `${star.size}px`,
                    animation: `starCalmBreathe ${star.duration}s ease-in-out infinite`,
                    animationDelay: `${star.delay}s`,
                    opacity: 0.55
                  }}
                />
              ))}
            </div>
          </div>

          {/* LAYER 2: MID PARALLAX PLANE (Cosmic Dust, Distant Asteroids, Mid Stars) */}
          <div 
            className="absolute inset-0 pointer-events-none overflow-hidden z-0 transition-transform duration-500 ease-out will-change-transform"
            style={{
              transform: `translate3d(${parallaxOffset.x * -18}px, ${parallaxOffset.y * -18}px, 0)`
            }}
          >
            {/* Drifting Space Stardust */}
            {COSMIC_DUST.map((dust, idx) => (
              <div
                key={`dust-${idx}`}
                className="absolute rounded-full bg-cyan-200/40 blur-[0.6px] pointer-events-none"
                style={{
                  left: `${dust.x}%`,
                  top: `${dust.y}%`,
                  width: `${dust.size * 2}px`,
                  height: `${dust.size * 2}px`,
                  animation: `cosmicDustDrift ${dust.duration}s ease-in-out infinite`,
                  animationDelay: `${dust.delay}s`
                }}
              />
            ))}

            {/* Distant Tumbling Asteroids */}
            {DISTANT_ASTEROIDS.map((ast) => (
              <div
                key={`ast-${ast.id}`}
                className="absolute pointer-events-none rounded-[40%_60%_70%_30%/40%_50%_60%_50%] bg-[#082026] border border-cyan-800/30 opacity-60 shadow-[0_0_8px_rgba(6,78,59,0.4)]"
                style={{
                  left: `${ast.x}%`,
                  top: `${ast.y}%`,
                  width: `${ast.size}px`,
                  height: `${ast.size * 0.85}px`,
                  animation: `${ast.animationName} ${ast.duration}s linear infinite`
                }}
              />
            ))}

            {/* Mid Layer Breathing & Diamond Stars */}
            {MID_STARS.map((star, idx) => (
              <div
                key={`mid-star-${idx}`}
                className="absolute flex items-center justify-center pointer-events-none"
                style={{
                  left: `${star.x}%`,
                  top: `${star.y}%`,
                  width: `${star.size * 3.5}px`,
                  height: `${star.size * 3.5}px`,
                  transform: "translate(-50%, -50%)"
                }}
              >
                {star.isDiamond ? (
                  <div 
                    className="w-full h-full relative flex items-center justify-center"
                    style={{
                      animation: `diamondGlint ${star.duration}s ease-in-out infinite`,
                      animationDelay: `${star.delay}s`
                    }}
                  >
                    <div className="absolute w-[1px] h-full bg-cyan-200/90 shadow-[0_0_5px_#22d3ee]" />
                    <div className="absolute h-[1px] w-full bg-cyan-200/90 shadow-[0_0_5px_#22d3ee]" />
                    <div className="w-1.5 h-1.5 rounded-full bg-white shadow-[0_0_6px_#ffffff]" />
                  </div>
                ) : (
                  <div 
                    className="rounded-full bg-cyan-100 shadow-[0_0_6px_rgba(34,211,238,0.7)]"
                    style={{
                      width: `${star.size}px`,
                      height: `${star.size}px`,
                      animation: `starCalmBreathe ${star.duration}s ease-in-out infinite`,
                      animationDelay: `${star.delay}s`
                    }}
                  />
                )}
              </div>
            ))}
          </div>

          {/* LAYER 3: NEAR PARALLAX PLANE (Realistic Occasional Meteors) */}
          <div 
            className="absolute inset-0 pointer-events-none overflow-hidden z-0 transition-transform duration-500 ease-out will-change-transform"
            style={{
              transform: `translate3d(${parallaxOffset.x * -28}px, ${parallaxOffset.y * -28}px, 0)`
            }}
          >
            {/* Dynamic Synchronized Meteors with Gentle Audio Cue */}
            {activeMeteors.map((meteor) => (
              <div
                key={meteor.id}
                className="absolute pointer-events-none"
                style={{
                  top: `${meteor.startY}%`,
                  right: `${100 - meteor.startX}%`,
                  width: `${meteor.length}px`,
                  height: "2px",
                  background: "linear-gradient(to right, rgba(255,255,255,0.98), rgba(241,245,249,0.85) 30%, rgba(148,163,184,0.35) 70%, transparent 100%)",
                  filter: "drop-shadow(0 0 6px rgba(255,255,255,0.95)) drop-shadow(0 0 10px rgba(186,230,253,0.5))",
                  borderRadius: "9999px",
                  animation: `${meteor.anim} ${meteor.duration}s cubic-bezier(0.2, 0.8, 0.4, 1) forwards`
                }}
              >
                {/* Glowing Diamond Core Head of the Meteor */}
                <div className="absolute left-0 top-1/2 -translate-y-1/2 w-2 h-2 rounded-full bg-white shadow-[0_0_8px_#ffffff,0_0_14px_#bae6fd]" />
              </div>
            ))}
          </div>

          {/* LAYER 4: NEAR-FIELD 3D FLOATING COSMIC MOTES (Stereoscopic Viewport Depth) */}
          <div 
            className="absolute inset-0 pointer-events-none overflow-hidden z-10 transition-transform duration-500 ease-out will-change-transform"
            style={{
              transform: `translate3d(${parallaxOffset.x * -42}px, ${parallaxOffset.y * -42}px, 0)`
            }}
          >
            {FOREGROUND_COSMIC_MOTES.map((mote, idx) => (
              <div
                key={`fg-mote-${idx}`}
                className="absolute rounded-full pointer-events-none"
                style={{
                  left: `${mote.x}%`,
                  top: `${mote.y}%`,
                  width: `${mote.size}px`,
                  height: `${mote.size}px`,
                  background: "radial-gradient(circle, rgba(165,243,252,0.85) 0%, rgba(34,211,238,0.4) 45%, transparent 75%)",
                  filter: `blur(${mote.blur}px)`,
                  animation: `floatingSpaceMote ${mote.duration}s ease-in-out infinite`,
                  animationDelay: `${mote.delay}s`
                }}
              />
            ))}
          </div>

          {/* Sound Control Button: Anchored at Bottom-Left with Cosmic Ambient Pulse Indicator */}
          <button 
            onClick={() => {
              const m = !isMuted;
              setIsMuted(m);
              audio.toggleMute(m);
            }} 
            className="fixed bottom-6 left-6 z-40 w-11 h-11 rounded-full bg-slate-950/80 border border-cyan-400/40 flex items-center justify-center text-cyan-300 hover:text-white transition-all shadow-[0_0_20px_rgba(6,182,212,0.4)] backdrop-blur-md hover:scale-105 active:scale-95 cursor-pointer group"
            title={isMuted ? "تشغيل الصوت والرنين الكوني" : "كتم الصوت"}
          >
            {isMuted ? (
              <VolumeX size={20} />
            ) : (
              <div className="relative flex items-center justify-center">
                <Volume2 size={20} />
                <span className="absolute -top-1 -right-1 w-2 h-2 rounded-full bg-cyan-400 animate-ping opacity-75" />
              </div>
            )}
          </button>

          {/* Top-Left Exit/Back Platform Button */}
          <button 
            onClick={() => {
              if (onBack) onBack();
            }}
            className="fixed top-6 left-6 z-40 w-11 h-11 rounded-full bg-slate-950/80 border border-cyan-400/40 flex items-center justify-center text-cyan-200 hover:text-white hover:border-cyan-300 transition-all shadow-[0_0_20px_rgba(6,182,212,0.4)] backdrop-blur-md hover:scale-105 active:scale-95 cursor-pointer"
            title="خروج للمنصة"
          >
            <ArrowLeft size={20} />
          </button>

          {/* FULL-SCREEN 3D CONCENTRIC SOLAR SYSTEM STAGE */}
          <div id="solar-system-container" className="absolute inset-0 w-full h-full overflow-hidden">
              
              {/* Cosmic Spiral Galaxy in Distant Upper Background (Matching Reference Visual) */}
              <div 
                className="absolute pointer-events-none opacity-40 mix-blend-screen will-change-transform"
                style={{
                  left: "50%",
                  top: "14%",
                  transform: "translate(-50%, -50%) rotate(22deg)",
                  width: "320px",
                  height: "180px",
                  background: "radial-gradient(ellipse at center, rgba(168,85,247,0.35) 0%, rgba(34,211,238,0.2) 35%, rgba(6,78,59,0.12) 65%, transparent 80%)",
                  filter: "blur(18px)"
                }}
              />

              {/* SVG 3D CONCENTRIC ORBITAL RINGS & GUIDANCE BEAM */}
              <svg className="absolute inset-0 w-full h-full pointer-events-none" viewBox="0 0 100 100" preserveAspectRatio="none">
                <defs>
                  <filter id="activeOrbitGlow" x="-30%" y="-30%" width="160%" height="160%">
                    <feGaussianBlur stdDeviation="0.6" result="blur" />
                    <feComposite in="SourceGraphic" in2="blur" operator="over" />
                  </filter>
                  <filter id="glowTrajectory" x="-30%" y="-30%" width="160%" height="160%">
                    <feGaussianBlur stdDeviation="0.6" result="blur" />
                    <feComposite in="SourceGraphic" in2="blur" operator="over" />
                  </filter>
                  {/* Professional Astronomical Ephemeris Gradients: Starlight Platinum & Slate Depth */}
                  <linearGradient id="orbitRearFrontGrad" x1="0%" y1="0%" x2="0%" y2="100%">
                    <stop offset="0%" stopColor="#94a3b8" stopOpacity="0.08" />
                    <stop offset="50%" stopColor="#cbd5e1" stopOpacity="0.22" />
                    <stop offset="100%" stopColor="#f8fafc" stopOpacity="0.48" />
                  </linearGradient>
                  <linearGradient id="activeOrbitGrad" x1="0%" y1="0%" x2="0%" y2="100%">
                    <stop offset="0%" stopColor="#94a3b8" stopOpacity="0.25" />
                    <stop offset="45%" stopColor="#e2e8f0" stopOpacity="0.75" />
                    <stop offset="100%" stopColor="#ffffff" stopOpacity="0.98" />
                  </linearGradient>
                  <linearGradient id="beamGradient" x1="0%" y1="100%" x2="0%" y2="0%">
                    <stop offset="0%" stopColor="#cbd5e1" stopOpacity="0.2" />
                    <stop offset="60%" stopColor="#e2e8f0" stopOpacity="0.65" />
                    <stop offset="100%" stopColor="#ffffff" stopOpacity="0.95" />
                  </linearGradient>
                </defs>

                {/* The 5 Concentric 3D Perspective Elliptical Orbit Rings (True Astronomical Ephemeris Tracks) */}
                {ORBIT_RINGS.map((ring) => {
                  const isRingActive = activeTargetNode && activeTargetNode.orbitIndex === ring.index;
                  return (
                    <g key={ring.index}>
                      {/* Active Orbital Target Radiant Luminous Starlight Track */}
                      {isRingActive && (
                        <>
                          {/* Soft Outer Starlight Halo */}
                          <ellipse
                            cx={SYSTEM_CENTER.x}
                            cy={SYSTEM_CENTER.y}
                            rx={ring.rx}
                            ry={ring.ry}
                            fill="none"
                            stroke="url(#activeOrbitGrad)"
                            strokeWidth="0.42"
                            filter="url(#activeOrbitGlow)"
                            opacity="0.85"
                          />
                          {/* Inner Precision Starlight Hairline */}
                          <ellipse
                            cx={SYSTEM_CENTER.x}
                            cy={SYSTEM_CENTER.y}
                            rx={ring.rx}
                            ry={ring.ry}
                            fill="none"
                            stroke="#ffffff"
                            strokeWidth="0.2"
                            opacity="0.95"
                          />
                        </>
                      )}

                      {/* Continuous Ultra-Fine Gravitational Hairline (Subtle Depth Gradient) */}
                      <ellipse
                        cx={SYSTEM_CENTER.x}
                        cy={SYSTEM_CENTER.y}
                        rx={ring.rx}
                        ry={ring.ry}
                        fill="none"
                        stroke={isRingActive ? "transparent" : "url(#orbitRearFrontGrad)"}
                        strokeWidth="0.10"
                        opacity={isRingActive ? 0 : 0.55}
                      />

                      {/* Precision Astronomical Segmented Ephemeris Track (Observatory Instrument Aesthetic) */}
                      {!isRingActive && (
                        <ellipse
                          cx={SYSTEM_CENTER.x}
                          cy={SYSTEM_CENTER.y}
                          rx={ring.rx}
                          ry={ring.ry}
                          fill="none"
                          stroke="url(#orbitRearFrontGrad)"
                          strokeWidth="0.13"
                          strokeDasharray="1.6 2.6"
                          opacity="0.75"
                        />
                      )}
                    </g>
                  );
                })}

                {/* Elegant Starlight Navigation Trajectory Vector to Target Planet */}
                <path
                  d={trajectoryPath.svgD}
                  fill="none"
                  stroke="url(#beamGradient)"
                  strokeWidth="0.38"
                  filter="url(#glowTrajectory)"
                  strokeDasharray="0.9 1.6"
                  className={isRocketFlying ? "opacity-95" : "opacity-60 animate-pulse"}
                />

                {/* Starlight Trajectory Navigation Waypoint Dots */}
                {trajectoryPath.dots.map((dot, i) => (
                  <circle
                    key={i}
                    cx={dot.x}
                    cy={dot.y}
                    r={i % 2 === 0 ? "0.38" : "0.26"}
                    fill={i === trajectoryPath.dots.length - 1 ? "#ffffff" : "#f1f5f9"}
                    stroke="#94a3b8"
                    strokeWidth="0.06"
                    filter="url(#glowTrajectory)"
                    opacity={isRocketFlying ? 0.95 : 0.65}
                  />
                ))}
              </svg>

              {/* ASTEROID BELT: Real Drifting Space Rocks between Orbit 1 & Orbit 2 */}
              <div className="absolute inset-0 pointer-events-none">
                {ASTEROID_BELT_NODES.map((ast) => {
                  const rad = (ast.angle * Math.PI) / 180;
                  const initialX = SYSTEM_CENTER.x + 24.5 * Math.cos(rad);
                  const initialY = SYSTEM_CENTER.y + 14.6 * Math.sin(rad);
                  return (
                    <div
                      key={ast.id}
                      className="absolute rounded-full bg-gradient-to-br from-slate-300 via-slate-500 to-slate-800 shadow-[0_0_6px_rgba(255,255,255,0.4)]"
                      style={{
                        left: `${initialX}%`,
                        top: `${initialY}%`,
                        width: `${ast.size}px`,
                        height: `${ast.size * 0.8}px`,
                        animation: `orbit_asteroid_belt 52s linear infinite`,
                        animationDelay: `-${(ast.angle / 360) * 52}s`,
                        transform: "translate(-50%, -50%) rotate(25deg)"
                      }}
                    />
                  );
                })}
              </div>

              {/* CENTRAL ASTRONOMICAL CORE (Majestic Living Photorealistic Sun Star) */}
              <div 
                className="absolute pointer-events-none flex items-center justify-center select-none"
                style={{
                  left: `${SYSTEM_CENTER.x}%`,
                  top: `${SYSTEM_CENTER.y}%`,
                  transform: "translate(-50%, -50%)",
                  zIndex: 15
                }}
              >
                {/* Outer Deep Solar Radiation Halo */}
                <div 
                  className="absolute w-64 h-64 md:w-80 md:h-80 rounded-full bg-gradient-to-r from-amber-500/20 via-orange-500/15 to-yellow-600/10 blur-[40px] animate-pulse pointer-events-none" 
                  style={{ animationDuration: '5.5s' }} 
                />
                
                {/* Active Coronal Loops Plasma Radiance */}
                <div 
                  className="absolute w-40 h-40 md:w-48 md:h-48 rounded-full bg-gradient-to-r from-yellow-300/35 via-amber-400/28 to-orange-600/22 blur-[20px] pointer-events-none animate-spin"
                  style={{ animationDuration: '40s' }}
                />

                {/* Anamorphic Horizontal Lens Flare Streak (Photorealistic Astronomical Cinema) */}
                <div 
                  className="absolute h-[1.5px] w-[260px] md:w-[380px] pointer-events-none opacity-85"
                  style={{
                    background: "linear-gradient(90deg, transparent 0%, rgba(254,240,138,0.2) 20%, rgba(255,255,255,0.95) 50%, rgba(254,240,138,0.2) 80%, transparent 100%)",
                    boxShadow: "0 0 10px rgba(253, 224, 71, 0.8), 0 0 20px rgba(245, 158, 11, 0.5)"
                  }}
                />

                {/* 4-Point Subtle Diffraction Star Ray */}
                <div 
                  className="absolute w-[1.5px] h-[150px] md:h-[200px] pointer-events-none opacity-65"
                  style={{
                    background: "linear-gradient(180deg, transparent 0%, rgba(254,240,138,0.3) 25%, rgba(255,255,255,0.9) 50%, rgba(254,240,138,0.3) 75%, transparent 100%)",
                    boxShadow: "0 0 8px rgba(253, 224, 71, 0.7)"
                  }}
                />

                {/* Turbulent Solar Prominences Ejection Arc (Breathing Plasma Rim) */}
                <div 
                  className="absolute w-18 h-18 md:w-22 md:h-22 rounded-full border-2 border-amber-300/35 blur-[1px] animate-ping pointer-events-none"
                  style={{ animationDuration: '3.6s' }}
                />

                {/* Photorealistic Spherical Solar Photosphere Body */}
                <div 
                  className="w-13 h-13 md:w-16 md:h-16 rounded-full relative overflow-hidden shadow-[0_0_32px_#f59e0b,0_0_65px_#ea580c,0_0_100px_rgba(234,88,12,0.4),inset_0_0_18px_#ffffff]"
                  style={{
                    background: "radial-gradient(circle at 40% 40%, #ffffff 0%, #fef08a 25%, #f59e0b 60%, #b45309 85%, #78350f 100%)"
                  }}
                >
                  {/* Real Granular NASA Photosphere Surface with Organic Convective Boiling Motion */}
                  <img 
                    src={realisticSunStar} 
                    alt="الشمس الفلكية"
                    className="absolute inset-[-15%] w-[130%] h-[130%] object-cover mix-blend-screen scale-110 pointer-events-none"
                    style={{
                      animation: "sunSurfaceSpin 50s linear infinite",
                      filter: "contrast(1.3) brightness(1.2)"
                    }}
                  />

                  {/* Incandescent Thermonuclear White-Hot Flare Core */}
                  <div 
                    className="absolute inset-0 rounded-full pointer-events-none"
                    style={{
                      background: "radial-gradient(circle at 38% 38%, rgba(255,255,255,0.95) 0%, rgba(254,240,138,0.7) 30%, transparent 68%)"
                    }}
                  />

                  {/* Astrophysical Limb Darkening at Perimeter */}
                  <div 
                    className="absolute inset-0 rounded-full pointer-events-none"
                    style={{
                      background: "radial-gradient(circle, transparent 58%, rgba(180,83,9,0.5) 82%, rgba(120,53,15,0.95) 100%)",
                      boxShadow: "inset 0 0 14px rgba(255,255,255,0.7)"
                    }}
                  />
                </div>
              </div>

              {/* RENDER THE 10 REALISTIC 3D CELESTIAL PLANETS (Continuous Keplerian Orbits - Never Freezes on Hover) */}
              {MAP_NODES.map((node) => {
                const isSelected = node.id === currentPlanetId;
                const isHovered = node.id === hoveredPlanetId;
                const proximityScale = planetProximityScales[node.id] || 1.0;
                const userFocusScale = isSelected ? 1.15 : isHovered ? 1.08 : 1.0;
                const dynamicPlanetScale = (proximityScale * userFocusScale).toFixed(3);

                return (
                  <div
                    key={node.id}
                    id={`planet-node-${node.id}`}
                    style={{
                      left: `${node.x}%`,
                      top: `${node.y}%`,
                      animation: `orbit_planet_${node.id} ${node.orbitPeriod}s linear infinite`,
                      animationPlayState: "running",
                      willChange: "transform, left, top",
                      position: "absolute"
                    }}
                    onPointerEnter={() => setHoveredPlanetId(node.id)}
                    onPointerLeave={() => setHoveredPlanetId(null)}
                    onClick={() => {
                      // ONE CLICK = SELECT + LAUNCH
                      handleLaunchToPlanetWithArcPhysics(node.id);
                    }}
                    className="flex flex-col items-center cursor-pointer group select-none"
                  >
                    {/* Floating 3D Planet Sphere with Dynamic Rocket Distance Scaling & Natural Easing */}
                    <div 
                      className="relative flex items-center justify-center will-change-transform"
                      style={{ 
                        width: `${node.baseSize}px`, 
                        height: `${node.baseSize}px`,
                        transform: `scale(${dynamicPlanetScale})`,
                        transition: "transform 0.18s cubic-bezier(0.2, 0.8, 0.4, 1)"
                      }}
                    >
                      {/* Soft Natural Atmospheric Corona Halo when Selected (Zero geometric clutter) */}
                      {isSelected && (
                        <div 
                          className="absolute -inset-3.5 rounded-full pointer-events-none transition-all duration-500"
                          style={{
                            background: "radial-gradient(circle, rgba(34,211,238,0.45) 0%, rgba(6,182,212,0.18) 60%, transparent 80%)",
                            boxShadow: "0 0 24px rgba(34,211,238,0.6)"
                          }}
                        />
                      )}

                      {/* Planet Atmospheric Ambient Glow */}
                      <div 
                        className="absolute -inset-2.5 rounded-full pointer-events-none transition-opacity duration-300"
                        style={{
                          background: `radial-gradient(circle, ${node.glowColor} 0%, transparent 72%)`,
                          opacity: isSelected ? 0.95 : isHovered ? 0.8 : 0.45
                        }}
                      />

                      {/* Photorealistic 3D Circular Planet Sphere - Zero Geometric Outline Rings */}
                      <div 
                        className="w-full h-full rounded-full relative overflow-hidden transition-all duration-300 shadow-[0_0_16px_rgba(0,0,0,0.85)]"
                        style={{ 
                          boxShadow: isSelected 
                            ? `0 0 32px ${node.glowColor}, inset 0 0 18px rgba(255,255,255,0.45)` 
                            : isHovered 
                            ? `0 0 24px ${node.glowColor}, inset 0 0 12px rgba(255,255,255,0.3)` 
                            : `0 0 14px ${node.glowColor}99`,
                          filter: isHovered || isSelected ? "brightness(1.18) contrast(1.08)" : "none"
                        }}
                      >
                        {/* Inner Rotating Planetary Surface (Continuous Smooth Spin) */}
                        <div 
                          className="absolute inset-[-45%] w-[190%] h-[190%] flex items-center justify-center pointer-events-none"
                          style={{
                            animation: `planetSelfSpin ${node.rotationDuration}s linear infinite`,
                            animationPlayState: "running"
                          }}
                        >
                          <img 
                            src={node.img} 
                            alt={node.name}
                            className="w-full h-full object-cover scale-125"
                            style={{ filter: "contrast(1.1) brightness(1.04)" }}
                          />
                        </div>

                        {/* Fixed 3D Terminator Curved Astronomical Shadow (Facing Central Star) */}
                        <div 
                          className="absolute inset-0 rounded-full pointer-events-none"
                          style={{
                            background: "radial-gradient(circle at 35% 35%, transparent 40%, rgba(2,18,24,0.55) 75%, rgba(1,10,15,0.96) 100%)"
                          }}
                        />

                        {/* Rayleigh Atmospheric Limb Glow / Corona Light */}
                        <div 
                          className="absolute inset-0 rounded-full pointer-events-none"
                          style={{
                            boxShadow: "inset 0 0 14px rgba(255,255,255,0.4), inset -4px -4px 18px rgba(0,0,0,0.6)"
                          }}
                        />
                      </div>
                    </div>

                    {/* Planet Arabic Name Label (Floating Natural Typography - Zero Geometric Enclosures) */}
                    <div className="mt-1.5 flex flex-col items-center pointer-events-none">
                      <span className={`font-bold text-xs md:text-sm tracking-wide transition-all duration-300 drop-shadow-[0_2px_8px_rgba(0,0,0,0.95)] ${
                        isSelected
                          ? "text-cyan-200 scale-110 drop-shadow-[0_0_12px_rgba(34,211,238,0.9)]"
                          : isHovered
                          ? "text-white scale-105"
                          : "text-cyan-100/90"
                      }`}>
                        {node.name}
                      </span>
                    </div>
                  </div>
                );
              })}

              {/* CINEMATIC PHOTOREALISTIC 3D SCI-FI SPACECRAFT (FLOATING IN DEEP TURQUOISE SPACE - ZERO BLACK FRAMES) */}
              <div 
                style={{
                  left: `${rocketPos.x}%`,
                  top: `${rocketPos.y}%`,
                  transform: `translate(-50%, -50%) rotate(${isRocketFlying ? rocketAngle : idleRocketAngle}deg) scale(${
                    (isIgniting ? 1.06 : 1.0) * (0.75 + (rocketPos.y / 100) * 0.35)
                  })`,
                  transition: isRocketFlying ? "none" : isIgniting ? "transform 0.06s ease-in-out" : "transform 0.65s cubic-bezier(0.2, 0.8, 0.3, 1)"
                }}
                className="absolute z-30 pointer-events-auto cursor-pointer will-change-transform"
                onClick={() => handleLaunchToPlanetWithArcPhysics(currentPlanetId)}
              >
                <div 
                  className="relative w-20 h-44 md:w-24 md:h-52 flex flex-col items-center select-none"
                  style={{
                    animation: !isRocketFlying ? "rocketIdleZeroG 4.2s ease-in-out infinite" : "none"
                  }}
                >
                  {/* Volumetric Gas Vapor & Plasma Shockwave on Launch Ignition */}
                  {(isIgniting || isRocketFlying) && (
                    <div className="absolute top-[84%] left-1/2 -translate-x-1/2 pointer-events-none w-44 h-36 flex items-center justify-center overflow-visible">
                      {/* Expanding Shockwave Ring */}
                      {isIgniting && (
                        <div className="absolute w-20 h-10 rounded-full border border-cyan-300/80 animate-ping" style={{ animationDuration: '0.6s' }} />
                      )}
                      
                      {/* Volumetric Smoke Clouds */}
                      {[
                        { x: -18, y: 6, size: 28, delay: 0 },
                        { x: 18, y: 10, size: 30, delay: 0.08 },
                        { x: 0, y: 14, size: 36, delay: 0.04 },
                        { x: -24, y: 20, size: 32, delay: 0.12 },
                        { x: 22, y: 22, size: 34, delay: 0.16 }
                      ].map((puff, idx) => (
                        <div
                          key={`vapor-${idx}`}
                          className="absolute rounded-full"
                          style={{
                            left: `calc(50% + ${puff.x}px)`,
                            top: `${puff.y}px`,
                            width: `${puff.size}px`,
                            height: `${puff.size * 0.72}px`,
                            background: "radial-gradient(circle, rgba(148, 163, 184, 0.45) 0%, rgba(34, 211, 238, 0.22) 40%, transparent 75%)",
                            filter: "blur(6px)",
                            animation: `launchVaporPuff 0.65s cubic-bezier(0.2, 0.8, 0.4, 1) infinite`,
                            animationDelay: `${puff.delay}s`
                          }}
                        />
                      ))}

                      {/* Fast Ejected Spark Particles */}
                      {[
                        { tx: -26, ty: 44, d: 0.02 },
                        { tx: 24, ty: 48, d: 0.07 },
                        { tx: -12, ty: 50, d: 0.12 },
                        { tx: 10, ty: 54, d: 0.05 },
                        { tx: -18, ty: 58, d: 0.15 },
                        { tx: 16, ty: 56, d: 0.18 }
                      ].map((sp, i) => (
                        <div
                          key={`spark-${i}`}
                          className="absolute w-1.5 h-1.5 rounded-full bg-white shadow-[0_0_6px_#67e8f9]"
                          style={{
                            left: "50%",
                            top: "8px",
                            "--tx": `${sp.tx}px`,
                            "--ty": `${sp.ty}px`,
                            animation: `launchSparkEject 0.45s ease-out infinite`,
                            animationDelay: `${sp.d}s`
                          } as React.CSSProperties}
                        />
                      ))}
                    </div>
                  )}

                  {/* Micro Exhaust Particles in Idle Mode */}
                  {!isRocketFlying && !isIgniting && (
                    <div className="absolute top-[82%] left-1/2 -translate-x-1/2 pointer-events-none flex justify-center">
                      {[0, 1, 2, 3].map((p) => (
                        <div
                          key={p}
                          className="absolute w-1.5 h-1.5 rounded-full bg-cyan-300 shadow-[0_0_8px_#22d3ee]"
                          style={{
                            left: `${(p - 1.5) * 8}px`,
                            animation: `exhaustParticleDrift ${1.2 + p * 0.3}s ease-out infinite`,
                            animationDelay: `${p * 0.25}s`
                          }}
                        />
                      ))}
                    </div>
                  )}

                  {/* Authentic Retro Space Exploration Rocket with Cute Astronaut in Glass Dome Cockpit */}
                  <div className="relative w-full h-full flex flex-col items-center justify-center pointer-events-none">
                    <img 
                      src={retroAstronautRocket} 
                      alt="صاروخ نحو الفضاء برائد الفضاء" 
                      referrerPolicy="no-referrer"
                      className="w-full h-full object-contain filter drop-shadow-[0_12px_32px_rgba(4,38,48,0.95)] drop-shadow-[0_0_20px_rgba(34,211,238,0.28)] pointer-events-none"
                    />

                    {/* Volumetric Dual Supersonic Plasma Thruster Jets */}
                    {isRocketFlying || isIgniting ? (
                      <div className="absolute top-[83%] left-1/2 -translate-x-1/2 flex items-center justify-center pointer-events-none w-28">
                        {/* Main Center Thrust Jet Plume */}
                        <div 
                          className="w-5 h-22 bg-gradient-to-b from-white via-cyan-300 to-transparent blur-[1px] rounded-full animate-pulse"
                          style={{ transformOrigin: "top center", animationDuration: "0.08s" }}
                        />
                        {/* Left Booster Plume */}
                        <div 
                          className="absolute left-3 top-1 w-3.5 h-16 bg-gradient-to-b from-cyan-100 via-cyan-400 to-transparent blur-[1.2px] rounded-full"
                          style={{ transformOrigin: "top center" }}
                        />
                        {/* Right Booster Plume */}
                        <div 
                          className="absolute right-3 top-1 w-3.5 h-16 bg-gradient-to-b from-cyan-100 via-cyan-400 to-transparent blur-[1.2px] rounded-full"
                          style={{ transformOrigin: "top center" }}
                        />
                        {/* Volumetric Supersonic Mach Aura */}
                        <div className="absolute top-2 w-16 h-28 bg-cyan-400/35 blur-xl rounded-full" />
                      </div>
                    ) : (
                      /* Zero-G Idle Ion Micro-Glow */
                      <div className="absolute top-[85%] left-1/2 -translate-x-1/2 flex items-center justify-center pointer-events-none">
                        <div className="w-4 h-6 bg-cyan-300/80 blur-[2.5px] rounded-full animate-pulse" />
                        <div className="absolute -left-3 top-1 w-2.5 h-4 bg-cyan-400/60 blur-[2px] rounded-full" />
                        <div className="absolute -right-3 top-1 w-2.5 h-4 bg-cyan-400/60 blur-[2px] rounded-full" />
                      </div>
                    )}
                  </div>
                </div>
              </div>

            </div>

          </div>
        )}

      {/* ============================================================== */}
      {/* 2. صفحة الكوكب المحددة والمهمة الفضائية (Planet Screen & Mission) */}
      {/* ============================================================== */}
      {screen === "flight" && currentChallenge && currentPlanetAtmosphere && (
        <div 
          className="relative w-full h-screen overflow-hidden flex flex-col items-center justify-between select-none"
          style={{ background: currentPlanetAtmosphere.skyGradient }}
          dir="rtl"
        >
          {/* 1. CINEMATIC PHOTOREALISTIC DYNAMIC PLANETARY LANDSCAPE (Perceptible zero-G camera drift) */}
          <div 
            className="absolute inset-[-8%] bg-cover bg-center pointer-events-none transition-all duration-700 z-0 will-change-transform filter brightness-95 contrast-110"
            style={{ 
              backgroundImage: `url(${currentPlanetAtmosphere.interiorLandscapeImg})`,
              animation: "planetAtmosphereGlide 18s ease-in-out infinite alternate"
            }}
          />

          {/* 2. DYNAMIC CELESTIAL VOLUMETRIC NEBULA & ATMOSPHERE (Pulsing living planetary gases) */}
          <div 
            className="absolute inset-[-12%] pointer-events-none mix-blend-screen opacity-45 z-0 will-change-transform"
            style={{
              background: `radial-gradient(ellipse at 35% 25%, ${currentPlanetAtmosphere.accentNeon}66 0%, transparent 60%), radial-gradient(ellipse at 65% 75%, ${currentPlanetAtmosphere.ambientColor}55 0%, transparent 65%)`,
              animation: "livingNebulaSwirl1 36s linear infinite"
            }}
          />

          {/* 3. DYNAMIC PLANETARY STARDUST & ION PARTICLE STREAM */}
          <div 
            className="absolute inset-[-15%] pointer-events-none opacity-35 mix-blend-screen z-0"
            style={{
              backgroundImage: `radial-gradient(1.5px 1.5px at 20px 30px, ${currentPlanetAtmosphere.accentNeon}, rgba(0,0,0,0)), radial-gradient(2px 2px at 60px 90px, #ffffff, rgba(0,0,0,0))`,
              backgroundSize: "85px 85px",
              animation: "cosmicStreamFlow 10s linear infinite"
            }}
          />

          {/* 4. DEDICATED DISTINCTIVE LIVING PLANETARY PHENOMENON ENVIRONMENT PER PLANET */}
          <div className="absolute inset-0 pointer-events-none z-0 overflow-hidden select-none">
            {/* ===================== كوكب الهمزات (بركاني ناري) ===================== */}
            {currentPlanetAtmosphere.id === "hamza" && (
              <div className="absolute inset-0 pointer-events-none">
                {/* Active Glowing Lava Fissures at bottom */}
                <div 
                  className="absolute inset-x-0 bottom-0 h-56 opacity-75 mix-blend-screen pointer-events-none"
                  style={{
                    background: "radial-gradient(ellipse at 50% 100%, rgba(255,45,85,0.85) 0%, rgba(225,29,72,0.45) 45%, transparent 80%)",
                    animation: "lavaRiverPulse 2.4s ease-in-out infinite alternate"
                  }}
                />
                {/* Volcanic Heat Shimmer Wave */}
                <div 
                  className="absolute inset-0 opacity-40 mix-blend-color-dodge pointer-events-none"
                  style={{
                    background: "radial-gradient(circle at 50% 70%, rgba(251,113,133,0.4) 0%, transparent 60%)",
                    animation: "heatShimmerWave 3.5s ease-in-out infinite alternate"
                  }}
                />
                {/* Rising Fiery Magma Sparks & Smoke Cinders */}
                {[...Array(22)].map((_, i) => (
                  <div
                    key={`hamza-spark-${i}`}
                    className="absolute rounded-full bg-amber-300 blur-[0.5px]"
                    style={{
                      left: `${(i * 4.6 + 2) % 96}%`,
                      bottom: `${(i * 9 + 6) % 86}%`,
                      width: `${(i % 3) * 2 + 2.5}px`,
                      height: `${(i % 3) * 2 + 2.5}px`,
                      boxShadow: "0 0 14px #fb7185, 0 0 28px #e11d48",
                      animation: `magmaEmberRise ${2.8 + (i % 4)}s ease-in-out infinite alternate`,
                      animationDelay: `${i * 0.25}s`
                    }}
                  />
                ))}
              </div>
            )}

            {/* ===================== كوكب الكلمة (محيطي أزرق عميق) ===================== */}
            {currentPlanetAtmosphere.id === "word" && (
              <div className="absolute inset-0 pointer-events-none">
                {/* Shimmering Underwater Caustic Light Overlay */}
                <div 
                  className="absolute inset-0 opacity-45 mix-blend-screen pointer-events-none"
                  style={{
                    backgroundImage: `radial-gradient(circle at 30% 40%, rgba(56,189,248,0.4) 0%, transparent 40%), radial-gradient(circle at 70% 60%, rgba(2,132,199,0.35) 0%, transparent 45%)`,
                    animation: "oceanCausticPulse 4s ease-in-out infinite alternate"
                  }}
                />
                {/* Bioluminescent Deep-Sea Plankton & Bubbles Rising */}
                {[...Array(20)].map((_, i) => (
                  <div
                    key={`word-bubble-${i}`}
                    className="absolute rounded-full bg-cyan-200 blur-[0.6px] border border-cyan-300/40"
                    style={{
                      left: `${(i * 5.1 + 3) % 95}%`,
                      bottom: `${(i * 10 + 4) % 85}%`,
                      width: `${(i % 4) * 2.5 + 4}px`,
                      height: `${(i % 4) * 2.5 + 4}px`,
                      boxShadow: "0 0 15px #38bdf8, 0 0 30px #0284c7",
                      animation: `bubbleFloatUp ${4.5 + (i % 4)}s ease-in-out infinite`,
                      animationDelay: `${i * 0.3}s`
                    }}
                  />
                ))}
              </div>
            )}

            {/* ===================== كوكب الإعراب (عملاق غازي ذو حلقات مهيبة) ===================== */}
            {currentPlanetAtmosphere.id === "syntax" && (
              <div className="absolute inset-0 pointer-events-none">
                {/* Fast-moving horizontal Jovian ammonia cloud bands */}
                <div 
                  className="absolute inset-x-[-15%] top-[25%] h-44 opacity-35 mix-blend-screen pointer-events-none"
                  style={{
                    background: "linear-gradient(to bottom, transparent 0%, rgba(245,158,11,0.35) 30%, rgba(217,119,6,0.5) 50%, rgba(245,158,11,0.3) 70%, transparent 100%)",
                    animation: "jovianCloudStream 12s linear infinite"
                  }}
                />
                {/* Great Golden Storm Vortex */}
                <div 
                  className="absolute right-8 bottom-28 w-72 h-36 rounded-[50%] opacity-40 mix-blend-screen border-2 border-amber-300/40"
                  style={{
                    background: "radial-gradient(ellipse at center, rgba(251,191,36,0.6) 0%, rgba(217,119,6,0.3) 45%, transparent 75%)",
                    animation: "livingNebulaSwirl1 24s linear infinite"
                  }}
                />
                {/* Shimmering Golden Starlight & Gas Crystals */}
                {[...Array(18)].map((_, i) => (
                  <div
                    key={`syntax-star-${i}`}
                    className="absolute rounded-full bg-yellow-200 blur-[0.4px]"
                    style={{
                      left: `${(i * 5.5 + 4) % 94}%`,
                      top: `${(i * 8 + 12) % 80}%`,
                      width: `${(i % 3) + 2.5}px`,
                      height: `${(i % 3) + 2.5}px`,
                      boxShadow: "0 0 12px #fde047, 0 0 24px #eab308",
                      animation: `starlightPulse ${2.8 + (i % 3)}s ease-in-out infinite alternate`,
                      animationDelay: `${i * 0.25}s`
                    }}
                  />
                ))}
              </div>
            )}

            {/* ===================== كوكب التركيب (مسلات الزمرد والبلورات الخضراء) ===================== */}
            {currentPlanetAtmosphere.id === "structures" && (
              <div className="absolute inset-0 pointer-events-none">
                {/* Prismatic Emerald Geode Light Refraction Beams */}
                <div 
                  className="absolute inset-0 opacity-45 mix-blend-screen pointer-events-none"
                  style={{
                    background: "radial-gradient(ellipse at 45% 65%, rgba(52,211,153,0.45) 0%, rgba(5,150,105,0.2) 50%, transparent 75%)",
                    animation: "crystalPrismGleam 4s ease-in-out infinite alternate"
                  }}
                />
                {/* Floating Bioluminescent Jade Spores & Shards */}
                {[...Array(18)].map((_, i) => (
                  <div
                    key={`struct-shard-${i}`}
                    className="absolute rounded-full bg-emerald-200 blur-[0.5px]"
                    style={{
                      left: `${(i * 5.2 + 5) % 95}%`,
                      top: `${(i * 9 + 10) % 82}%`,
                      width: `${(i % 3) * 2 + 2.5}px`,
                      height: `${(i % 3) * 2 + 2.5}px`,
                      boxShadow: "0 0 14px #34d399, 0 0 28px #059669",
                      animation: `starlightPulse ${3.2 + (i % 3)}s ease-in-out infinite alternate`,
                      animationDelay: `${i * 0.3}s`
                    }}
                  />
                ))}
              </div>
            )}

            {/* ===================== كوكب الكتابة (سطح قمري وفوهات نيزكية) ===================== */}
            {currentPlanetAtmosphere.id === "spelling" && (
              <div className="absolute inset-0 pointer-events-none">
                {/* Silvery Lunar Regolith Dust Floating in Low Gravity */}
                {[...Array(20)].map((_, i) => (
                  <div
                    key={`lunar-dust-${i}`}
                    className="absolute rounded-full bg-slate-100 blur-[0.4px]"
                    style={{
                      left: `${(i * 4.9 + 3) % 96}%`,
                      bottom: `${(i * 8 + 8) % 78}%`,
                      width: `${(i % 3) * 1.5 + 2}px`,
                      height: `${(i % 3) * 1.5 + 2}px`,
                      boxShadow: "0 0 12px #e2e8f0, 0 0 24px #94a3b8",
                      animation: `lunarDustFloat ${5.5 + (i % 3)}s ease-in-out infinite alternate`,
                      animationDelay: `${i * 0.35}s`
                    }}
                  />
                ))}
              </div>
            )}

            {/* ===================== كوكب الجملة (جليد قطبي وبلازما) ===================== */}
            {currentPlanetAtmosphere.id === "sentence" && (
              <div className="absolute inset-0 pointer-events-none">
                {/* Flowing Translucent Aurora Borealis Curtain */}
                <div 
                  className="absolute inset-x-0 top-0 h-72 opacity-55 mix-blend-screen pointer-events-none"
                  style={{
                    background: "radial-gradient(ellipse at 50% 10%, rgba(34,211,238,0.6) 0%, rgba(6,182,212,0.25) 50%, transparent 80%)",
                    animation: "auroraCurtainDance 6.5s ease-in-out infinite alternate"
                  }}
                />
                {/* Branching Electric Plasma Lightning Arcs */}
                <svg className="w-full h-full opacity-60 mix-blend-screen" viewBox="0 0 1000 800" preserveAspectRatio="none">
                  <path
                    d="M 120 180 Q 280 240 450 160 T 820 220"
                    fill="none"
                    stroke="#67e8f9"
                    strokeWidth="2"
                    filter="drop-shadow(0 0 10px #22d3ee)"
                    style={{ animation: "plasmaArcFlicker 3s ease-in-out infinite" }}
                  />
                  <path
                    d="M 450 160 Q 560 310 720 380"
                    fill="none"
                    stroke="#a5f3fc"
                    strokeWidth="1.8"
                    filter="drop-shadow(0 0 12px #38bdf8)"
                    style={{ animation: "plasmaArcFlicker 4s ease-in-out infinite alternate" }}
                  />
                </svg>
              </div>
            )}

            {/* ===================== كوكب الحروف (سديم بلوري كوني) ===================== */}
            {currentPlanetAtmosphere.id === "letters" && (
              <div className="absolute inset-0 pointer-events-none">
                {/* Cosmic Starlight Glyphs & Amethyst Dust */}
                {[...Array(20)].map((_, i) => (
                  <div
                    key={`letters-glyph-${i}`}
                    className="absolute rounded-full bg-indigo-200 blur-[0.4px]"
                    style={{
                      left: `${(i * 5 + 3) % 95}%`,
                      top: `${(i * 8.5 + 8) % 85}%`,
                      width: `${(i % 3) * 2 + 2.5}px`,
                      height: `${(i % 3) * 2 + 2.5}px`,
                      boxShadow: "0 0 14px #818cf8, 0 0 28px #6366f1",
                      animation: `starlightPulse ${3 + (i % 3)}s ease-in-out infinite alternate`,
                      animationDelay: `${i * 0.25}s`
                    }}
                  />
                ))}
              </div>
            )}

            {/* ===================== كوكب الأساليب (عواصف شمسية ورمال ذهبية) ===================== */}
            {currentPlanetAtmosphere.id === "styles" && (
              <div className="absolute inset-0 pointer-events-none">
                {/* Arching Solar Prominence Flare Wave */}
                <div 
                  className="absolute inset-x-0 bottom-0 h-48 opacity-45 mix-blend-screen pointer-events-none"
                  style={{
                    background: "radial-gradient(ellipse at 50% 100%, rgba(251,191,36,0.7) 0%, rgba(217,119,6,0.3) 45%, transparent 80%)",
                    animation: "solarFlareWave 7s ease-in-out infinite alternate"
                  }}
                />
                {/* Golden Solar Wind Motes */}
                {[...Array(16)].map((_, i) => (
                  <div
                    key={`styles-sun-${i}`}
                    className="absolute rounded-full bg-amber-200 blur-[0.5px]"
                    style={{
                      left: `${(i * 6 + 5) % 94}%`,
                      top: `${(i * 9 + 10) % 82}%`,
                      width: `${(i % 3) + 2.5}px`,
                      height: `${(i % 3) + 2.5}px`,
                      boxShadow: "0 0 14px #fbbf24, 0 0 28px #d97706",
                      animation: `starlightPulse ${2.8 + (i % 3)}s ease-in-out infinite alternate`,
                      animationDelay: `${i * 0.3}s`
                    }}
                  />
                ))}
              </div>
            )}

            {/* ===================== كوكب التصريف (طيّ الزمكان وأيونات بنفسجية) ===================== */}
            {currentPlanetAtmosphere.id === "morphology" && (
              <div className="absolute inset-0 pointer-events-none">
                {/* Ultraviolet Space Warp Waves */}
                <div 
                  className="absolute inset-0 opacity-35 mix-blend-screen pointer-events-none"
                  style={{
                    background: "radial-gradient(ellipse at 50% 50%, rgba(168,85,247,0.45) 0%, rgba(147,51,234,0.15) 50%, transparent 75%)",
                    animation: "livingCosmicPulse 8s ease-in-out infinite"
                  }}
                />
                {/* Branching Purple Lightning Discharges */}
                <svg className="w-full h-full opacity-65 mix-blend-screen" viewBox="0 0 1000 800" preserveAspectRatio="none">
                  <path
                    d="M 200 120 Q 380 260 550 180 T 880 290"
                    fill="none"
                    stroke="#c084fc"
                    strokeWidth="2.2"
                    filter="drop-shadow(0 0 12px #a855f7)"
                    style={{ animation: "plasmaArcFlicker 3.2s ease-in-out infinite alternate" }}
                  />
                </svg>
              </div>
            )}

            {/* ===================== كوكب المعنى (كثبان كهرمانية شاهقة) ===================== */}
            {currentPlanetAtmosphere.id === "meanings" && (
              <div className="absolute inset-0 pointer-events-none">
                {/* Warm Sunset Mirage Shimmer */}
                <div 
                  className="absolute inset-0 opacity-40 mix-blend-screen pointer-events-none"
                  style={{
                    background: "radial-gradient(ellipse at 50% 65%, rgba(234,88,12,0.45) 0%, rgba(194,65,12,0.15) 50%, transparent 75%)",
                    animation: "heatShimmerWave 4s ease-in-out infinite alternate"
                  }}
                />
                {/* Amber Dust Devils Shimmering */}
                {[...Array(16)].map((_, i) => (
                  <div
                    key={`meaning-dust-${i}`}
                    className="absolute rounded-full bg-orange-200 blur-[0.5px]"
                    style={{
                      left: `${(i * 6.2 + 4) % 95}%`,
                      bottom: `${(i * 8 + 12) % 75}%`,
                      width: `${(i % 3) * 1.8 + 2}px`,
                      height: `${(i % 3) * 1.8 + 2}px`,
                      boxShadow: "0 0 12px #fb923c, 0 0 24px #ea580c",
                      animation: `lunarDustFloat ${5 + (i % 3)}s ease-in-out infinite alternate`,
                      animationDelay: `${i * 0.35}s`
                    }}
                  />
                ))}
              </div>
            )}
          </div>

          {/* 5. CINEMATIC DEPTH VIGNETTE (Keeps gameplay area readable while preserving rich landscape scenery) */}
          <div className="absolute inset-0 pointer-events-none bg-gradient-to-b from-black/40 via-transparent to-black/50 z-0" />

          {/* ========================================================== */}
          {/* DESCENT SEQUENCE OVERLAY (Runs directly in the planet page) */}
          {/* ========================================================== */}
          {isDescentActive ? (
            <>
              {/* Top Bar HUD during Descent: Return, Planet Badge, Fast-Forward */}
              <div className="relative z-40 w-full px-6 pt-5 flex items-center justify-between pointer-events-auto">
                <button
                  onClick={() => {
                    skipDescentToMission();
                    setScreen("home");
                  }}
                  className="px-4 py-2 rounded-xl bg-slate-950/80 border border-cyan-400/40 text-cyan-200 hover:text-white hover:border-cyan-300 transition-all text-xs font-bold flex items-center gap-2 backdrop-blur-md cursor-pointer hover:scale-105 active:scale-95 shadow-[0_0_15px_rgba(6,182,212,0.3)]"
                >
                  <ArrowLeft size={16} />
                  <span>خريطة المجموعة الشمسية</span>
                </button>

                <div className="flex items-center gap-2.5 px-4 py-1.5 rounded-full bg-slate-950/85 border border-white/20 backdrop-blur-md shadow-xl">
                  <span className="w-2 h-2 rounded-full shadow-[0_0_8px_currentColor]" style={{ backgroundColor: currentPlanetAtmosphere.ambientColor, color: currentPlanetAtmosphere.ambientColor }} />
                  <span className="text-sm font-black text-white">{currentPlanetAtmosphere.name}</span>
                  <span className="text-xs text-slate-300">({currentPlanetAtmosphere.sub})</span>
                </div>

                <button
                  onClick={skipDescentToMission}
                  className="px-3.5 py-1.5 rounded-xl bg-cyan-500/20 border border-cyan-400/50 text-cyan-200 hover:text-white hover:bg-cyan-500/30 transition-all text-xs font-bold flex items-center gap-1.5 backdrop-blur-md cursor-pointer active:scale-95"
                >
                  <span>انطلاق فوري</span>
                  <FastForward size={14} />
                </button>
              </div>

              {/* THE ROCKET */}
              {descentAnim.rocketOpacity > 0 && (
                <div 
                  className="absolute left-1/2 -translate-x-1/2 z-30 pointer-events-none flex flex-col items-center will-change-transform"
                  style={{
                    top: "4%",
                    transform: `translate(-50%, ${descentAnim.rocketY}px) scale(${descentAnim.rocketScale})`,
                    opacity: descentAnim.rocketOpacity,
                    filter: descentAnim.rocketY < -60 ? "blur(3px)" : "none"
                  }}
                >
                  <div className="relative w-24 h-56 md:w-28 md:h-64">
                    <img
                      src={retroAstronautRocket}
                      alt="صاروخ الاستكشاف"
                      className="w-full h-full object-contain filter drop-shadow-[0_15px_30px_rgba(0,0,0,0.85)] drop-shadow-[0_0_24px_rgba(34,211,238,0.45)]"
                    />

                    {/* Rocket Exhaust Ion Plasma Jet */}
                    <div className="absolute top-[82%] left-1/2 -translate-x-1/2 flex items-center justify-center">
                      {descentPhase === "rocket_departing" ? (
                        /* High-Energy Hyper-Thrust Plasma Blast into Horizon */
                        <div className="flex flex-col items-center">
                          <div 
                            className="w-10 h-44 rounded-b-full bg-gradient-to-b from-white via-cyan-300 via-amber-400 to-transparent blur-[2px]"
                            style={{ animation: "enginePlasmaFlicker 0.06s infinite" }}
                          />
                          <div className="absolute w-28 h-48 rounded-full bg-cyan-400/60 blur-xl" />
                          <div className="absolute w-16 h-32 rounded-full bg-orange-500/50 blur-lg" />
                        </div>
                      ) : (
                        <>
                          <div 
                            className="w-4 h-7 rounded-full bg-gradient-to-b from-white via-cyan-300 to-transparent blur-[2px] animate-pulse"
                            style={{ animationDuration: "0.15s" }}
                          />
                          <div className="absolute w-10 h-12 rounded-full bg-cyan-400/30 blur-lg" />
                        </>
                      )}
                    </div>
                  </div>
                </div>
              )}

              {/* THE SINGLE FALLING ROPE: Extending from rocket nozzle down to the ground, then retracting into rocket */}
              {descentAnim.ropeProgress > 0 && (
                <div 
                  className="absolute left-1/2 -translate-x-1/2 z-25 pointer-events-none flex flex-col items-center overflow-hidden"
                  style={{
                    top: "26%",
                    width: "24px",
                    height: `${descentAnim.ropeProgress * 42}%`
                  }}
                >
                  <div 
                    className="w-3 md:w-3.5 h-full rounded-full shadow-[0_0_18px_#22d3ee,0_0_35px_rgba(34,211,238,1)]"
                    style={{
                      background: "repeating-linear-gradient(180deg, #ffffff 0px, #a5f3fc 4px, #22d3ee 8px, #0891b2 12px, #06b6d4 16px)"
                    }}
                  />
                </div>
              )}

              {/* THE ASTRONAUT: Descends smoothly along the rope to the ground, then stays firmly on surface */}
              {descentAnim.astronautOpacity > 0 && (
                <div 
                  className="absolute left-1/2 -translate-x-1/2 z-35 pointer-events-none will-change-transform flex flex-col items-center"
                  style={{
                    top: `${descentAnim.astronautTop}%`,
                    opacity: descentAnim.astronautOpacity,
                    animation: (descentPhase === "rope_lowering" || descentPhase === "rope_retracting")
                      ? "cosmicRopeSway 4.5s ease-in-out infinite"
                      : "astronautFloatingZeroG 3.6s ease-in-out infinite"
                  }}
                >
                  {/* High-Resolution Astronaut Image */}
                  <div className="relative w-20 h-36 md:w-24 md:h-44 flex items-center justify-center">
                    <img
                      src={astronautOnRope}
                      alt="رائد الفضاء ممسكاً بالحبل"
                      className="w-full h-full object-contain filter drop-shadow-[0_16px_36px_rgba(0,0,0,0.95)] drop-shadow-[0_0_25px_rgba(34,211,238,0.7)]"
                    />

                    {/* Dual micro-ion floating thrusters under boots when settling */}
                    {descentAnim.astronautTop >= 66 && (
                      <div className="absolute bottom-2 left-1/2 -translate-x-1/2 flex gap-4 pointer-events-none">
                        <div className="w-3 h-5 rounded-full bg-cyan-300 blur-[1px] animate-pulse" />
                        <div className="w-3 h-5 rounded-full bg-cyan-300 blur-[1px] animate-pulse" />
                      </div>
                    )}
                  </div>

                  {/* Grounding Atmosphere Light Ring at Astronaut's Feet */}
                  {descentAnim.astronautTop >= 66 && (
                    <div 
                      className="w-36 h-8 rounded-full border border-cyan-400/50 -mt-3 pointer-events-none"
                      style={{
                        background: "radial-gradient(ellipse at center, rgba(34,211,238,0.45) 0%, transparent 75%)",
                        animation: "astronautSettledGlow 3s ease-in-out infinite"
                      }}
                    />
                  )}
                </div>
              )}

              {/* HOLOGRAPHIC MISSION TRANSMISSION (Opens bottom-to-top, types character-by-character, closes top-to-bottom) */}
              {(descentPhase === "transmission_active" || descentPhase === "transmission_fading") && (
                <div 
                  className="absolute top-12 md:top-16 left-1/2 -translate-x-1/2 z-40 w-full max-w-lg px-4 pointer-events-auto"
                  style={{
                    animation: descentPhase === "transmission_fading"
                      ? "hologramCloseToBottom 0.55s cubic-bezier(0.4, 0, 0.2, 1) forwards"
                      : "hologramOpenFromBottom 0.6s cubic-bezier(0.16, 1, 0.3, 1) forwards"
                  }}
                >
                  <div 
                    className="relative w-full rounded-2xl p-5 md:p-6 backdrop-blur-xl flex flex-col items-center text-center border-2 shadow-[0_0_50px_rgba(34,211,238,0.35)] overflow-hidden"
                    style={{
                      background: "linear-gradient(135deg, rgba(3, 15, 28, 0.96) 0%, rgba(6, 24, 40, 0.94) 100%)",
                      borderColor: currentPlanetAtmosphere.accentBorder
                    }}
                  >
                    {/* Futuristic Scanning Laser Bar (Rises on open, sinks on close) */}
                    <div 
                      className="absolute left-0 right-0 h-1 bg-cyan-300 shadow-[0_0_15px_#22d3ee,0_0_30px_#22d3ee] pointer-events-none z-20"
                      style={{
                        animation: descentPhase === "transmission_fading"
                          ? "scanlineBeamSink 0.55s ease-in forwards"
                          : "scanlineBeamRise 0.6s ease-out forwards"
                      }}
                    />

                    {/* Hologram Digital Grid Overlay */}
                    <div 
                      className="absolute inset-0 pointer-events-none opacity-15"
                      style={{
                        backgroundImage: "repeating-linear-gradient(0deg, rgba(34,211,238,0.25) 0px, transparent 2px, transparent 4px)"
                      }}
                    />

                    {/* Sleek Cyber Hologram Header */}
                    <div className="flex items-center justify-between w-full mb-3 px-3.5 py-1.5 rounded-xl bg-cyan-950/80 border border-cyan-400/50 text-cyan-200 text-xs font-bold">
                      <div className="flex items-center gap-2">
                        <Sparkles size={14} className="text-cyan-300 animate-spin" style={{ animationDuration: "8s" }} />
                        <span className="font-black text-white text-sm">{currentPlanetAtmosphere.name}</span>
                        <span className="text-[11px] text-cyan-300/80">• الهدف المداري</span>
                      </div>
                      <div className="flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-emerald-950/80 border border-emerald-400/40 text-[10px] text-emerald-300 font-mono">
                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping" />
                        <span>LIVE HUD</span>
                      </div>
                    </div>

                    {/* Punchy, Direct Mission Directive */}
                    <div className="my-2.5 px-3 flex items-center justify-center min-h-[46px]">
                      <h3 className="text-lg md:text-xl font-black text-white leading-relaxed drop-shadow-[0_0_20px_rgba(34,211,238,0.7)] flex items-center justify-center flex-wrap gap-1.5">
                        <span className="bg-gradient-to-r from-white via-cyan-100 to-cyan-300 bg-clip-text text-transparent">
                          {typedDistressText || currentPlanetAtmosphere.distressMessage}
                        </span>
                        {!isTypingComplete && (
                          <span className="inline-block w-2 h-5 bg-cyan-400 shadow-[0_0_10px_#22d3ee] animate-pulse" />
                        )}
                      </h3>
                    </div>

                    <div className="w-full mt-2.5 pt-3 border-t border-cyan-500/25 flex items-center justify-between gap-3">
                      <div className="flex-1 text-right">
                        <div className="text-[11px] text-cyan-300 font-bold mb-1 flex items-center gap-1.5">
                          <Zap size={13} className="text-cyan-400 animate-pulse" />
                          <span>جاهزية الرائد: 100%</span>
                        </div>
                        <div className="w-full h-1.5 bg-slate-900/90 rounded-full overflow-hidden border border-cyan-500/40">
                          <div 
                            className="h-full bg-gradient-to-r from-cyan-400 via-teal-300 to-emerald-400 rounded-full"
                            style={{
                              animation: "transmissionTimerDrain 2.8s linear forwards"
                            }}
                          />
                        </div>
                      </div>

                      <button
                        onClick={handleStartMissionFromHologram}
                        className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-cyan-400 to-emerald-400 hover:from-cyan-300 hover:to-emerald-300 text-slate-950 font-black text-xs shadow-[0_0_20px_rgba(34,211,238,0.6)] active:scale-95 transition-all flex items-center gap-1.5 cursor-pointer whitespace-nowrap"
                      >
                        <span>انطلق الآن ⚡</span>
                        <Flame size={14} />
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </>
          ) : (
            /* ========================================================== */
            /* OBSERVATORY HUD: Unified, sleek astronomical telemetry bar */
            /* ========================================================== */
            <div className="relative z-20 w-full px-6 pt-4 flex flex-col md:flex-row items-center justify-between gap-3 pointer-events-auto">
              
              {/* Right (in RTL): Exit to Map */}
              <div className="flex items-center gap-3">
                <button
                  onClick={() => {
                    flightState.current.shipX = 0;
                    flightState.current.shipY = 0;
                    flightState.current.targetX = 0;
                    flightState.current.targetY = 0;
                    flightState.current.shipVx = 0;
                    flightState.current.shipVy = 0;
                    setScreen("home");
                  }}
                  className="px-3.5 py-2 rounded-xl bg-slate-950/80 border border-white/20 text-slate-300 hover:text-white hover:border-cyan-400 text-xs font-bold flex items-center gap-1.5 backdrop-blur-md cursor-pointer transition-all shadow-md hover:scale-105 active:scale-95"
                >
                  <ArrowLeft size={15} />
                  <span>الخريطة</span>
                </button>
              </div>

              {/* Center: Cyber Astronaut Visor Mission Guidance (Directs astronaut clearly on what to collect) */}
              <div className="flex items-center gap-3 px-4 py-2 rounded-2xl bg-slate-950/85 border border-cyan-400/50 backdrop-blur-xl shadow-[0_0_25px_rgba(34,211,238,0.25)]">
                <div className="relative w-6 h-6 rounded-full bg-cyan-500/20 border border-cyan-400 flex items-center justify-center text-xs shadow-[0_0_8px_#22d3ee] shrink-0">
                  🎯
                </div>
                <div className="flex flex-col text-right">
                  <span className="text-[10px] text-cyan-400 font-bold uppercase tracking-wider flex items-center gap-1">
                    <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 animate-pulse" />
                    المطلوب جمعه
                  </span>
                  <span className="text-white text-xs md:text-sm font-black tracking-wide drop-shadow-[0_0_8px_rgba(255,255,255,0.4)]">
                    {currentChallenge?.prompt || currentPlanetAtmosphere.distressTarget}
                  </span>
                </div>
                {/* Segmented Cyber Data Capsule Cells */}
                <div className="flex items-center gap-1 mr-2 px-2.5 py-1 rounded-xl bg-slate-900/90 border border-cyan-500/30">
                  {[...Array(TARGET_CRYSTALS)].map((_, idx) => (
                    <div 
                      key={idx}
                      className={`w-2.5 h-4 rounded-sm transition-all duration-300 ${
                        idx < crystalsCaught 
                          ? "bg-gradient-to-t from-cyan-400 to-emerald-300 shadow-[0_0_8px_#22d3ee] scale-105" 
                          : "bg-slate-800/80 border border-white/10"
                      }`}
                    />
                  ))}
                  <span className="text-[11px] font-mono font-bold text-cyan-300 mr-1.5">
                    {crystalsCaught}/{TARGET_CRYSTALS}
                  </span>
                </div>
              </div>

              {/* Left (in RTL): Cybernetic Spacesuit Life-Support, Shields & Flight Telemetry */}
              <div className="flex items-center gap-3">
                {/* Plasma Shield Matrix Core */}
                <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-slate-950/85 border border-cyan-400/40 backdrop-blur-md shadow-md">
                  <div className="flex items-center gap-1 text-[11px] font-bold text-slate-300">
                    <Shield size={14} className={shields > 1 ? "text-cyan-400 fill-cyan-400" : "text-rose-400 fill-rose-400 animate-pulse"} />
                    <span>الدروع</span>
                  </div>
                  <div className="flex items-center gap-1">
                    {[1, 2, 3].map((s) => (
                      <div
                        key={s}
                        className={`w-4 h-2 rounded-sm transition-all duration-300 ${
                          s <= shields
                            ? s === 1 && shields === 1
                              ? "bg-rose-500 shadow-[0_0_8px_#f43f5e] animate-pulse"
                              : "bg-gradient-to-r from-cyan-400 to-teal-300 shadow-[0_0_8px_#22d3ee]"
                            : "bg-slate-800/80 border border-white/10"
                        }`}
                      />
                    ))}
                  </div>
                </div>

                {/* Orbit Trajectory & Altitude Distance Meter */}
                <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-slate-950/85 border border-cyan-400/40 backdrop-blur-md shadow-md">
                  <Navigation size={13} className="text-cyan-300 rotate-45" />
                  <span className="text-xs font-mono font-black text-cyan-300">{distanceRemaining}م</span>
                  <div className="w-16 md:w-24 h-2 bg-slate-900 rounded-full overflow-hidden border border-cyan-500/30 p-0.5">
                    <div 
                      className="h-full rounded-full bg-gradient-to-r from-cyan-400 via-teal-300 to-emerald-400 transition-all duration-300 shadow-[0_0_6px_#22d3ee]"
                      style={{ width: `${Math.max(0, 100 - (distanceRemaining / 800) * 100)}%` }}
                    />
                  </div>
                </div>

                {/* Stellar Score Credits */}
                <div className="px-3 py-1.5 rounded-xl bg-slate-950/85 border border-amber-400/40 text-amber-400 font-mono text-sm font-black flex items-center gap-1.5 backdrop-blur-md shadow-[0_0_15px_rgba(251,191,36,0.2)]">
                  <Sparkles size={13} className="text-amber-300 animate-spin" style={{ animationDuration: '6s' }} />
                  <span>{score}</span>
                </div>
              </div>
            </div>
          )}

          {/* Interactive Physics Flight Canvas (Full 2D Movement across entire screen) */}
          <div className="absolute inset-0 z-10 w-full h-full">
            <canvas
              ref={canvasRef}
              onPointerDown={handlePointerMove}
              onPointerMove={handlePointerMove}
              onClick={fireLaser}
              className="w-full h-full cursor-crosshair touch-none"
            />
          </div>


        </div>
      )}

      {/* ============================================================== */}
      {/* 3. شاشة النصر والاحتفال (Victory Screen) */}
      {/* ============================================================== */}
      {screen === "victory" && (
        <div className="relative w-full h-screen flex items-center justify-center bg-cover bg-center p-4"
             style={{ backgroundImage: `url(${turquoiseCosmosBg})` }}>
          <div className="absolute inset-0 bg-[#041a22]/85 backdrop-blur-md" />

          <div className="relative z-20 w-full max-w-md bg-[#042630]/95 border-2 border-cyan-400/60 rounded-3xl p-8 shadow-[0_0_50px_rgba(34,211,238,0.4)] flex flex-col items-center text-center">
            <div className="w-20 h-20 rounded-full bg-gradient-to-tr from-cyan-500 to-emerald-400 flex items-center justify-center text-white shadow-[0_0_30px_#22d3ee] mb-4 animate-bounce">
              <Award size={44} />
            </div>

            <h2 className="text-2xl md:text-3xl font-black text-transparent bg-clip-text bg-gradient-to-r from-cyan-300 via-emerald-300 to-white mb-2">
              اكتملت الرحلة بنجاح!
            </h2>
            <p className="text-sm text-slate-300 font-semibold mb-6">
              وصلت بأمان إلى المدار وتم اصطياد جميع الكلمات الصحيحة بنجاح فائق!
            </p>

            <div className="w-full bg-[#031d24] rounded-2xl p-4 border border-cyan-500/20 flex items-center justify-around mb-6">
              <div>
                <div className="text-xs text-cyan-300/80 font-bold">النقاط المحرزة</div>
                <div className="text-2xl font-black text-amber-400">{score + 800}</div>
              </div>
              <div className="w-px h-10 bg-cyan-500/20" />
              <div>
                <div className="text-xs text-cyan-300/80 font-bold">دروع رائد الفضاء</div>
                <div className="text-2xl font-black text-cyan-400">{shields} / 3</div>
              </div>
            </div>

            <div className="flex gap-3 w-full">
              <button
                onClick={() => setScreen("home")}
                className="flex-1 py-3 rounded-xl bg-gradient-to-r from-teal-500 to-cyan-500 hover:from-teal-400 hover:to-cyan-400 text-white font-black shadow-[0_0_20px_rgba(34,211,238,0.4)] active:scale-95 transition-all"
              >
                العودة للخريطة 🌌
              </button>
              <button
                onClick={() => launchFlightGame(activeStage)}
                className="px-4 py-3 rounded-xl bg-white/10 hover:bg-white/20 text-slate-200 font-bold border border-white/20 transition-all"
                title="إعادة الرحلة"
              >
                <RotateCcw size={20} />
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ============================================================== */}
      {/* 4. شاشة نفاد الدروع (Game Over Screen) */}
      {/* ============================================================== */}
      {screen === "gameover" && (
        <div className="relative w-full h-screen flex items-center justify-center bg-cover bg-center p-4"
             style={{ backgroundImage: `url(${turquoiseCosmosBg})` }}>
          <div className="absolute inset-0 bg-[#041a22]/90 backdrop-blur-md" />

          <div className="relative z-20 w-full max-w-md bg-[#090b20]/95 border-2 border-rose-500/60 rounded-3xl p-8 shadow-[0_0_50px_rgba(244,63,94,0.4)] flex flex-col items-center text-center">
            <div className="w-20 h-20 rounded-full bg-rose-600/20 border-2 border-rose-500 flex items-center justify-center text-rose-400 shadow-[0_0_30px_#f43f5e] mb-4">
              <Shield size={40} />
            </div>

            <h2 className="text-2xl md:text-3xl font-black text-rose-300 mb-2">
              نفدت دروع رائد الفضاء!
            </h2>
            <p className="text-sm text-slate-300 font-semibold mb-6">
              أصيبت بدلة رائد الفضاء بعدة اصطدامات فضائية، حاول مرة أخرى وركز على اصطياد الكلمات الصحيحة فقط وتدمير الصخور!
            </p>

            <div className="flex gap-3 w-full">
              <button
                onClick={() => launchFlightGame(activeStage)}
                className="flex-1 py-3 rounded-xl bg-gradient-to-r from-rose-500 to-amber-600 hover:from-rose-400 hover:to-amber-500 text-white font-black shadow-[0_0_20px_rgba(244,63,94,0.4)] active:scale-95 transition-all"
              >
                إعادة المحاولة 🚀
              </button>
              <button
                onClick={() => setScreen("home")}
                className="px-5 py-3 rounded-xl bg-white/10 hover:bg-white/20 text-slate-200 font-bold border border-white/20 transition-all"
              >
                الخريطة
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};
