/**
 * Persists the app state in localStorage so a reload (or the tablet going to
 * sleep) never loses a game in progress.
 */
import { SCREEN } from "./app-actions.js";
import { MULTIPLIER, START_SCORES, isValidDart } from "./game.js";
import { isCharacter } from "./characters/character-catalog.js";

/** Bumped when the stored shape changes; older saves are ignored. */
const STORAGE_KEY = "fluffy-darts:v2";

/**
 * Type guard for a list of valid darts.
 * @param {unknown} value - parsed value
 * @returns {boolean} true when every entry is a legal dart
 */
function isDartList(value) {
  if (!Array.isArray(value)) return false;
  for (const dart of value) {
    if (typeof dart !== "object" || dart === null || !isValidDart(dart)) return false;
  }
  return true;
}

/**
 * Type guard for a list of players (name + character).
 * @param {unknown} value - parsed value
 * @returns {boolean} true when every entry is a usable player
 */
function isPlayerList(value) {
  if (!Array.isArray(value) || value.length === 0) return false;
  for (const player of value) {
    if (typeof player?.name !== "string" || !isCharacter(player.character)) return false;
  }
  return true;
}

/**
 * Type guard for a persisted game.
 * @param {unknown} value - parsed value
 * @returns {boolean} true when the value is a usable game
 */
function isGame(value) {
  if (typeof value !== "object" || value === null) return false;
  const { config, darts } = value;
  if (typeof config !== "object" || config === null || !isDartList(darts) || !isPlayerList(config.players)) return false;
  const starterOk = Number.isInteger(config.starterIndex) && config.starterIndex >= 0 && config.starterIndex < config.players.length;
  return starterOk && START_SCORES.includes(config.startScore) && typeof config.doubleOut === "boolean";
}

/**
 * Type guard for the persisted app state.
 * @param {unknown} value - parsed value
 * @returns {boolean} true when the value can be restored
 */
function isAppState(value) {
  if (typeof value !== "object" || value === null) return false;
  const { screen, setup, game, modifier, picker } = value;
  if (!Object.values(SCREEN).includes(screen) || !Object.values(MULTIPLIER).includes(modifier)) return false;
  if (typeof setup !== "object" || setup === null || !isPlayerList(setup.players)) return false;
  const setupOk = START_SCORES.includes(setup.startScore) && typeof setup.doubleOut === "boolean";
  const pickerOk = picker === null || (Number.isInteger(picker) && picker >= 0 && picker < setup.players.length);
  const gameOk = game === null ? screen === SCREEN.SETUP : isGame(game);
  return setupOk && pickerOk && gameOk;
}

/**
 * Restores the last saved app state.
 * @returns {import("./app-actions.js").AppState | null} the state, or null when nothing valid is stored
 */
export function loadAppState() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw === null) return null;
    const parsed = JSON.parse(raw);
    return isAppState(parsed) ? parsed : null;
  } catch (error) {
    console.warn("Could not restore the saved game", error);
    return null;
  }
}

/**
 * Saves the app state. Storage failures (private mode, quota) only lose persistence.
 * @param {import("./app-actions.js").AppState} app - state to save
 * @returns {void}
 */
export function saveAppState(app) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(app));
  } catch (error) {
    console.warn("Could not save the game", error);
  }
}
