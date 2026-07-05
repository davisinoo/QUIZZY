// Self-contained Web Audio API Synthesizer for Calm Background Music & Effects
// Inspired by cute, whimsical games like Candy Crush, utilizing soft marimba/vibraphone synths

let audioCtx: AudioContext | null = null;
let isPlaying = false;
let volumeNode: GainNode | null = null;
let musicInterval: any = null;
let currentStep = 0;

export type MusicTheme = 'cozy' | 'happy' | 'cool';
let activeTheme: MusicTheme = 'cozy';

// 1. Cozy Cozy Chords & Melody
const COZY_CHORDS = [
  [130.81, 164.81, 196.00, 246.94], // Cmaj7 (C3, E3, G3, B3)
  [110.00, 130.81, 164.81, 196.00], // Am7 (A2, C3, E3, G3)
  [87.31, 110.00, 130.81, 164.81],  // Fmaj7 (F2, A2, C3, E3)
  [98.00, 123.47, 146.83, 174.61],  // G7 (G2, B2, D3, F3)
];
const COZY_MELODY = [
  261.63, 293.66, 329.63, 392.00, 440.00, // C4, D4, E4, G4, A4
  523.25, 587.33, 659.25, 783.99, 880.00  // C5, D5, E5, G5, A5
];

// 2. Happy Sunshine Chords & Melody (Upbeat Major, Chimey, Upward)
const HAPPY_CHORDS = [
  [130.81, 164.81, 196.00, 261.63], // C major (C3, E3, G3, C4)
  [174.61, 220.00, 261.63, 349.23], // F major (F3, A3, C4, F4)
  [196.00, 246.94, 293.66, 392.00], // G major (G3, B3, D4, G4)
  [130.81, 164.81, 196.00, 261.63], // C major
];
const HAPPY_MELODY = [
  261.63, 293.66, 329.63, 349.23, 392.00, 440.00, 493.88, 523.25, // C Major scale (C4 to C5)
  587.33, 659.25, 698.46, 783.99, 880.00, 987.77, 1046.50         // C5 to C6
];

// 3. Cool Retro Beats Chords & Melody (Minor Blues Pentatonic, Groovy Swing)
const COOL_CHORDS = [
  [110.00, 130.81, 164.81, 196.00], // Am7
  [146.83, 174.61, 220.00, 261.63], // Dm7
  [164.81, 196.00, 246.94, 293.66], // Em7
  [110.00, 130.81, 164.81, 196.00], // Am7
];
const COOL_MELODY = [
  220.00, 261.63, 293.66, 311.13, 329.63, 392.00, 440.00, // A Minor Blues Pentatonic (with D# Blue note)
  523.25, 587.33, 622.25, 659.25, 783.99, 880.00          // Octave higher
];

// Helper to initialize AudioContext
function getAudioContext(): AudioContext {
  if (!audioCtx) {
    const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
    audioCtx = new AudioContextClass();
  }
  if (audioCtx.state === 'suspended') {
    audioCtx.resume();
  }
  return audioCtx;
}

// Function to synthesize a single cute marimba/music box note
function playMarimbaNote(ctx: AudioContext, frequency: number, time: number, duration = 0.4, volume = 0.15, type: OscillatorType = 'triangle') {
  const osc = ctx.createOscillator();
  const gain = ctx.createGain();

  // Cozy uses triangle wave for warm wooden tones; Happy uses sine/triangle mix; Cool uses sine/triangle
  osc.type = type;
  osc.frequency.setValueAtTime(frequency, time);

  // Soft attack, decay, release
  gain.gain.setValueAtTime(0, time);
  gain.gain.linearRampToValueAtTime(volume, time + 0.02);
  gain.gain.exponentialRampToValueAtTime(0.001, time + duration);

  osc.connect(gain);
  if (volumeNode) {
    gain.connect(volumeNode);
  } else {
    gain.connect(ctx.destination);
  }

  osc.start(time);
  osc.stop(time + duration);
}

// Function to play soft background synth pad chords
function playPadChords(ctx: AudioContext, frequencies: number[], time: number, duration = 1.6, volume = 0.08) {
  frequencies.forEach((freq) => {
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();

    // Sine wave for ultra-soft, warm background chords
    osc.type = 'sine';
    osc.frequency.setValueAtTime(freq, time);

    // Fade-in and fade-out
    gain.gain.setValueAtTime(0, time);
    gain.gain.linearRampToValueAtTime(volume / frequencies.length, time + 0.25);
    gain.gain.setValueAtTime(volume / frequencies.length, time + duration - 0.25);
    gain.gain.linearRampToValueAtTime(0, time + duration);

    osc.connect(gain);
    if (volumeNode) {
      gain.connect(volumeNode);
    } else {
      gain.connect(ctx.destination);
    }

    osc.start(time);
    osc.stop(time + duration);
  });
}

/**
 * Starts loopable background music with the active theme
 */
