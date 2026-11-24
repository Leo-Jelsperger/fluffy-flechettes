/**
 * App state transitions. Every function returns a new app state and never
 * mutates its input; main.js wires them to the UI.
 */
import { BULL_SEGMENT, MISS_SEGMENT, MULTIPLIER, isValidDart, replayGame } from "./game.js";
import { SPECIES, defaultCharacterFor } from "./characters/character-catalog.js";
import { t } from "./messages.js";

/** Screens of the app. */
export const SCREEN = Object.freeze({ SETUP: "setup", GAME: "game" });

/** Player count bounds on the setup screen. */
export const PLAYER_LIMITS = Object.freeze({ MIN: 1, MAX: 6 });

const DEFAULT_START_SCORE = 501;
const DEFAULT_PLAYER_COUNT = 2;

/**
 * @typedef {import("./characters/character-catalog.js").Character} Character
 * @typedef {{ name: string, character: Character }} SetupPlayer
 * @typedef {{ players: SetupPlayer[], startScore: number, doubleOut: boolean }} SetupState
 * @typedef {{ config: import("./game.js").GameConfig, darts: import("./game.js").Dart[] }} Game
 * @typedef {{ screen: string, setup: SetupState, game: Game | null, modifier: number, picker: number | null, soundOn: boolean }} AppState
 */

/**
 * App state on first launch.
 * @returns {AppState} two players, 501, no double-out
 */
export function createDefaultAppState() {
  const players = [];
  for (let index = 0; index < DEFAULT_PLAYER_COUNT; index += 1) {
    players.push({ name: "", character: defaultCharacterFor(index) });
  }
  return {
    screen: SCREEN.SETUP,
    setup: { players, startScore: DEFAULT_START_SCORE, doubleOut: false },
    game: null,
    modifier: MULTIPLIER.SINGLE,
    picker: null,
    soundOn: true,
  };
}

/**
 * Turns the sounds on or off.
 * @param {AppState} app - current state
 * @returns {AppState} new state
 */
export function toggleSound(app) {
  return { ...app, soundOn: !app.soundOn };
}

/**
 * Character for a new player: the first species nobody has picked yet.
 * @param {SetupPlayer[]} players - current players
 * @returns {Character} a character
 */
function nextFreeCharacter(players) {
  const used = new Set(players.map((player) => player.character.species));
  const species = SPECIES.find((candidate) => !used.has(candidate));
  if (!species) return defaultCharacterFor(players.length);
  return { species, variant: 0, accessory: "none" };
}

/**
 * Replaces one setup player.
 * @param {{ app: AppState, index: number, player: SetupPlayer }} params - state, slot, new player
 * @returns {AppState} new state
 */
function withPlayer(params) {
  const { app, index, player } = params;
  const players = app.setup.players.map((current, position) => (position === index ? player : current));
  return { ...app, setup: { ...app.setup, players } };
}

/**
 * Adds a player slot (up to the maximum).
 * @param {AppState} app - current state
 * @returns {AppState} new state
 */
export function addPlayer(app) {
  const { players } = app.setup;
  if (players.length >= PLAYER_LIMITS.MAX) return app;
  const player = { name: "", character: nextFreeCharacter(players) };
  return { ...app, setup: { ...app.setup, players: [...players, player] } };
}

/**
 * Removes a player slot (keeping at least one).
 * @param {{ app: AppState, index: number }} params - state and slot
 * @returns {AppState} new state
 */
export function removePlayer(params) {
  const { app, index } = params;
  if (app.setup.players.length <= PLAYER_LIMITS.MIN) return app;
  const players = app.setup.players.filter((_, position) => position !== index);
  return { ...app, setup: { ...app.setup, players } };
}

/**
 * Renames a player slot.
 * @param {{ app: AppState, index: number, name: string }} params - state, slot, new name
 * @returns {AppState} new state
 */
export function renamePlayer(params) {
  const { app, index, name } = params;
  return withPlayer({ app, index, player: { ...app.setup.players[index], name } });
}

/**
 * Opens the character picker for a player.
 * @param {{ app: AppState, index: number }} params - state and slot
 * @returns {AppState} new state
 */
export function openPicker(params) {
  return { ...params.app, picker: params.index };
}

/**
 * Closes the character picker.
 * @param {AppState} app - current state
 * @returns {AppState} new state
 */
export function closePicker(app) {
  return { ...app, picker: null };
}

/**
 * Changes part of the character of the player being edited in the picker.
 * @param {{ app: AppState, patch: Partial<Character> }} params - state and changed fields
 * @returns {AppState} new state, unchanged when no picker is open
 */
