/**
 * Every character a player can pick: species, colour variants and accessories.
 */

/** Species available in the picker, in display order. */
export const SPECIES = Object.freeze(["unicorn", "cat", "otter", "panda", "lizard", "giraffe", "elephant", "nazi", "dog", "raccoon"]);

/** Accessories available in the picker, in display order. */
export const ACCESSORIES = Object.freeze(["none", "partyHat", "topHat", "crown", "bow", "flower", "officerCap", "heartGlasses"]);

/** Emoji shown on each accessory button. */
export const ACCESSORY_ICONS = Object.freeze({
  none: "✖️",
  partyHat: "🥳",
  topHat: "🎩",
  crown: "👑",
  bow: "🎀",
  flower: "🌸",
  officerCap: "🪖",
  heartGlasses: "😍",
});

/**
 * @typedef {{ main: string, accent: string, light: string, mane?: string[] }} Palette
 * @typedef {{ species: string, variant: number, accessory: string }} Character
 */

/** Three colour variants per species: main fur, accent (ears, patches, shell…), light (muzzle, belly). */
export const PALETTES = Object.freeze({
  unicorn: [
    { main: "#ffffff", accent: "#ffd36e", light: "#ffe1ef", mane: ["#ffb3d9", "#c7b8ff", "#a8e6cf", "#ffd59e"] },
    { main: "#fdf6ff", accent: "#ffd36e", light: "#e8e0ff", mane: ["#a9dcff", "#c7b8ff", "#ffc2e2", "#c7b8ff"] },
    { main: "#fffdf5", accent: "#ffd36e", light: "#fff0c9", mane: ["#a8e6cf", "#ffb3d9", "#ffe39e", "#a8e6cf"] },
  ],
  cat: [
    { main: "#ffd9b0", accent: "#ffb3d1", light: "#fff3e6" },
    { main: "#dcd6ec", accent: "#ffb3d1", light: "#f6f3fb" },
    { main: "#b4a6c4", accent: "#ffc2dc", light: "#ece5f3" },
  ],
  otter: [
    { main: "#d9ad85", accent: "#b88a66", light: "#f6e3cf" },
    { main: "#cdb0e8", accent: "#a886c9", light: "#f1e8fb" },
    { main: "#9fd0ea", accent: "#6fadd0", light: "#e6f5fc" },
  ],
  panda: [
    { main: "#ffffff", accent: "#4a4058", light: "#ffe1ef" },
    { main: "#ffffff", accent: "#ff8cc0", light: "#ffe1ef" },
    { main: "#ffffff", accent: "#9d86f5", light: "#ece6ff" },
  ],
  lizard: [
    { main: "#a8e6a1", accent: "#6fcf7f", light: "#e6f9df" },
    { main: "#a9d8ff", accent: "#6fb6ef", light: "#e2f3ff" },
    { main: "#ffbedf", accent: "#ff8cc0", light: "#ffe6f2" },
  ],
  giraffe: [
    { main: "#ffe08a", accent: "#f5b45f", light: "#fff3d6" },
    { main: "#ffe6f0", accent: "#ff9ec7", light: "#ffffff" },
    { main: "#d6f5e6", accent: "#7fd6ad", light: "#f4fffa" },
  ],
  elephant: [
    { main: "#c9cfe8", accent: "#ffc2dc", light: "#e6e9f7" },
    { main: "#ffc8e4", accent: "#ff9ec7", light: "#ffe6f2" },
    { main: "#d9ccff", accent: "#ffc2dc", light: "#efe9ff" },
  ],
  nazi: [
    { main: "#ffe0c8", accent: "#9aa58c", light: "#bcc4ad" },
    { main: "#ffe0c8", accent: "#ffb3d9", light: "#ffd6ea" },
    { main: "#ffe0c8", accent: "#c7b8ff", light: "#e3d6ff" },
  ],
  dog: [
    { main: "#f5deb3", accent: "#d9a066", light: "#fff6e6" },
    { main: "#fffaf6", accent: "#c8a27c", light: "#ffffff" },
    { main: "#cfa483", accent: "#8f6a52", light: "#f3e1d3" },
  ],
  raccoon: [
    { main: "#c9c4d6", accent: "#5b4f6b", light: "#ffffff" },
    { main: "#e3d6f5", accent: "#9d86f5", light: "#ffffff" },
    { main: "#c5dcef", accent: "#5f7fa3", light: "#ffffff" },
  ],
});

/** Number of colour variants per species. */
export const VARIANT_COUNT = 3;

/** Species given to each new player slot, so players start with different characters. */
const DEFAULT_SPECIES_BY_SLOT = Object.freeze(["cat", "unicorn", "panda", "otter", "dog", "raccoon"]);

/**
 * Starting character of a player slot.
 * @param {number} index - player slot
 * @returns {Character} default character
 */
export function defaultCharacterFor(index) {
  return { species: DEFAULT_SPECIES_BY_SLOT[index % DEFAULT_SPECIES_BY_SLOT.length], variant: 0, accessory: "none" };
}

/**
 * Colours of a character.
 * @param {Character} character - character
 * @returns {Palette} its palette
 */
export function paletteFor(character) {
  return PALETTES[character.species][character.variant];
}

/**
 * Type guard for a persisted character.
 * @param {unknown} value - parsed value
 * @returns {boolean} true when the character exists in the catalog
 */
export function isCharacter(value) {
  if (typeof value !== "object" || value === null) return false;
  const { species, variant, accessory } = value;
  const variantOk = Number.isInteger(variant) && variant >= 0 && variant < VARIANT_COUNT;
  return SPECIES.includes(species) && ACCESSORIES.includes(accessory) && variantOk;
}
