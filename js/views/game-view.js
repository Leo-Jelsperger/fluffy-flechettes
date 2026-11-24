/**
 * Game screen: current player, scoreboard, keypad and victory overlay.
 */
import { canThrowBull } from "../app-actions.js";
import { BULL_SEGMENT, DARTS_PER_TURN, MAX_NUMBER_SEGMENT, MISS_SEGMENT, MULTIPLIER, averageFor, dartScore, remainingFor, turnCountFor } from "../game.js";
import { suggestCheckout } from "../checkout.js";
import { MOOD, characterSvg } from "../characters/character-svg.js";
import { escapeHtml } from "../dom.js";
import { LOCALE, t } from "../messages.js";
import { formatDart } from "./dart-label.js";

/** Number of pastel tones cycled over the number keys. */
const KEY_TONES = 5;

const MODIFIER_KEYS = Object.freeze([
  { multiplier: MULTIPLIER.SINGLE, label: "game_modifier_single" },
  { multiplier: MULTIPLIER.DOUBLE, label: "game_modifier_double" },
  { multiplier: MULTIPLIER.TRIPLE, label: "game_modifier_triple" },
]);

const MODIFIER_CLASS = Object.freeze({ [MULTIPLIER.SINGLE]: "single", [MULTIPLIER.DOUBLE]: "double", [MULTIPLIER.TRIPLE]: "triple" });

/**
 * Formats an average for display.
 * @param {number | null} average - points per turn, or null before any turn
 * @returns {string} "–" or a number with at most one decimal
 */
function formatAverage(average) {
  if (average === null) return "–";
  return average.toLocaleString(LOCALE, { maximumFractionDigits: 1 });
}

/**
 * The three dart slots of the turn in progress.
 * @param {import("../game.js").Dart[]} darts - darts thrown this turn
 * @returns {string} HTML
 */
function renderDartSlots(darts) {
  let slots = "";
  for (let i = 0; i < DARTS_PER_TURN; i += 1) {
    const dart = darts[i];
    slots += dart
      ? `<span class="slot is-filled"><b>${escapeHtml(formatDart(dart))}</b><small>${dartScore(dart)}</small></span>`
      : `<span class="slot">🎯</span>`;
  }
  return `<div class="slots">${slots}</div>`;
}

/**
 * Checkout hint line for the current player.
 * @param {{ remaining: number, dartsLeft: number, doubleOut: boolean }} params - score left and rules
 * @returns {string} HTML (empty when the score is out of checkout range)
 */
function renderCheckoutHint(params) {
  const darts = suggestCheckout(params);
  if (darts) {
    const labels = darts.map((dart) => `<span class="hint-dart">${escapeHtml(formatDart(dart))}</span>`).join("");
    return `<p class="hint">🦄 ${escapeHtml(t("game_checkout"))} ${labels}</p>`;
  }
  return "";
}

/**
 * Big card for the player whose turn it is.
 * @param {{ config: import("../game.js").GameConfig, state: import("../game.js").GameState }} params - game config and state
 * @returns {string} HTML
 */
function renderHero(params) {
  const { config, state } = params;
  const index = state.currentPlayer;
  const remaining = remainingFor({ state, playerIndex: index });
  const hint = renderCheckoutHint({ remaining, dartsLeft: DARTS_PER_TURN - state.turnDarts.length, doubleOut: config.doubleOut });
  return `<section class="hero" aria-live="polite">
    <div class="hero-avatar bob">${characterSvg({ character: config.players[index].character, mood: MOOD.HAPPY })}</div>
    <div class="hero-main">
      <p class="hero-label">${escapeHtml(t("game_turn_of"))} <strong>${escapeHtml(config.players[index].name)}</strong></p>
      <p class="hero-score" data-score="${remaining}">${remaining}</p>
      <p class="hero-unit">${escapeHtml(t("game_points_left"))}</p>
      ${renderDartSlots(state.turnDarts)}
      ${hint}
    </div>
  </section>`;
}

/**
 * Compact scoreboard with every player.
 * @param {{ config: import("../game.js").GameConfig, state: import("../game.js").GameState }} params - game config and state
 * @returns {string} HTML
 */
function renderScoreboard(params) {
  const { config, state } = params;
  let chips = "";
  for (const [index, player] of config.players.entries()) {
    const active = index === state.currentPlayer;
    const average = formatAverage(averageFor({ state, playerIndex: index }));
    chips += `<li class="chip ${active ? "is-active" : ""}">
      <span class="chip-avatar">${characterSvg({ character: player.character, mood: MOOD.HAPPY })}</span>
      <span class="chip-name">${escapeHtml(player.name)}</span>
      <span class="chip-score">${remainingFor({ state, playerIndex: index })}</span>
      <span class="chip-avg">${escapeHtml(t("game_average"))} ${average}</span>
    </li>`;
  }
  return `<ul class="scoreboard" aria-label="${escapeHtml(t("game_scoreboard_label"))}">${chips}</ul>`;
}

