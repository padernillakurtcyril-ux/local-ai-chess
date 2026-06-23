// 8-Bit Web Audio Synthesizer for Retro Game Effects
class SoundManager {
  private enabled: boolean = true;
  private ctx: AudioContext | null = null;

  public toggle(state: boolean) {
    this.enabled = state;
  }

  private initContext() {
    if (!this.ctx) {
      this.ctx = new (window.AudioContext || (window as any).webkitAudioContext)();
    }
    if (this.ctx.state === "suspended") {
      this.ctx.resume();
    }
    return this.ctx;
  }

  // Authentic short NES move tick
  public playMove() {
    if (!this.enabled) return;
    try {
      const ctx = this.initContext();
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.type = "triangle"; // Nice soft 8-bit triangle channel move sound
      osc.frequency.setValueAtTime(450, ctx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(150, ctx.currentTime + 0.08);

      gain.gain.setValueAtTime(0.15, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.08);

      osc.connect(gain);
      gain.connect(ctx.destination);

      osc.start();
      osc.stop(ctx.currentTime + 0.1);
    } catch (e) {
      console.warn("Audio Context blocked or failed:", e);
    }
  }

  // Gritty retro capture smash
  public playCapture() {
    if (!this.enabled) return;
    try {
      const ctx = this.initContext();
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.type = "sawtooth"; // Gritty aggressive crunch
      osc.frequency.setValueAtTime(250, ctx.currentTime);
      osc.frequency.linearRampToValueAtTime(40, ctx.currentTime + 0.18);

      gain.gain.setValueAtTime(0.2, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.18);

      osc.connect(gain);
      gain.connect(ctx.destination);

      osc.start();
      osc.stop(ctx.currentTime + 0.2);
    } catch (e) {
      // Ignored
    }
  }

  // Double alarm alert beep for check states
  public playCheck() {
    if (!this.enabled) return;
    try {
      const ctx = this.initContext();
      
      const playTone = (timeOffset: number) => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();

        osc.type = "square"; // Retro alarm square channel
        osc.frequency.setValueAtTime(780, ctx.currentTime + timeOffset);
        osc.frequency.setValueAtTime(580, ctx.currentTime + timeOffset + 0.08);

        gain.gain.setValueAtTime(0.12, ctx.currentTime + timeOffset);
        gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + timeOffset + 0.16);

        osc.connect(gain);
        gain.connect(ctx.destination);

        osc.start(ctx.currentTime + timeOffset);
        osc.stop(ctx.currentTime + timeOffset + 0.18);
      };

      playTone(0);
      playTone(0.12);
    } catch (e) {
      // Ignored
    }
  }

  // Classic level-complete winning retro arpeggio!
  public playVictory() {
    if (!this.enabled) return;
    try {
      const ctx = this.initContext();
      const notes = [261.63, 329.63, 392.00, 523.25, 659.25, 783.99, 1046.50]; // C Major arpeggio
      
      notes.forEach((freq, idx) => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();

        osc.type = "square";
        osc.frequency.setValueAtTime(freq, ctx.currentTime + idx * 0.08);

        gain.gain.setValueAtTime(0.1, ctx.currentTime + idx * 0.08);
        gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + idx * 0.08 + 0.15);

        osc.connect(gain);
        gain.connect(ctx.destination);

        osc.start(ctx.currentTime + idx * 0.08);
        osc.stop(ctx.currentTime + idx * 0.08 + 0.16);
      });
    } catch (e) {
      // Ignored
    }
  }

  // Descending classic sad "Game Over" arpeggio
  public playDefeat() {
    if (!this.enabled) return;
    try {
      const ctx = this.initContext();
      const notes = [493.88, 440.00, 392.00, 349.23, 293.66, 220.00, 196.00]; // Sad falling chords
      
      notes.forEach((freq, idx) => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();

        osc.type = "sawtooth";
        osc.frequency.setValueAtTime(freq, ctx.currentTime + idx * 0.1);
        osc.frequency.linearRampToValueAtTime(freq - 15, ctx.currentTime + idx * 0.1 + 0.18);

        gain.gain.setValueAtTime(0.1, ctx.currentTime + idx * 0.1);
        gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + idx * 0.1 + 0.18);

        osc.connect(gain);
        gain.connect(ctx.destination);

        osc.start(ctx.currentTime + idx * 0.1);
        osc.stop(ctx.currentTime + idx * 0.1 + 0.2);
      });
    } catch (e) {
      // Ignored
    }
  }

  // Neon retro 8-bit laser laser shoot sound SFX
  public playLaser() {
    if (!this.enabled) return;
    try {
      const ctx = this.initContext();
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.type = "sawtooth";
      osc.frequency.setValueAtTime(980, ctx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(150, ctx.currentTime + 0.16);

      gain.gain.setValueAtTime(0.15, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.16);

      osc.connect(gain);
      gain.connect(ctx.destination);

      osc.start();
      osc.stop(ctx.currentTime + 0.18);
    } catch (e) {}
  }

  // Heavily crushed retro arcade explosion crunch SFX
  public playExplosion() {
    if (!this.enabled) return;
    try {
      const ctx = this.initContext();
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.type = "sawtooth";
      osc.frequency.setValueAtTime(180, ctx.currentTime);
      osc.frequency.linearRampToValueAtTime(12, ctx.currentTime + 0.45);

      gain.gain.setValueAtTime(0.25, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.45);

      osc.connect(gain);
      gain.connect(ctx.destination);

      osc.start();
      osc.stop(ctx.currentTime + 0.45);
    } catch (e) {}
  }
}

export const sounds = new SoundManager();
export default sounds;
