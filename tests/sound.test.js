import { describe, it } from "node:test";
import assert from "node:assert/strict";
import { SOUND } from "../js/sound/sounds.js";
import { noteHz, unlockAudio } from "../js/sound/synth.js";
import { createDefaultAppState, toggleSound } from "../js/app-actions.js";

describe("sounds", () => {
  it("tunes A4 to 440 Hz and an octave doubles the frequency", () => {
    assert.equal(noteHz(69), 440);
    assert.equal(noteHz(81), 880);
  });

  it("stays silent instead of throwing when audio was never unlocked", () => {
    unlockAudio();
    for (const play of Object.values(SOUND)) assert.doesNotThrow(play);
  });

  it("starts with sound on and toggles it", () => {
    const app = createDefaultAppState();
    assert.equal(app.soundOn, true);
    assert.equal(toggleSound(app).soundOn, false);
  });
});
