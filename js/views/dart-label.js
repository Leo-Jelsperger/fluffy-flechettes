/**
 * Short board notation for a dart: "20", "D16", "T20", "25", "Bull", "Raté".
 */
import { BULL_SEGMENT, MISS_SEGMENT, MULTIPLIER } from "../game.js";
import { t } from "../messages.js";

const RING_PREFIX = Object.freeze({ [MULTIPLIER.SINGLE]: "", [MULTIPLIER.DOUBLE]: "D", [MULTIPLIER.TRIPLE]: "T" });

/**
 * Formats a dart in board notation.
 * @param {import("../game.js").Dart} dart - dart to format
 * @returns {string} label
 */
export function formatDart(dart) {
  if (dart.segment === MISS_SEGMENT) return t("dart_miss");
  if (dart.segment === BULL_SEGMENT) {
    return dart.multiplier === MULTIPLIER.DOUBLE ? t("dart_bull") : String(BULL_SEGMENT);
  }
  return `${RING_PREFIX[dart.multiplier]}${dart.segment}`;
}
