/**
 * Shared drawing style of every character: outline colour and helpers.
 */

/** Soft plum outline used by every drawing. */
export const LINE = "#6b4c7a";

/** Pink cheeks. */
export const BLUSH = "#ff9ec7";

/** Hair and toothbrush-mustache colour of the caricature, the same in every variant. */
export const CARICATURE_HAIR = "#4a3a3a";

/** Fixed colours of the peaked officer cap (the crown colour varies). */
export const CAP = Object.freeze({ BAND: CARICATURE_HAIR, VISOR: "#3a2e35", CORD: "#e4e2ea" });

/** Light-blue tear for sad faces. */
export const TEAR = "#8fd3ff";

/** Fill + outline attributes for a closed shape. */
export const OUTLINE = `stroke="${LINE}" stroke-width="3" stroke-linejoin="round"`;

/** Thinner outline for small details (muzzles, knobs). */
export const THIN_OUTLINE = `stroke="${LINE}" stroke-width="2.5" stroke-linejoin="round"`;

/**
 * Ring of rounded spikes radiating from a centre (the lizard's frill).
 * Spikes alternate between the two colours.
 * @param {{ cx: number, cy: number, radius: number, anglesDeg: readonly number[], rx: number, ry: number, colors: [string, string] }} params - centre, distance, spike directions and size, colours
 * @returns {string} SVG markup
 */
export function radialSpikes(params) {
  const { cx, cy, radius, anglesDeg, rx, ry, colors } = params;
  let spikes = "";
  for (const [index, angleDeg] of anglesDeg.entries()) {
    const angle = (angleDeg * Math.PI) / 180;
    const x = (cx + Math.cos(angle) * radius).toFixed(1);
    const y = (cy + Math.sin(angle) * radius).toFixed(1);
    spikes += `<ellipse cx="${x}" cy="${y}" rx="${rx}" ry="${ry}" transform="rotate(${angleDeg + 90} ${x} ${y})" fill="${colors[index % 2]}" ${OUTLINE}/>`;
  }
  return spikes;
}

/**
 * Draws a path as a thick outlined line (outline stroke under a coloured stroke),
 * used for tails, trunks and necks.
 * @param {{ d: string, color: string, width: number }} params - path data, fill colour, inner width
 * @returns {string} SVG markup
 */
export function outlinedStroke(params) {
  const { d, color, width } = params;
  return `<path d="${d}" fill="none" stroke="${LINE}" stroke-width="${width + 5}" stroke-linecap="round"/>
    <path d="${d}" fill="none" stroke="${color}" stroke-width="${width}" stroke-linecap="round"/>`;
}
