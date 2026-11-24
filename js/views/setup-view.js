/**
 * Setup screen: players and their characters, start score and double-out rule.
 */
import { PLAYER_LIMITS, playerDisplayName } from "../app-actions.js";
import { START_SCORES } from "../game.js";
import { MOOD, characterSvg } from "../characters/character-svg.js";
import { escapeHtml } from "../dom.js";
import { t } from "../messages.js";
import { renderCharacterPicker } from "./character-picker-view.js";

/** Decorative characters on each side of the title. */
const TITLE_CHARACTERS = Object.freeze([
  { species: "unicorn", variant: 0, accessory: "none" },
  { species: "cat", variant: 0, accessory: "bow" },
]);

/**
 * One editable player row.
 * @param {{ player: import("../app-actions.js").SetupPlayer, index: number, canRemove: boolean }} params - player, slot, removable
 * @returns {string} HTML
 */
function renderPlayerRow(params) {
  const { player, index, canRemove } = params;
  const displayName = playerDisplayName({ name: player.name, index });
  const placeholder = t("setup_default_player_name", { n: index + 1 });
  const removeLabel = t("setup_remove_player", { name: displayName });
  const removeButton = canRemove
    ? `<button class="icon-btn" data-action="remove-player" data-index="${index}" aria-label="${escapeHtml(removeLabel)}">✕</button>`
    : "";
  return `<li class="player-row">
    <button class="player-row-avatar" data-action="open-picker" data-index="${index}" aria-label="${escapeHtml(t("setup_change_character", { name: displayName }))}">
      ${characterSvg({ character: player.character, mood: MOOD.HAPPY })}<span class="edit-badge" aria-hidden="true">✏️</span>
    </button>
    <input class="player-input" data-field="player-name" data-index="${index}" value="${escapeHtml(player.name)}"
      placeholder="${escapeHtml(placeholder)}" aria-label="${escapeHtml(t("setup_player_name_label", { n: index + 1 }))}"
      maxlength="16" autocomplete="off" enterkeyhint="done">
    ${removeButton}
  </li>`;
}

/**
 * Segmented control for the start score.
 * @param {number} selected - current start score
 * @returns {string} HTML
 */
function renderStartScores(selected) {
  let buttons = "";
  for (const score of START_SCORES) {
    const pressed = score === selected;
    buttons += `<button class="segment ${pressed ? "is-active" : ""}" data-action="set-start-score" data-value="${score}" aria-pressed="${pressed}">${score}</button>`;
  }
  return `<div class="segmented" role="group" aria-label="${escapeHtml(t("setup_start_score"))}">${buttons}</div>`;
}

/**
 * Picker sheet when one is open.
 * @param {{ setup: import("../app-actions.js").SetupState, picker: number | null }} params - setup and edited slot
 * @returns {string} HTML (empty when closed)
 */
function renderOpenPicker(params) {
  const { setup, picker } = params;
  if (picker === null) return "";
  const player = setup.players[picker];
  return renderCharacterPicker({ player, displayName: playerDisplayName({ name: player.name, index: picker }) });
}

/**
 * Renders the setup screen.
 * @param {{ setup: import("../app-actions.js").SetupState, picker: number | null, canResume: boolean, soundOn: boolean }} params - setup state, edited slot, whether a game can be resumed, sound switch
 * @returns {string} HTML
 */
export function renderSetupView(params) {
  const { setup, picker, canResume, soundOn } = params;
  const canRemove = setup.players.length > PLAYER_LIMITS.MIN;
  let rows = "";
  for (const [index, player] of setup.players.entries()) {
    rows += renderPlayerRow({ player, index, canRemove });
  }
  const addButton = setup.players.length < PLAYER_LIMITS.MAX
    ? `<button class="puffy add-btn" data-action="add-player">＋ ${escapeHtml(t("setup_add_player"))}</button>`
    : "";
  const resumeButton = canResume
    ? `<button class="puffy resume-btn" data-action="resume-game">${escapeHtml(t("setup_resume"))} 🐾</button>`
    : "";
  const [left, right] = TITLE_CHARACTERS;
  return `<main class="setup">
    <header class="setup-hero">
      <div class="setup-mascot bounce">${characterSvg({ character: left, mood: MOOD.HAPPY })}</div>
      <div class="setup-titles">
        <h1 class="title">${escapeHtml(t("app_title"))}</h1>
        <p class="tagline">${escapeHtml(t("app_tagline"))}</p>
      </div>
      <div class="setup-mascot bounce bounce--late">${characterSvg({ character: right, mood: MOOD.HAPPY })}</div>
    </header>
    ${resumeButton}
    <section class="card">
      <h2 class="card-title">🐾 ${escapeHtml(t("setup_players"))}</h2>
      <p class="card-hint">${escapeHtml(t("setup_players_hint"))}</p>
      <ul class="player-list">${rows}</ul>
      ${addButton}
    </section>
    <section class="card">
      <h2 class="card-title">🦄 ${escapeHtml(t("setup_rules"))}</h2>
      <p class="field-label">${escapeHtml(t("setup_start_score"))}</p>
      ${renderStartScores(setup.startScore)}
      <button class="toggle" role="switch" aria-checked="${setup.doubleOut}" data-action="toggle-double-out">
        <span class="toggle-track"><span class="toggle-thumb"></span></span>
        <span class="toggle-text"><strong>${escapeHtml(t("setup_double_out"))}</strong><small>${escapeHtml(t("setup_double_out_hint"))}</small></span>
      </button>
      <button class="toggle toggle--spaced" role="switch" aria-checked="${soundOn}" data-action="toggle-sound">
        <span class="toggle-track"><span class="toggle-thumb"></span></span>
        <span class="toggle-text"><strong>🔊 ${escapeHtml(t("setup_sound"))}</strong><small>${escapeHtml(t("setup_sound_hint"))}</small></span>
      </button>
    </section>
    <button class="puffy start-btn" data-action="start-game">${escapeHtml(t("setup_start"))} 🌈</button>
    ${renderOpenPicker({ setup, picker })}
  </main>`;
}
