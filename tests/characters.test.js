import { describe, it } from "node:test";
import assert from "node:assert/strict";
import { ACCESSORIES, PALETTES, SPECIES, VARIANT_COUNT, isCharacter } from "../js/characters/character-catalog.js";
import { MOOD, characterProfileSvg, characterSvg } from "../js/characters/character-svg.js";
import { addPlayer, createDefaultAppState, openPicker, startGame, updatePickedCharacter } from "../js/app-actions.js";

const everyCharacter = () => {
  const characters = [];
  for (const species of SPECIES) {
    for (let variant = 0; variant < VARIANT_COUNT; variant += 1) {
      for (const accessory of ACCESSORIES) characters.push({ species, variant, accessory });
    }
  }
  return characters;
};

describe("character catalog", () => {
  it("offers ten species with three colour variants each", () => {
    assert.equal(SPECIES.length, 10);
    for (const species of SPECIES) assert.equal(PALETTES[species].length, VARIANT_COUNT, species);
  });

  it("rejects unknown species, variants and accessories", () => {
    assert.equal(isCharacter({ species: "dragon", variant: 0, accessory: "none" }), false);
    assert.equal(isCharacter({ species: "cat", variant: VARIANT_COUNT, accessory: "none" }), false);
    assert.equal(isCharacter({ species: "cat", variant: 0, accessory: "cape" }), false);
    assert.equal(isCharacter({ species: "cat", variant: 0, accessory: "crown" }), true);
  });
});

describe("character drawings", () => {
  it("draws every combination face-on and from the side without missing values", () => {
    for (const character of everyCharacter()) {
      for (const mood of Object.values(MOOD)) {
        const svg = characterSvg({ character, mood });
        assert.doesNotMatch(svg, /undefined|NaN/, `${JSON.stringify(character)} ${mood}`);
      }
      assert.doesNotMatch(characterProfileSvg(character), /undefined|NaN/, JSON.stringify(character));
    }
  });
});

describe("character picking", () => {
  it("edits only the player opened in the picker and carries the pick into the game", () => {
    const app = openPicker({ app: createDefaultAppState(), index: 1 });
    const picked = updatePickedCharacter({ app, patch: { species: "giraffe", accessory: "crown" } });
    assert.deepEqual(picked.setup.players[1].character, { species: "giraffe", variant: 0, accessory: "crown" });
    assert.deepEqual(picked.setup.players[0].character, app.setup.players[0].character);
    const game = startGame(picked).game;
    assert.equal(game.config.players[1].character.species, "giraffe");
  });

  it("gives a new player a species nobody has yet", () => {
    const app = addPlayer(createDefaultAppState());
    const species = app.setup.players.map((player) => player.character.species);
    assert.equal(new Set(species).size, species.length);
  });
});
