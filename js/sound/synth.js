/**
 * Tiny Web Audio synthesizer: every sound is generated on the fly (no audio
 * files), so it works offline and weighs nothing. Browsers only allow audio
 * after a user gesture, hence `unlockAudio()` on the first tap.
 */

const MASTER_VOLUME = 0.7;
const ATTACK_S = 0.012;
const SILENCE = 0.0001;
/** Wobble speed of notes with vibrato (the sad trombone). */
const VIBRATO_HZ = 6;
const A4 = Object.freeze({ MIDI: 69, HZ: 440 });
const SEMITONES_PER_OCTAVE = 12;

/** @type {AudioContext | null} */
let context = null;

/** @type {AudioNode | null} */
let output = null;

let enabled = true;

/**
 * @typedef {{ freq: number, at?: number, duration: number, type?: OscillatorType, volume?: number, slideTo?: number, vibrato?: number }} Note
 */

/**
 * Creates (or resumes) the audio context. Must run inside a user gesture.
 * @returns {void}
 */
export function unlockAudio() {
  if (typeof window === "undefined" || !("AudioContext" in window)) return;
  if (!context) {
    context = new AudioContext();
    const master = context.createGain();
    master.gain.value = MASTER_VOLUME;
    const limiter = context.createDynamicsCompressor();
    master.connect(limiter);
    limiter.connect(context.destination);
    output = master;
  }
  if (context.state === "suspended") void context.resume();
}

/**
 * Turns every sound on or off.
 * @param {boolean} on - true to play sounds
 * @returns {void}
 */
export function setSoundEnabled(on) {
  enabled = on;
}

/**
 * Frequency of a MIDI note number.
 * @param {number} midi - MIDI note (60 = middle C)
 * @returns {number} frequency in Hz
 */
export function noteHz(midi) {
  return A4.HZ * 2 ** ((midi - A4.MIDI) / SEMITONES_PER_OCTAVE);
}

/**
 * Whether sounds can be played right now.
 * @returns {boolean} true when enabled and the context is unlocked
 */
function canPlay() {
  return enabled && context !== null && output !== null;
}

/**
 * Plays one note with a soft attack and a fading tail.
 * @param {Note} note - pitch, timing and colour (times in seconds from now)
 * @returns {void}
 */
function playNote(note) {
  const start = context.currentTime + (note.at ?? 0);
  const end = start + note.duration;
  const oscillator = context.createOscillator();
  const gain = context.createGain();
  oscillator.type = note.type ?? "sine";
  oscillator.frequency.setValueAtTime(note.freq, start);
  if (note.slideTo) oscillator.frequency.exponentialRampToValueAtTime(note.slideTo, end);
  if (note.vibrato) {
    const lfo = context.createOscillator();
    const depth = context.createGain();
    lfo.frequency.value = VIBRATO_HZ;
    depth.gain.value = note.vibrato;
    lfo.connect(depth);
    depth.connect(oscillator.frequency);
    lfo.start(start);
    lfo.stop(end);
  }
  gain.gain.setValueAtTime(SILENCE, start);
  gain.gain.exponentialRampToValueAtTime(note.volume ?? 0.3, start + ATTACK_S);
  gain.gain.exponentialRampToValueAtTime(SILENCE, end);
  oscillator.connect(gain);
  gain.connect(output);
  oscillator.start(start);
  oscillator.stop(end + ATTACK_S);
}

/**
 * Plays several notes (a melody, a chord or both).
 * @param {Note[]} notes - notes to play
 * @returns {void}
 */
export function playNotes(notes) {
  if (!canPlay()) return;
  for (const note of notes) playNote(note);
}

/**
 * Short filtered noise burst (puffs, whooshes).
 * @param {{ at?: number, duration: number, volume: number, from: number, to: number }} params - timing, loudness and filter sweep in Hz
 * @returns {void}
 */
export function playNoise(params) {
  if (!canPlay()) return;
  const start = context.currentTime + (params.at ?? 0);
  const end = start + params.duration;
  const length = Math.ceil(context.sampleRate * params.duration);
  const buffer = context.createBuffer(1, length, context.sampleRate);
  const samples = buffer.getChannelData(0);
  for (let i = 0; i < length; i += 1) samples[i] = Math.random() * 2 - 1;
  const source = context.createBufferSource();
  source.buffer = buffer;
  const filter = context.createBiquadFilter();
  filter.type = "bandpass";
  filter.frequency.setValueAtTime(params.from, start);
  filter.frequency.exponentialRampToValueAtTime(params.to, end);
  const gain = context.createGain();
  gain.gain.setValueAtTime(SILENCE, start);
  gain.gain.exponentialRampToValueAtTime(params.volume, start + ATTACK_S * 2);
  gain.gain.exponentialRampToValueAtTime(SILENCE, end);
  source.connect(filter);
  filter.connect(gain);
  gain.connect(output);
  source.start(start);
  source.stop(end);
}
