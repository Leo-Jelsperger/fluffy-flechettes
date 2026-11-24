/**
 * Accessory shapes, drawn around the origin (0, 0) so they can be placed on
 * both face-on heads and side-view runners.
 */
import { CARICATURE_HAIR, LINE, THIN_OUTLINE } from "./svg-style.js";

const FLOWER_PETALS = Object.freeze([[0, -6], [5.7, -1.9], [3.5, 4.9], [-3.5, 4.9], [-5.7, -1.9]]);

/**
 * Builds the flower petals (five circles around a yellow heart).
 * @returns {string} SVG markup
 */
function flowerShape() {
  let petals = "";
  for (const [x, y] of FLOWER_PETALS) {
    petals += `<circle cx="${x}" cy="${y}" r="5" fill="#fff" stroke="${LINE}" stroke-width="2"/>`;
  }
  return `${petals}<circle r="4" fill="#ffe39e" stroke="${LINE}" stroke-width="2"/>`;
}

/** Head-top accessories; the origin is where they sit on the head. */
export const HEAD_SHAPES = Object.freeze({
  partyHat: `<path d="M-13 0 L0 -32 L13 0Z" fill="#ffb3d9" ${THIN_OUTLINE}/>
    <circle cx="-4" cy="-9" r="2.5" fill="#fff"/><circle cx="3" cy="-17" r="2" fill="#fff"/><circle cx="4" cy="-6" r="2" fill="#c7b8ff"/>
    <circle cy="-32" r="5" fill="#ffe39e" ${THIN_OUTLINE}/>`,
  topHat: `<path d="M-12 0 L-12 -26 Q0 -29 12 -26 L12 0Z" fill="#7a5c8f" ${THIN_OUTLINE}/>
    <rect x="-12" y="-9" width="24" height="6" fill="#ff9ec7"/>
    <ellipse rx="19" ry="5" fill="#7a5c8f" ${THIN_OUTLINE}/>`,
  officerCap: `<path d="M-20 -6 Q-23 -23 0 -27 Q25 -25 22 -8 Q8 -4 -20 -6Z" fill="#7d8a72" ${THIN_OUTLINE}/>
    <rect x="-17" y="-10" width="34" height="7" rx="2" fill="${CARICATURE_HAIR}"/>
    <path d="M-16 -2 Q1 7 19 -2 Q4 2 -16 -2Z" fill="#3a2e35" ${THIN_OUTLINE}/>
    <path d="M-14 -3.5 Q1 0.5 16 -3.5" fill="none" stroke="#e4e2ea" stroke-width="1.5"/>`,
  crown: `<path d="M-15 0 L-16 -17 L-8 -9 L0 -21 L8 -9 L16 -17 L15 0Z" fill="#ffd36e" ${THIN_OUTLINE}/>
    <circle cy="-6" r="3" fill="#ff8cc0"/><circle cx="-9" cy="-4" r="2" fill="#9fd4ff"/><circle cx="9" cy="-4" r="2" fill="#a8e6cf"/>`,
  bow: `<path d="M0 0 L-13 -8 L-13 8Z M0 0 L13 -8 L13 8Z" fill="#ff8cc0" ${THIN_OUTLINE}/><circle r="4" fill="#ffb3d9" ${THIN_OUTLINE}/>`,
  flower: flowerShape(),
});

/** One lens of each pair of glasses, centred on an eye. */
export const LENS_SHAPES = Object.freeze({
  heartGlasses: `<path d="M0 8 C-15 -2 -10 -14 0 -6 C10 -14 15 -2 0 8Z" fill="#ff7fbf" opacity=".92" ${THIN_OUTLINE}/>
    <ellipse cx="-4" cy="-4" rx="2.5" ry="1.5" fill="#fff" opacity=".8"/>`,
});

/** Accessories worn on the head top (the others are glasses). */
export const HEAD_ACCESSORIES = Object.freeze(["partyHat", "topHat", "officerCap", "crown"]);

/** Accessories worn on the side of the head. */
export const SIDE_ACCESSORIES = Object.freeze(["bow", "flower"]);

/** Outline used by the glasses bridge. */
export const BRIDGE_STYLE = `fill="none" stroke="${LINE}" stroke-width="2.5" stroke-linecap="round"`;
