/**
 * The app's sound palette: one cute synthesized sound per animation event.
 */
import { noteHz, playNoise, playNotes } from "./synth.js";

/** MIDI numbers of the notes used below (C major, bright octaves). */
const NOTE = Object.freeze({
  E4: 64, F4: 65, FS4: 66, G4: 67, C5: 72, E5: 76, G5: 79, A5: 81,
  C6: 84, D6: 86, E6: 88, G6: 91, A6: 93, B6: 95, C7: 96, E7: 100,
});

/** Notes picked at random for sparkles and shimmers. */
const SPARKLE_NOTES = Object.freeze([NOTE.C7, NOTE.E7, NOTE.G6, NOTE.A6, NOTE.E6]);

const SHIMMER = Object.freeze({ COUNT: 14, SPREAD_S: 1.4 });

/** Small random pitch change so repeated sounds don't feel robotic. */
const PITCH_JITTER = 0.06;

/**
 * Frequency of a note with a little random detune.
 * @param {number} midi - MIDI note
 * @returns {number} frequency in Hz
 */
function jittered(midi) {
  return noteHz(midi) * (1 + (Math.random() - 0.5) * PITCH_JITTER);
}

/**
 * Notes of a quick rising arpeggio.
 * @param {{ midis: number[], step: number, duration: number, type: OscillatorType, volume: number, at?: number }} params - notes and timing in seconds
 * @returns {import("./synth.js").Note[]} the notes
 */
function arpeggio(params) {
  const start = params.at ?? 0;
  return params.midis.map((midi, index) => ({
    freq: noteHz(midi),
    at: start + index * params.step,
    duration: params.duration,
    type: params.type,
    volume: params.volume,
  }));
}

/**
 * Random high "ting"s spread over time, like fairy dust.
 * @param {{ at: number, count: number, spread: number }} params - start, number of tings, duration in seconds
 * @returns {void}
 */
function shimmer(params) {
  const notes = [];
  for (let i = 0; i < params.count; i += 1) {
    const midi = SPARKLE_NOTES[Math.floor(Math.random() * SPARKLE_NOTES.length)];
    notes.push({ freq: jittered(midi), at: params.at + Math.random() * params.spread, duration: 0.25, volume: 0.08 });
  }
  playNotes(notes);
}