export function startBackgroundMusic() {
  if (isPlaying) return;
  
  try {
    const ctx = getAudioContext();
    isPlaying = true;

    // Create main master gain if not existing
    if (!volumeNode) {
      volumeNode = ctx.createGain();
      volumeNode.gain.setValueAtTime(0.4, ctx.currentTime);
      volumeNode.connect(ctx.destination);
    }

    // Determine speed and rhythm based on active theme
    let stepDuration = 0.4; // Default Cozy (100 BPM approx)
    if (activeTheme === 'happy') {
      stepDuration = 0.32; // Happy (120 BPM - upbeat!)
    } else if (activeTheme === 'cool') {
      stepDuration = 0.45; // Cool (90 BPM - laidback!)
    }
    
    // Beat scheduler
    musicInterval = setInterval(() => {
      const now = ctx.currentTime;
      
      let chords = COZY_CHORDS;
      let melody = COZY_MELODY;
      let oscType: OscillatorType = 'triangle';
      let chordVol = 0.05;
      let noteVol = 0.04;

      if (activeTheme === 'happy') {
        chords = HAPPY_CHORDS;
        melody = HAPPY_MELODY;
        oscType = 'sine'; // Super bright and pure chimes
        chordVol = 0.04;
        noteVol = 0.05;
      } else if (activeTheme === 'cool') {
        chords = COOL_CHORDS;
        melody = COOL_MELODY;
        oscType = 'triangle'; // Warm wood synth
        chordVol = 0.06;
        noteVol = 0.04;
      }

      const chordIndex = Math.floor(currentStep / 8) % chords.length;
      const isChordStart = currentStep % 8 === 0;

      // Play soft pad chords
      if (isChordStart) {
        playPadChords(ctx, chords[chordIndex], now, stepDuration * 8, chordVol);
      }

      // Play sparse melody notes based on theme
      let shouldPlayMelody = false;
      if (activeTheme === 'happy') {
        // Happy theme has a more active bouncy pattern (on even steps or sometimes odd steps)
        shouldPlayMelody = currentStep % 2 === 0 || (currentStep % 4 === 3 && Math.random() > 0.4);
      } else if (activeTheme === 'cool') {
        // Cool theme has a swing/syncopated groove (sometimes delayed)
        shouldPlayMelody = (currentStep % 2 === 0 && Math.random() > 0.3) || (currentStep % 8 === 5);
      } else {
        // Cozy cozy standard sparse notes
        shouldPlayMelody = currentStep % 2 === 0 && Math.random() > 0.35;
      }

      if (shouldPlayMelody) {
        const scaleIndex = Math.floor(Math.random() * melody.length);
        const pitch = melody[scaleIndex];
        const dur = activeTheme === 'happy' ? 0.25 : activeTheme === 'cool' ? 0.45 : 0.4;
        playMarimbaNote(ctx, pitch, now, dur, noteVol, oscType);
      }

      currentStep++;
    }, stepDuration * 1000);

  } catch (err) {
    console.warn('Web Audio background music failed to initialize:', err);
  }
}

/**
 * Stops background music
 */
export function stopBackgroundMusic() {
  isPlaying = false;
  if (musicInterval) {
    clearInterval(musicInterval);
    musicInterval = null;
  }
}

/**
 * Toggles background music state
 */
export function toggleBackgroundMusic(): boolean {
  if (isPlaying) {
    stopBackgroundMusic();
    return false;
  } else {
    startBackgroundMusic();
    return true;
  }
}

/**
 * Gets the current active music theme
 */
export function getActiveTheme(): MusicTheme {
  return activeTheme;
}

/**
 * Sets the active music theme and restarts the loop if currently playing
 */
export function setActiveMusicTheme(theme: MusicTheme) {
  activeTheme = theme;
  if (isPlaying) {
    stopBackgroundMusic();
    startBackgroundMusic();
  }
}

/**
 * Checks if music is currently playing
 */
export function isMusicPlaying(): boolean {
  return isPlaying;
}

/**
 * Play a cute "ding-ding!" sound for a correct answer
 */
export function playCorrectSound() {
  try {
    const ctx = getAudioContext();
    const now = ctx.currentTime;

    // Sweet arpeggio: C5 followed by G5
    playMarimbaNote(ctx, 523.25, now, 0.25, 0.15, 'triangle'); // C5
    playMarimbaNote(ctx, 783.99, now + 0.08, 0.35, 0.15, 'triangle'); // G5
  } catch (err) {
    // Fail silently if context not allowed
  }
}

/**
 * Play a gentle whimsical slide down for an incorrect answer
 */
export function playIncorrectSound() {
  try {
    const ctx = getAudioContext();
    const now = ctx.currentTime;

    // Plop slide down
    playMarimbaNote(ctx, 329.63, now, 0.15, 0.15, 'triangle'); // E4
    playMarimbaNote(ctx, 220.00, now + 0.1, 0.3, 0.12, 'triangle'); // A3
  } catch (err) {
    // Fail silently
  }
}

/**
 * Play an epic sparkling arpeggio for a combo reward (5, 10, 15...)
 */
export function playComboSound() {
  try {
    const ctx = getAudioContext();
    const now = ctx.currentTime;

    // Rising fantasy arpeggio (C Major Pentatonic upward sweep)
    const notes = [261.63, 329.63, 392.00, 523.25, 659.25, 783.99, 1046.50]; // C4, E4, G4, C5, E5, G5, C6
    notes.forEach((freq, i) => {
      playMarimbaNote(ctx, freq, now + i * 0.06, 0.3, 0.14, 'triangle');
    });
  } catch (err) {
    // Fail silently
  }
}