/**
 * Ring selector (single / double / triple).
 * @param {number} modifier - selected ring
 * @returns {string} HTML
 */
function renderModifiers(modifier) {
  let buttons = "";
  for (const key of MODIFIER_KEYS) {
    const pressed = key.multiplier === modifier;
    const ring = MODIFIER_CLASS[key.multiplier];
    buttons += `<button class="puffy mod mod--${ring} ${pressed ? "is-active" : ""}" data-action="set-modifier" data-value="${key.multiplier}" aria-pressed="${pressed}">${escapeHtml(t(key.label))}</button>`;
  }
  return `<div class="modifiers">${buttons}</div>`;
}

/**
 * Keypad for entering darts; the current player's character peeks over it.
 * @param {{ modifier: number, canUndo: boolean, character: import("../characters/character-catalog.js").Character }} params - selected ring, whether undo is possible, current character
 * @returns {string} HTML
 */
function renderKeypad(params) {
  const { modifier, canUndo, character } = params;
  let numbers = "";
  for (let segment = 1; segment <= MAX_NUMBER_SEGMENT; segment += 1) {
    numbers += `<button class="puffy key tone-${segment % KEY_TONES}" data-action="throw" data-segment="${segment}">${segment}</button>`;
  }
  const bullLabel = modifier === MULTIPLIER.DOUBLE ? t("game_bull_double") : t("game_bull");
  return `<section class="keypad" aria-label="${escapeHtml(t("game_keypad_label"))}">
    <div class="peek" aria-hidden="true">${characterSvg({ character, mood: MOOD.HAPPY })}</div>
    ${renderModifiers(modifier)}
    <div class="numbers numbers--${MODIFIER_CLASS[modifier]}">${numbers}</div>
    <div class="extras">
      <button class="puffy key key--bull" data-action="throw" data-segment="${BULL_SEGMENT}" ${canThrowBull(modifier) ? "" : "disabled"}>${escapeHtml(bullLabel)}</button>
      <button class="puffy key key--miss" data-action="throw" data-segment="${MISS_SEGMENT}">${escapeHtml(t("game_miss"))}</button>
      <button class="puffy key key--undo" data-action="undo" ${canUndo ? "" : "disabled"}>↩ ${escapeHtml(t("game_undo"))}</button>
    </div>
  </section>`;
}

/**
 * Victory overlay.
 * @param {{ config: import("../game.js").GameConfig, state: import("../game.js").GameState }} params - game config and state
 * @returns {string} HTML
 */
function renderWinOverlay(params) {
  const { config, state } = params;
  const winner = state.winner;
  const stats = t("win_stats", {
    turns: turnCountFor({ state, playerIndex: winner }),
    average: formatAverage(averageFor({ state, playerIndex: winner })),
  });
  let friends = "";
  for (const [index, player] of config.players.entries()) {
    if (index === winner) continue;
    friends += `<span class="dance dance--friend">${characterSvg({ character: player.character, mood: MOOD.HAPPY })}</span>`;
  }
  return `<div class="win-overlay" role="dialog" aria-modal="true">
    <div class="win-card">
      <div class="win-mascots">
        <span class="dance dance--big">${characterSvg({ character: config.players[winner].character, mood: MOOD.HAPPY })}</span>
      </div>
      <div class="win-friends">${friends}</div>
      <h2 class="win-title">${escapeHtml(t("win_title", { name: config.players[winner].name }))}</h2>
      <p class="win-stats">${escapeHtml(stats)}</p>
      <div class="win-actions">
        <button class="puffy start-btn" data-action="replay">${escapeHtml(t("win_replay"))} 🌈</button>
        <button class="puffy add-btn" data-action="new-game">${escapeHtml(t("win_new_game"))}</button>
      </div>
      <button class="link-btn" data-action="undo">${escapeHtml(t("win_undo"))}</button>
    </div>
  </div>`;
}

/**
 * Renders the game screen.
 * @param {{ game: import("../app-actions.js").Game, state: import("../game.js").GameState, modifier: number }} params - persisted game, derived state, selected ring
 * @returns {string} HTML
 */
export function renderGameView(params) {
  const { game, state, modifier } = params;
  const { config } = game;
  const overlay = state.winner === null ? "" : renderWinOverlay({ config, state });
  return `<main class="game">
    <div class="board">
      <header class="topbar">
        <h1 class="topbar-title">${escapeHtml(t("app_title"))} <span class="topbar-badge">${config.startScore}</span></h1>
        <button class="puffy small-btn" data-action="quit">🏠 ${escapeHtml(t("game_menu"))}</button>
      </header>
      ${renderHero({ config, state })}
      ${renderScoreboard({ config, state })}
    </div>
    ${renderKeypad({ modifier, canUndo: game.darts.length > 0, character: config.players[state.currentPlayer].character })}
    ${overlay}
  </main>`;
}