/** Named sounds, one per animation event. */
export const SOUND = Object.freeze({
  /** Any plain dart: a bubbly pop. */
  pop: () => playNotes([{ freq: jittered(NOTE.A5), slideTo: noteHz(NOTE.E6), duration: 0.09, volume: 0.25 }]),

  /** Missed dart: a deflating "bwomp" and a puff. */
  miss: () => {
    playNotes([{ freq: 330, slideTo: 110, duration: 0.4, type: "triangle", volume: 0.3 }]);
    playNoise({ duration: 0.3, volume: 0.15, from: 1200, to: 300 });
  },

  /** Double: a two-note bling. */
  double: () => playNotes(arpeggio({ midis: [NOTE.E6, NOTE.B6], step: 0.08, duration: 0.25, type: "triangle", volume: 0.25 })),

  /** Triple: a sparkly arpeggio and a springy boing as the character jumps out. */
  triple: () => {
    playNotes(arpeggio({ midis: [NOTE.C6, NOTE.E6, NOTE.G6, NOTE.C7], step: 0.06, duration: 0.3, type: "triangle", volume: 0.22 }));
    playNotes([{ freq: 220, slideTo: 660, duration: 0.25, at: 0.05, volume: 0.15 }]);
    shimmer({ at: 0.2, count: 4, spread: 0.3 });
  },

  /** Outer bull (25): a soft flower chime. */
  outerBull: () => playNotes([
    { freq: noteHz(NOTE.A5), duration: 0.6, volume: 0.18 },
    { freq: noteHz(NOTE.E6), duration: 0.6, at: 0.05, volume: 0.15 },
    { freq: noteHz(NOTE.A6), duration: 0.5, at: 0.1, volume: 0.1 },
  ]),

  /** Bull (50): a little fanfare. */
  bull: () => {
    playNotes(arpeggio({ midis: [NOTE.G5, NOTE.C6, NOTE.E6, NOTE.G6], step: 0.07, duration: 0.18, type: "square", volume: 0.09 }));
    playNotes([{ freq: noteHz(NOTE.C7), at: 0.3, duration: 0.6, type: "triangle", volume: 0.25 }]);
    shimmer({ at: 0.3, count: 6, spread: 0.6 });
  },

  /** Turn of 50+: a happy chord. */
  niceTurn: () => playNotes(arpeggio({ midis: [NOTE.C6, NOTE.E6, NOTE.G6], step: 0.04, duration: 0.45, type: "triangle", volume: 0.18 })),

  /** Turn of 100+: a whistle going up, then a chime. */
  ton: () => {
    playNotes([{ freq: 400, slideTo: 1600, duration: 0.4, volume: 0.18 }]);
    playNotes(arpeggio({ midis: [NOTE.C6, NOTE.E6, NOTE.G6, NOTE.C7], step: 0.05, duration: 0.6, at: 0.4, type: "triangle", volume: 0.18 }));
  },

  /** Turn of 140+: the same, bigger, with fairy dust. */
  parade: () => {
    SOUND.ton();
    shimmer({ at: 0.6, count: SHIMMER.COUNT, spread: SHIMMER.SPREAD_S });
  },

  /** 180: a full fanfare and lots of fairy dust. */
  maxTurn: () => {
    playNotes(arpeggio({ midis: [NOTE.C5, NOTE.E5, NOTE.G5, NOTE.C6], step: 0.11, duration: 0.16, type: "square", volume: 0.1 }));
    playNotes([
      { freq: noteHz(NOTE.G5), at: 0.5, duration: 1.1, type: "square", volume: 0.07 },
      { freq: noteHz(NOTE.C6), at: 0.5, duration: 1.1, type: "triangle", volume: 0.22 },
      { freq: noteHz(NOTE.E6), at: 0.5, duration: 1.1, type: "triangle", volume: 0.18 },
    ]);
    shimmer({ at: 0.5, count: SHIMMER.COUNT * 2, spread: SHIMMER.SPREAD_S * 1.5 });
  },

  /** Bust: a sad little trombone. */
  bust: () => playNotes([
    { freq: noteHz(NOTE.G4), duration: 0.3, type: "triangle", volume: 0.3 },
    { freq: noteHz(NOTE.FS4), at: 0.3, duration: 0.3, type: "triangle", volume: 0.3 },
    { freq: noteHz(NOTE.F4), at: 0.6, duration: 0.3, type: "triangle", volume: 0.3 },
    { freq: noteHz(NOTE.E4), at: 0.9, duration: 0.9, type: "triangle", volume: 0.3, vibrato: 8 },
  ]),

  /** A character starts running: a cheerful "wheee". */
  whee: () => playNotes([{ freq: jittered(NOTE.G5), slideTo: noteHz(NOTE.D6) * 1.5, duration: 0.3, volume: 0.12 }]),

  /** Victory: a winning melody and a final chord. */
  win: () => {
    playNotes(arpeggio({ midis: [NOTE.C5, NOTE.E5, NOTE.G5, NOTE.C6, NOTE.E6, NOTE.G6], step: 0.1, duration: 0.2, type: "triangle", volume: 0.22 }));
    playNotes([
      { freq: noteHz(NOTE.C6), at: 0.65, duration: 1.4, type: "triangle", volume: 0.2 },
      { freq: noteHz(NOTE.E6), at: 0.65, duration: 1.4, type: "triangle", volume: 0.16 },
      { freq: noteHz(NOTE.G6), at: 0.65, duration: 1.4, type: "triangle", volume: 0.14 },
      { freq: noteHz(NOTE.C7), at: 0.65, duration: 1.4, volume: 0.12 },
    ]);
    shimmer({ at: 0.6, count: SHIMMER.COUNT * 2, spread: SHIMMER.SPREAD_S * 2 });
  },
});
