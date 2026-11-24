/**
 * Pure X01 darts rules: dart scoring, bust/checkout detection, and a replay
 * reducer that rebuilds the whole game from the ordered list of thrown darts.
 * Keeping the darts as the single source of truth makes "undo" trivial.
 */

/** Number of darts a player throws per turn. */
export const DARTS_PER_TURN = 3;

/** Value of the outer bull; the inner bull counts as its double (50). */
export const BULL_SEGMENT = 25;

/** Segment used to record a dart that missed the scoring area. */
export const MISS_SEGMENT = 0;

/** Highest numbered segment on the board. */
export const MAX_NUMBER_SEGMENT = 20;

/** Dart multipliers (single, double and triple rings). */
export const MULTIPLIER = Object.freeze({ SINGLE: 1, DOUBLE: 2, TRIPLE: 3 });

/** Start scores offered for an X01 game. */
export const START_SCORES = Object.freeze([301, 501, 701]);

/** Result of a single dart within its turn. */
export const OUTCOME = Object.freeze({
  CONTINUE: "continue",
  BUST: "bust",
  CHECKOUT: "checkout",
});

/** In double-out, a score of 1 can never be finished: no double is worth 1. */
const UNFINISHABLE_DOUBLE_OUT_SCORE = 1;

/** @typedef {{ segment: number, multiplier: number }} Dart */
/** @typedef {{ name: string }} Player */
/** @typedef {{ players: Player[], startScore: number, doubleOut: boolean, starterIndex: number }} GameConfig */
/** @typedef {{ playerIndex: number, darts: Dart[], total: number, bust: boolean, checkout: boolean }} TurnRecord */
/**
 * Scores are the start-of-turn scores; the current turn's darts are kept
 * apart until the turn closes, so a bust simply discards them.
 * @typedef {{ scores: number[], currentPlayer: number, turnDarts: Dart[], turns: TurnRecord[], winner: number | null }} GameState
 */

/**
 * Points scored by one dart.
 * @param {Dart} dart - the dart thrown
 * @returns {number} segment times multiplier
 */
export function dartScore(dart) {
  return dart.segment * dart.multiplier;
}

/**
 * Total points of several darts.
 * @param {Dart[]} darts - darts to add up
 * @returns {number} sum of their scores
 */
export function sumDarts(darts) {
  let total = 0;
  for (const dart of darts) {
    total += dartScore(dart);
  }
  return total;
}

/**
 * Whether a dart can exist on a real board (no triple bull, no double miss).
 * @param {Dart} dart - candidate dart
 * @returns {boolean} true when the segment/multiplier pair is legal
 */
export function isValidDart(dart) {
  const { segment, multiplier } = dart;
  if (!Number.isInteger(segment) || !Number.isInteger(multiplier)) return false;
  if (multiplier < MULTIPLIER.SINGLE || multiplier > MULTIPLIER.TRIPLE) return false;
  if (segment === MISS_SEGMENT) return multiplier === MULTIPLIER.SINGLE;
  if (segment === BULL_SEGMENT) return multiplier !== MULTIPLIER.TRIPLE;
  return segment >= 1 && segment <= MAX_NUMBER_SEGMENT;
}

/**
 * Whether a dart is allowed to end the game.
 * @param {{ dart: Dart, doubleOut: boolean }} params - dart and finish rule
 * @returns {boolean} true when this dart may bring the score to exactly 0
 */
export function isFinishingDart(params) {
  if (!params.doubleOut) return true;
  return params.dart.multiplier === MULTIPLIER.DOUBLE;
}

/**
 * Decides what a dart does to the turn, given the score left after it.
 * @param {{ remaining: number, dart: Dart, doubleOut: boolean }} params - score after the dart, the dart, finish rule
 * @returns {string} one of OUTCOME
 */
export function classifyDart(params) {
  const { remaining, dart, doubleOut } = params;
  if (remaining < 0) return OUTCOME.BUST;
  if (remaining === 0) {
    return isFinishingDart({ dart, doubleOut }) ? OUTCOME.CHECKOUT : OUTCOME.BUST;
  }
  if (doubleOut && remaining === UNFINISHABLE_DOUBLE_OUT_SCORE) return OUTCOME.BUST;
  return OUTCOME.CONTINUE;
}

