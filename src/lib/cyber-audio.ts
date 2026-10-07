/**
 * Cybernetic Web Audio API Synthesizer Engine
 * Pure synthesized SFX - 0 external audio files needed.
 * Works seamlessly offline, instantly responsive, zero network lag.
 */

class CyberAudioEngine {
  private ctx: AudioContext | null = null;
  private isMuted: boolean = false;

  constructor() {
    if (typeof window !== 'undefined') {
      const savedMute = localStorage.getItem('actio_sound_fx');
      this.isMuted = savedMute === 'false';
    }
  }

  private initCtx(): AudioContext | null {
    if (typeof window === 'undefined') return null;
    if (!this.ctx) {
      const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
      if (AudioCtx) {
        this.ctx = new AudioCtx();
      }
    }
    if (this.ctx && this.ctx.state === 'suspended') {
      this.ctx.resume().catch(() => {});
    }
    return this.ctx;
  }

  public setMuted(muted: boolean) {
    this.isMuted = muted;
    if (typeof window !== 'undefined') {
      localStorage.setItem('actio_sound_fx', String(!muted));
    }
  }

  public isSoundEnabled(): boolean {
    if (typeof window !== 'undefined') {
      return localStorage.getItem('actio_sound_fx') !== 'false' && !this.isMuted;
    }
    return !this.isMuted;
  }

  /**
   * Tactile micro-mechanical UI click
   */
  public playClick() {
    if (!this.isSoundEnabled()) return;
    const ctx = this.initCtx();
    if (!ctx) return;

    try {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.type = 'sine';
      osc.frequency.setValueAtTime(1200, ctx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(300, ctx.currentTime + 0.04);

      gain.gain.setValueAtTime(0.15, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.04);

      osc.connect(gain);
      gain.connect(ctx.destination);

      osc.start();
      osc.stop(ctx.currentTime + 0.04);
    } catch {
      // AudioContext failure fallback
    }
  }

  /**
   * High-tech laser sweep / camera scan pulse
   */
  public playScan() {
    if (!this.isSoundEnabled()) return;
    const ctx = this.initCtx();
    if (!ctx) return;

    try {
      const now = ctx.currentTime;
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      const filter = ctx.createBiquadFilter();

      osc.type = 'sawtooth';
      osc.frequency.setValueAtTime(350, now);
      osc.frequency.linearRampToValueAtTime(1400, now + 0.18);
      osc.frequency.linearRampToValueAtTime(600, now + 0.35);

      filter.type = 'bandpass';
      filter.frequency.setValueAtTime(800, now);
      filter.Q.setValueAtTime(3, now);

      gain.gain.setValueAtTime(0.01, now);
      gain.gain.linearRampToValueAtTime(0.2, now + 0.1);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.35);

      osc.connect(filter);
      filter.connect(gain);
      gain.connect(ctx.destination);

      osc.start(now);
      osc.stop(now + 0.35);
    } catch {}
  }

  /**
   * Verification passed / objective complete triumph chime
   */
  public playSuccess() {
    if (!this.isSoundEnabled()) return;
    const ctx = this.initCtx();
    if (!ctx) return;

    try {
      const now = ctx.currentTime;
      // Synthesize three ascending notes: C5 (523Hz), E5 (659Hz), G5 (784Hz), C6 (1046Hz)
      const notes = [523.25, 659.25, 783.99, 1046.5];
      notes.forEach((freq, idx) => {
        const noteStart = now + idx * 0.08;
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();

        osc.type = 'triangle';
        osc.frequency.setValueAtTime(freq, noteStart);

        gain.gain.setValueAtTime(0.2, noteStart);
        gain.gain.exponentialRampToValueAtTime(0.001, noteStart + 0.3);

        osc.connect(gain);
        gain.connect(ctx.destination);

        osc.start(noteStart);
        osc.stop(noteStart + 0.3);
      });
    } catch {}
  }

  /**
   * Verification failed / security glitch alert
   */
  public playGlitch() {
    if (!this.isSoundEnabled()) return;
    const ctx = this.initCtx();
    if (!ctx) return;

    try {
      const now = ctx.currentTime;
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.type = 'sawtooth';
      osc.frequency.setValueAtTime(180, now);
      osc.frequency.setValueAtTime(120, now + 0.08);
      osc.frequency.setValueAtTime(80, now + 0.16);

      gain.gain.setValueAtTime(0.25, now);
      gain.gain.exponentialRampToValueAtTime(0.01, now + 0.28);

      osc.connect(gain);
      gain.connect(ctx.destination);

      osc.start(now);
      osc.stop(now + 0.28);
    } catch {}
  }

  /**
   * Tactical mission lock-in / quest accept impact
   */
  public playAccept() {
    if (!this.isSoundEnabled()) return;
    const ctx = this.initCtx();
    if (!ctx) return;

    try {
      const now = ctx.currentTime;
      // Sub-bass thump + cyber chirp
      const bass = ctx.createOscillator();
      const bassGain = ctx.createGain();

      bass.type = 'sine';
      bass.frequency.setValueAtTime(150, now);
      bass.frequency.exponentialRampToValueAtTime(40, now + 0.25);

      bassGain.gain.setValueAtTime(0.4, now);
      bassGain.gain.exponentialRampToValueAtTime(0.001, now + 0.25);

      bass.connect(bassGain);
      bassGain.connect(ctx.destination);
      bass.start(now);
      bass.stop(now + 0.25);

      // High cyber overtone
      const chirp = ctx.createOscillator();
      const chirpGain = ctx.createGain();
      chirp.type = 'square';
      chirp.frequency.setValueAtTime(880, now + 0.05);
      chirp.frequency.exponentialRampToValueAtTime(1760, now + 0.18);
      chirpGain.gain.setValueAtTime(0.08, now + 0.05);
      chirpGain.gain.exponentialRampToValueAtTime(0.001, now + 0.22);
      chirp.connect(chirpGain);
      chirpGain.connect(ctx.destination);
      chirp.start(now + 0.05);
      chirp.stop(now + 0.22);
    } catch {}
  }

  /**
   * Loot extraction / grand victory fanfare
   */
  public playExtract() {
    if (!this.isSoundEnabled()) return;
    const ctx = this.initCtx();
    if (!ctx) return;

    try {
      const now = ctx.currentTime;
      const arpeggio = [440, 554.37, 659.25, 880, 1108.73, 1318.51, 1760];
      arpeggio.forEach((freq, i) => {
        const time = now + i * 0.07;
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();

        osc.type = i % 2 === 0 ? 'sine' : 'triangle';
        osc.frequency.setValueAtTime(freq, time);

        gain.gain.setValueAtTime(0.18, time);
        gain.gain.exponentialRampToValueAtTime(0.001, time + 0.4);

        osc.connect(gain);
        gain.connect(ctx.destination);

        osc.start(time);
        osc.stop(time + 0.4);
      });
    } catch {}
  }

  /**
   * Urgent streak risk / permadeath alarm pulse
   */
  public playAlarm() {
    if (!this.isSoundEnabled()) return;
    const ctx = this.initCtx();
    if (!ctx) return;

    try {
      const now = ctx.currentTime;
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.type = 'square';
      osc.frequency.setValueAtTime(960, now);
      osc.frequency.setValueAtTime(720, now + 0.1);

      gain.gain.setValueAtTime(0.1, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.2);

      osc.connect(gain);
      gain.connect(ctx.destination);

      osc.start(now);
      osc.stop(now + 0.2);
    } catch {}
  }
}

export const cyberAudio = new CyberAudioEngine();
