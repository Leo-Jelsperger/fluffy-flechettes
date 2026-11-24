/**
 * Entry point: owns the app state, renders the current screen and routes UI
 * events (declared with `data-action` attributes) to the state transitions.
 */
import {
  SCREEN,
  addPlayer,
  backToSetup,
  closePicker,
  createDefaultAppState,
  dartFor,
  openPicker,
  removePlayer,
  renamePlayer,
  replay,
  setModifier,
  setStartScore,
  startGame,
  throwDart,
  toggleDoubleOut,
  toggleSound,
  undoDart,
  updatePickedCharacter,
} from "./app-actions.js";
import { replayGame } from "./game.js";
import { loadAppState, saveAppState } from "./storage.js";
import { celebrateWin, playDartEffect, playTurnEffect } from "./effects.js";
import { keepScreenAwake, registerServiceWorker } from "./pwa.js";
import { setSoundEnabled, unlockAudio } from "./sound/synth.js";
import { SOUND } from "./sound/sounds.js";
import { renderSetupView } from "./views/setup-view.js";
import { renderGameView } from "./views/game-view.js";
import { t } from "./messages.js";

const root = document.getElementById("app");

/** @type {import("./app-actions.js").AppState} */
let app = loadAppState() ?? createDefaultAppState();

/**
 * Simple actions: they only need the app state and the clicked element.
 * @type {Record<string, (app: import("./app-actions.js").AppState, target: HTMLElement) => import("./app-actions.js").AppState>}
 */
const ACTIONS = {
  "add-player": (current) => addPlayer(current),
  "remove-player": (current, target) => removePlayer({ app: current, index: Number(target.dataset.index) }),
  "set-start-score": (current, target) => setStartScore({ app: current, startScore: Number(target.dataset.value) }),
  "toggle-double-out": (current) => toggleDoubleOut(current),
  "toggle-sound": (current) => toggleSound(current),
  "start-game": (current) => startGame(current),
  "resume-game": (current) => ({ ...current, screen: SCREEN.GAME }),
  "set-modifier": (current, target) => setModifier({ app: current, multiplier: Number(target.dataset.value) }),
  "open-picker": (current, target) => openPicker({ app: current, index: Number(target.dataset.index) }),
  "close-picker": (current) => closePicker(current),
  "pick-species": (current, target) => updatePickedCharacter({ app: current, patch: { species: target.dataset.value } }),
  "pick-variant": (current, target) => updatePickedCharacter({ app: current, patch: { variant: Number(target.dataset.value) } }),
  "pick-accessory": (current, target) => updatePickedCharacter({ app: current, patch: { accessory: target.dataset.value } }),
  undo: (current) => undoDart(current),
  replay: (current) => replay(current),
  "new-game": (current) => backToSetup(current),
};

/**
 * Renders the current screen into the app root.
 * @returns {void}
 */
function render() {
  if (app.screen === SCREEN.GAME && app.game) {
    const state = replayGame(app.game);
    root.innerHTML = renderGameView({ game: app.game, state, modifier: app.modifier, soundOn: app.soundOn });
    return;
  }
  const canResume = app.game !== null && replayGame(app.game).winner === null;
  const pickerScroll = document.querySelector(".picker-card")?.scrollTop ?? 0;
  root.innerHTML = renderSetupView({ setup: app.setup, picker: app.picker, canResume, soundOn: app.soundOn });
  const pickerCard = document.querySelector(".picker-card");
  if (pickerCard) pickerCard.scrollTop = pickerScroll;
}

/**
 * Replaces the app state, saves it and re-renders.
 * @param {import("./app-actions.js").AppState} next - new state
 * @returns {void}
 */
function commit(next) {
  app = next;
  setSoundEnabled(app.soundOn);
  saveAppState(app);
  render();
}

/**
 * Records a dart and plays the matching animations.
 * @param {HTMLElement} button - the key that was pressed
 * @returns {void}
 */
function handleThrow(button) {
  const before = replayGame(app.game);
  const rect = button.getBoundingClientRect();
  const segment = Number(button.dataset.segment);
  const dart = dartFor({ app, segment });
  const dartCount = app.game.darts.length;
  commit(throwDart({ app, segment }));
  if (app.game.darts.length === dartCount) return;
  const { players } = app.game.config;
  const after = replayGame(app.game);
  playDartEffect({ dart, rect, character: players[before.currentPlayer].character });
  if (after.turns.length > before.turns.length) {
    const turn = after.turns[after.turns.length - 1];
    const friends = players.filter((_, index) => index !== turn.playerIndex).map((player) => player.character);
    playTurnEffect({ turn, player: players[turn.playerIndex], friends });
    if (turn.checkout) celebrateWin({ winner: players[turn.playerIndex].character, friends });
  }
}

/**
 * Leaves the current game after confirmation.
 * @returns {void}
 */
function handleQuit() {
  const finished = replayGame(app.game).winner !== null;
  if (finished || window.confirm(t("game_confirm_quit"))) commit(backToSetup(app));
}

/**
 * Click router for every `data-action` element.
 * @param {MouseEvent} event - click event
 * @returns {void}
 */
function handleClick(event) {
  unlockAudio();
  const target = event.target instanceof Element ? event.target.closest("[data-action]") : null;
  if (!(target instanceof HTMLElement) || target.hasAttribute("disabled")) return;
  const { action } = target.dataset;
  if (action === "throw") {
    handleThrow(target);
    return;
  }
  if (action === "quit") {
    handleQuit();
    return;
  }
  const transition = ACTIONS[action];
  if (!transition) return;
  commit(transition(app, target));
  if (action === "start-game" || action === "resume-game") void keepScreenAwake();
  if (action === "toggle-sound") SOUND.double();
}

/**
 * Saves player names as they are typed, without re-rendering (keeps focus).
 * @param {Event} event - input event
 * @returns {void}
 */
function handleInput(event) {
  const target = event.target;
  if (!(target instanceof HTMLInputElement) || target.dataset.field !== "player-name") return;
  app = renamePlayer({ app, index: Number(target.dataset.index), name: target.value });
  saveAppState(app);
}

/**
 * Re-acquires the wake lock when coming back to a game.
 * @returns {void}
 */
function handleVisibilityChange() {
  if (app.screen === SCREEN.GAME) void keepScreenAwake();
}

document.addEventListener("click", handleClick);
document.addEventListener("input", handleInput);
document.addEventListener("visibilitychange", handleVisibilityChange);
setSoundEnabled(app.soundOn);
render();
registerServiceWorker();