/**
 * Fresh game state before any dart is thrown.
 * @param {GameConfig} config - players and rules
 * @returns {GameState} every player at the start score, starter to throw
 */
export function createInitialState(config) {
  return {
    scores: config.players.map(() => config.startScore),
    currentPlayer: config.starterIndex,
    turnDarts: [],
    turns: [],
    winner: null,
  };
}

/**
 * Closes the current turn: records it, applies or discards its points and
 * hands over to the next player (or crowns the winner).
 * @param {{ state: GameState, turnDarts: Dart[], outcome: string, remaining: number, playerCount: number }} params - turn data
 * @returns {GameState} state at the start of the next turn
 */
function closeTurn(params) {
  const { state, turnDarts, outcome, remaining, playerCount } = params;
  const bust = outcome === OUTCOME.BUST;
  const checkout = outcome === OUTCOME.CHECKOUT;
  const player = state.currentPlayer;
  const turn = {
    playerIndex: player,
    darts: turnDarts,
    total: bust ? 0 : sumDarts(turnDarts),
    bust,
    checkout,
  };
  const scores = state.scores.map((score, index) => (index === player && !bust ? remaining : score));
  const nextPlayer = (player + 1) % playerCount;
  return {
    scores,
    currentPlayer: checkout ? player : nextPlayer,
    turnDarts: [],
    turns: [...state.turns, turn],
    winner: checkout ? player : null,
  };
}

/**
 * Applies one dart to the game. Darts thrown after the game is won are ignored.
 * @param {{ state: GameState, dart: Dart, config: GameConfig }} params - current state, dart, rules
 * @returns {GameState} new state (the input is never mutated)
 */
export function applyDart(params) {
  const { state, dart, config } = params;
  if (state.winner !== null) return state;
  const turnDarts = [...state.turnDarts, dart];
  const remaining = state.scores[state.currentPlayer] - sumDarts(turnDarts);
  const outcome = classifyDart({ remaining, dart, doubleOut: config.doubleOut });
  if (outcome === OUTCOME.CONTINUE && turnDarts.length < DARTS_PER_TURN) {
    return { ...state, turnDarts };
  }
  return closeTurn({ state, turnDarts, outcome, remaining, playerCount: config.players.length });
}

/**
 * Rebuilds the full game state from its config and every dart thrown so far.
 * @param {{ config: GameConfig, darts: Dart[] }} game - persisted game
 * @returns {GameState} current state
 */
export function replayGame(game) {
  let state = createInitialState(game.config);
  for (const dart of game.darts) {
    state = applyDart({ state, dart, config: game.config });
  }
  return state;
}

/**
 * Score a player still has to make, including the darts of the turn in progress.
 * @param {{ state: GameState, playerIndex: number }} params - state and player
 * @returns {number} points left
 */
export function remainingFor(params) {
  const { state, playerIndex } = params;
  const isThrowing = playerIndex === state.currentPlayer && state.winner === null;
  const inProgress = isThrowing ? sumDarts(state.turnDarts) : 0;
  return state.scores[playerIndex] - inProgress;
}

/**
 * Average points per completed turn (busts count as 0).
 * @param {{ state: GameState, playerIndex: number }} params - state and player
 * @returns {number | null} average, or null before the player's first turn
 */
export function averageFor(params) {
  let total = 0;
  let count = 0;
  for (const turn of params.state.turns) {
    if (turn.playerIndex !== params.playerIndex) continue;
    total += turn.total;
    count += 1;
  }
  return count === 0 ? null : total / count;
}

/**
 * Number of turns a player has completed.
 * @param {{ state: GameState, playerIndex: number }} params - state and player
 * @returns {number} completed turns
 */
export function turnCountFor(params) {
  let count = 0;
  for (const turn of params.state.turns) {
    if (turn.playerIndex === params.playerIndex) count += 1;
  }
  return count;
}
