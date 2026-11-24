/**
 * Checkout suggestions: the shortest way to finish a score with the darts left.
 */
import { BULL_SEGMENT, MAX_NUMBER_SEGMENT, MULTIPLIER, dartScore } from "./game.js";

/** Highest score that can be finished in three darts (T20 T20 Bull). */
export const MAX_CHECKOUT = 170;

/** Doubles players usually aim to finish on, best first (they halve cleanly). */
const PREFERRED_DOUBLES = Object.freeze([20, 16, 8, 10, 18, 12, 4, 6, 2, 14, 19, 17, 15, 13, 11, 9, 7, 5, 3, 1]);

/**
 * Lists the setup darts in preference order: triples high to low, bulls, singles.
 * @returns {import("./game.js").Dart[]} setup darts
 */
function buildSetupDarts() {
  const darts = [];
  for (let segment = MAX_NUMBER_SEGMENT; segment >= 1; segment -= 1) {
    darts.push({ segment, multiplier: MULTIPLIER.TRIPLE });
  }
  darts.push({ segment: BULL_SEGMENT, multiplier: MULTIPLIER.DOUBLE });
  darts.push({ segment: BULL_SEGMENT, multiplier: MULTIPLIER.SINGLE });
  for (let segment = MAX_NUMBER_SEGMENT; segment >= 1; segment -= 1) {
    darts.push({ segment, multiplier: MULTIPLIER.SINGLE });
  }
  return darts;
}

/**
 * Lists the darts allowed to finish, best first.
 * @param {boolean} doubleOut - whether the last dart must be a double
 * @returns {import("./game.js").Dart[]} finishing darts
 */
function buildFinishingDarts(doubleOut) {
  const doubles = PREFERRED_DOUBLES.map((segment) => ({ segment, multiplier: MULTIPLIER.DOUBLE }));
  const bull = { segment: BULL_SEGMENT, multiplier: MULTIPLIER.DOUBLE };
  if (doubleOut) return [...doubles, bull];
  return [...SETUP_DARTS, ...doubles];
}

const SETUP_DARTS = Object.freeze(buildSetupDarts());
const FINISHES = Object.freeze({
  DOUBLE_OUT: Object.freeze(buildFinishingDarts(true)),
  ANY_OUT: Object.freeze(buildFinishingDarts(false)),
});

/**
 * Depth-limited search for a checkout using exactly `dartCount` darts.
 * @param {{ remaining: number, dartCount: number, finishes: import("./game.js").Dart[] }} params - target, depth, finishing darts
 * @returns {import("./game.js").Dart[] | null} the darts, or null if impossible
 */
function searchCheckout(params) {
  const { remaining, dartCount, finishes } = params;
  if (dartCount === 1) {
    const finish = finishes.find((dart) => dartScore(dart) === remaining);
    return finish ? [finish] : null;
  }
  for (const setup of SETUP_DARTS) {
    const rest = remaining - dartScore(setup);
    if (rest <= 0) continue;
    const tail = searchCheckout({ remaining: rest, dartCount: dartCount - 1, finishes });
    if (tail) return [setup, ...tail];
  }
  return null;
}

/**
 * Suggests the shortest checkout for a score.
 * @param {{ remaining: number, dartsLeft: number, doubleOut: boolean }} params - score left, darts left this turn, finish rule
 * @returns {import("./game.js").Dart[] | null} suggested darts, or null when no finish is possible this turn
 */
export function suggestCheckout(params) {
  const { remaining, dartsLeft, doubleOut } = params;
  if (remaining <= 0 || remaining > MAX_CHECKOUT) return null;
  const finishes = doubleOut ? FINISHES.DOUBLE_OUT : FINISHES.ANY_OUT;
  for (let dartCount = 1; dartCount <= dartsLeft; dartCount += 1) {
    const darts = searchCheckout({ remaining, dartCount, finishes });
    if (darts) return darts;
  }
  return null;
}