export function updatePickedCharacter(params) {
  const { app, patch } = params;
  if (app.picker === null) return app;
  const player = app.setup.players[app.picker];
  return withPlayer({ app, index: app.picker, player: { ...player, character: { ...player.character, ...patch } } });
}

/**
 * Sets the X01 start score.
 * @param {{ app: AppState, startScore: number }} params - state and score
 * @returns {AppState} new state
 */
export function setStartScore(params) {
  return { ...params.app, setup: { ...params.app.setup, startScore: params.startScore } };
}

/**
 * Toggles the double-out rule.
 * @param {AppState} app - current state
 * @returns {AppState} new state
 */
export function toggleDoubleOut(app) {
  return { ...app, setup: { ...app.setup, doubleOut: !app.setup.doubleOut } };
}

/**
 * Display name for a setup slot, falling back to "Joueur N".
 * @param {{ name: string, index: number }} params - typed name and slot
 * @returns {string} name to show
 */
export function playerDisplayName(params) {
  const trimmed = params.name.trim();
  return trimmed === "" ? t("setup_default_player_name", { n: params.index + 1 }) : trimmed;
}

/**
 * Starts a new game from the setup screen.
 * @param {AppState} app - current state
 * @returns {AppState} state on the game screen
 */
export function startGame(app) {
  const players = app.setup.players.map((player, index) => ({
    name: playerDisplayName({ name: player.name, index }),
    character: player.character,
  }));
  const config = { players, startScore: app.setup.startScore, doubleOut: app.setup.doubleOut, starterIndex: 0 };
  return { ...app, screen: SCREEN.GAME, game: { config, darts: [] }, modifier: MULTIPLIER.SINGLE, picker: null };
}

/**
 * Selects the ring (single/double/triple) for the next dart; tapping the active one resets to single.
 * @param {{ app: AppState, multiplier: number }} params - state and ring
 * @returns {AppState} new state
 */
export function setModifier(params) {
  const { app, multiplier } = params;
  const next = app.modifier === multiplier ? MULTIPLIER.SINGLE : multiplier;
  return { ...app, modifier: next };
}

/**
 * Builds the dart the keypad would record for a segment with the selected ring.
 * @param {{ app: AppState, segment: number }} params - state and segment (0 = miss)
 * @returns {import("./game.js").Dart} the dart (possibly invalid, e.g. triple bull)
 */
export function dartFor(params) {
  const multiplier = params.segment === MISS_SEGMENT ? MULTIPLIER.SINGLE : params.app.modifier;
  return { segment: params.segment, multiplier };
}

/**
 * Records a dart on the given segment with the selected ring.
 * @param {{ app: AppState, segment: number }} params - state and segment (0 = miss)
 * @returns {AppState} new state, unchanged if the dart is invalid or the game is over
 */
export function throwDart(params) {
  const { app } = params;
  if (!app.game) return app;
  const dart = dartFor(params);
  if (!isValidDart(dart)) return app;
  if (replayGame(app.game).winner !== null) return app;
  const game = { ...app.game, darts: [...app.game.darts, dart] };
  return { ...app, game, modifier: MULTIPLIER.SINGLE };
}

/**
 * Removes the last dart thrown (also reopens a won game).
 * @param {AppState} app - current state
 * @returns {AppState} new state
 */
export function undoDart(app) {
  if (!app.game || app.game.darts.length === 0) return app;
  return { ...app, game: { ...app.game, darts: app.game.darts.slice(0, -1) } };
}

/**
 * Starts a rematch with the same players; the next player opens.
 * @param {AppState} app - current state
 * @returns {AppState} new state
 */
export function replay(app) {
  if (!app.game) return app;
  const { config } = app.game;
  const starterIndex = (config.starterIndex + 1) % config.players.length;
  return { ...app, game: { config: { ...config, starterIndex }, darts: [] }, modifier: MULTIPLIER.SINGLE };
}

/**
 * Leaves the game for the setup screen, dropping the game.
 * @param {AppState} app - current state
 * @returns {AppState} new state
 */
export function backToSetup(app) {
  return { ...app, screen: SCREEN.SETUP, game: null, modifier: MULTIPLIER.SINGLE };
}

/**
 * Whether the bull button is usable with the selected ring (there is no triple bull).
 * @param {number} modifier - selected ring
 * @returns {boolean} true when a bull can be entered
 */
export function canThrowBull(modifier) {
  return isValidDart({ segment: BULL_SEGMENT, multiplier: modifier });
}
