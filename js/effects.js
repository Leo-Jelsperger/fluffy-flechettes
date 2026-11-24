/**
 * What happens on screen for each dart (double, triple, bull, miss…), each
 * closed turn (50+, 100+, 140+, 180, bust) and each victory. Built from the
 * whole-screen effects in screen-effects.js.
 */
import { BULL_SEGMENT, MISS_SEGMENT, MULTIPLIER } from "./game.js";
import { MOOD, characterSvg } from "./characters/character-svg.js";
import { runAcross } from "./runner.js";
import { centerOf, fxLayer, mount, prefersReducedMotion, screenCenter } from "./fx-layer.js";
import { FLASH, RING, SHAKE, banner, burst, flash, rainCharacters, rainEmojis, shake, shockwave } from "./screen-effects.js";
import { escapeHtml } from "./dom.js";
import { t } from "./messages.js";

const DURATION_MS = Object.freeze({ LABEL: 1400, POP: 1500, POPUP: 2600, TOAST: 1800 });

/** Turn totals that trigger a celebration, biggest first. */
const TURN_SCORE = Object.freeze({ MAX: 180, PARADE: 140, TON: 100, NICE: 50 });

/** Delay between two characters of a parade. */
const PARADE_STAGGER_MS = 280;

/** Most extra characters joining the player in a 140+ parade. */
const PARADE_FRIENDS = 2;

const EMOJIS = Object.freeze({
  SPARKLE: ["✨", "🐾", "💗", "⭐"],
  DOUBLE: ["💖", "💗", "💕", "✨", "💞"],
  TRIPLE: ["⭐", "🌟", "✨", "💫", "🌈"],
  OUTER_BULL: ["🌸", "🌼", "🌷", "🌺", "✨"],
  BULL: ["🎯", "✨", "💖", "🌈", "⭐", "🦄"],
  MISS: ["💨", "☁️", "💨"],
  HEARTS: ["💖", "💗", "✨", "🌸", "💕"],
  MAGIC: ["💖", "✨", "⭐", "🌈", "🦄", "🐱", "🐼", "🦦", "🐶", "🌸", "🎀", "🍭"],
  SAD: ["💧", "☁️", "💧"],
});

/** Particle counts (bursts and rains). */
const COUNT = Object.freeze({
  SPARKLE: 10, MISS: 10, DOUBLE: 26, OUTER_BULL: 26, TRIPLE: 40, BULL: 50, HEARTS: 36, MAGIC: 80,
  BUST_RAIN: 40, CONFETTI: 160, CHARACTER_RAIN_SMALL: 14, CHARACTER_RAIN_BIG: 30, WIN_CHARACTERS: 36,
});

/** How far bursts fly, in px. */
const SPREAD_PX = Object.freeze({ SPARKLE: 120, KEY: 280, BULL: 420, CENTER: 520, HUGE: 760 });

/** Labels rising from keys near a screen edge are pulled in by this much so they stay readable. */
const LABEL_EDGE_MARGIN_PX = 170;

/** Particle sizes, in rem. */
const SIZE_REM = Object.freeze({ SMALL: 1.8, MEDIUM: 2.6, LARGE: 3.4 });

/**
 * A word rising out of a pressed key ("Double !", "Raté…").
 * @param {{ rect: DOMRect, text: string, variant: string }} params - key box, text, CSS variant
 * @returns {void}
 */
function floatLabel(params) {
  const label = document.createElement("span");
  const { x, y } = centerOf(params.rect);
  const safeX = Math.min(Math.max(x, LABEL_EDGE_MARGIN_PX), window.innerWidth - LABEL_EDGE_MARGIN_PX);
  label.className = `fx-label fx-label--${params.variant}`;
  label.textContent = params.text;
  label.style.left = `${safeX}px`;
  label.style.top = `${y}px`;
  mount({ element: label, lifetimeMs: DURATION_MS.LABEL });
}

/**
 * The player's character jumps out of a key, waves and vanishes.
 * @param {{ rect: DOMRect, character: import("./characters/character-catalog.js").Character }} params - key box and character
 * @returns {void}
 */
function popCharacter(params) {
  if (prefersReducedMotion()) return;
  const pop = document.createElement("div");
  const { x, y } = centerOf(params.rect);
  pop.className = "fx-pop";
  pop.innerHTML = characterSvg({ character: params.character, mood: MOOD.HAPPY });
  pop.style.left = `${x}px`;
  pop.style.top = `${y}px`;
  mount({ element: pop, lifetimeMs: DURATION_MS.POP });
}

/**
 * Sends characters running across the screen, one after the other.
 * @param {import("./characters/character-catalog.js").Character[]} characters - runners, in order
 * @returns {void}
 */
function parade(characters) {
  const layer = fxLayer();
  if (!layer || prefersReducedMotion()) return;
  for (const [index, character] of characters.entries()) {
    runAcross({ layer, character, delayMs: index * PARADE_STAGGER_MS });
  }
}

/**
 * Reaction to a single dart: label, particles, shockwave, and for the best
 * darts a flash, a shake and the player's character itself.
 * @param {{ dart: import("./game.js").Dart, rect: DOMRect, character: import("./characters/character-catalog.js").Character }} params - dart, key box, thrower's character
 * @returns {void}
 */
export function playDartEffect(params) {
  const { dart, rect, character } = params;
  const origin = centerOf(rect);
  if (dart.segment === MISS_SEGMENT) {
    floatLabel({ rect, text: t("fx_dart_miss"), variant: "miss" });
    burst({ ...origin, count: COUNT.MISS, emojis: EMOJIS.MISS, spread: SPREAD_PX.SPARKLE, sizeRem: SIZE_REM.MEDIUM });
    shake(SHAKE.SMALL);
    return;
  }
  if (dart.segment === BULL_SEGMENT && dart.multiplier === MULTIPLIER.DOUBLE) {
    floatLabel({ rect, text: t("fx_dart_bull"), variant: "bull" });
    burst({ ...origin, count: COUNT.BULL, emojis: EMOJIS.BULL, spread: SPREAD_PX.BULL, sizeRem: SIZE_REM.LARGE });
    shockwave({ ...origin, color: RING.RAINBOW });
    flash(FLASH.RAINBOW);
    shake(SHAKE.MEDIUM);
    parade([character, character]);
    return;
  }
  if (dart.segment === BULL_SEGMENT) {
    floatLabel({ rect, text: t("fx_dart_outer_bull"), variant: "outer-bull" });
    burst({ ...origin, count: COUNT.OUTER_BULL, emojis: EMOJIS.OUTER_BULL, spread: SPREAD_PX.KEY, sizeRem: SIZE_REM.MEDIUM });
    shockwave({ ...origin, color: RING.PINK });
    flash(FLASH.PINK);
    return;
  }
  if (dart.multiplier === MULTIPLIER.TRIPLE) {
    floatLabel({ rect, text: t("fx_dart_triple"), variant: "triple" });
    burst({ ...origin, count: COUNT.TRIPLE, emojis: EMOJIS.TRIPLE, spread: SPREAD_PX.BULL, sizeRem: SIZE_REM.LARGE });
    shockwave({ ...origin, color: RING.LAVENDER });
    flash(FLASH.LAVENDER);
    shake(SHAKE.MEDIUM);
    popCharacter({ rect, character });
    return;
  }
  if (dart.multiplier === MULTIPLIER.DOUBLE) {
    floatLabel({ rect, text: t("fx_dart_double"), variant: "double" });
    burst({ ...origin, count: COUNT.DOUBLE, emojis: EMOJIS.DOUBLE, spread: SPREAD_PX.KEY, sizeRem: SIZE_REM.MEDIUM });
    shockwave({ ...origin, color: RING.MINT });
    flash(FLASH.MINT);
    shake(SHAKE.SMALL);
    return;
  }
  burst({ ...origin, count: COUNT.SPARKLE, emojis: EMOJIS.SPARKLE, spread: SPREAD_PX.SPARKLE, sizeRem: SIZE_REM.SMALL });
  shockwave({ ...origin, color: RING.SOFT });
}

/**
 * Removes any message bubble still on screen, so a new one never stacks on it.
 * @returns {void}
 */
export function clearMessages() {
  for (const message of document.querySelectorAll(".fx-popup, .fx-toast")) {
    message.remove();
  }
}

/**
 * Shows a bubble in the middle of the screen with a character.
 * @param {{ art: string, title: string, subtitle: string, variant: string }} params - character SVG, texts and CSS variant
 * @returns {void}
 */
function showPopup(params) {
  clearMessages();
  const popup = document.createElement("div");
  popup.className = `fx-popup fx-popup--${params.variant}`;
  popup.innerHTML = `<div class="fx-popup-mascot">${params.art}</div>
    <p class="fx-popup-title">${escapeHtml(params.title)}</p>
    <p class="fx-popup-subtitle">${escapeHtml(params.subtitle)}</p>`;
  mount({ element: popup, lifetimeMs: DURATION_MS.POPUP });
}

/**
 * Score bubble at the top of the screen.
 * @param {string} text - text to show
 * @returns {void}
 */
function showToast(text) {
  clearMessages();
  const toast = document.createElement("div");
  toast.className = "fx-toast";
  toast.textContent = text;
  mount({ element: toast, lifetimeMs: DURATION_MS.TOAST });
}

/**
 * Celebration of a turn of 100 or more, scaled with the score.
 * @param {{ turn: import("./game.js").TurnRecord, player: import("./game.js").Player, friends: import("./characters/character-catalog.js").Character[] }} params - closed turn, its player, other players' characters
 * @returns {void}
 */
function celebrateBigTurn(params) {
  const { turn, player, friends } = params;
  const art = characterSvg({ character: player.character, mood: MOOD.HAPPY });
  const title = t("fx_ton_title", { total: turn.total });
  if (turn.total === TURN_SCORE.MAX) {
    showPopup({ art, title: t("fx_max_title"), subtitle: t("fx_max_subtitle", { name: player.name }), variant: "magic" });
    banner(t("fx_max_title"));
    flash(FLASH.RAINBOW);
    shake(SHAKE.BIG);
    burst({ ...screenCenter(), count: COUNT.MAGIC, emojis: EMOJIS.MAGIC, spread: SPREAD_PX.HUGE, sizeRem: SIZE_REM.LARGE });
    parade([player.character, ...friends, player.character, player.character]);
    rainCharacters({ count: COUNT.CHARACTER_RAIN_BIG, characters: [player.character, ...friends] });
    rainEmojis({ count: COUNT.CONFETTI, emojis: EMOJIS.MAGIC });
    return;
  }
  if (turn.total >= TURN_SCORE.PARADE) {
    showPopup({ art, title, subtitle: t("fx_big_subtitle"), variant: "magic" });
    banner(title);
    flash(FLASH.RAINBOW);
    shake(SHAKE.MEDIUM);
    parade([player.character, ...friends.slice(0, PARADE_FRIENDS)]);
    rainCharacters({ count: COUNT.CHARACTER_RAIN_SMALL, characters: [player.character] });
    return;
  }
  showPopup({ art, title, subtitle: t("fx_ton_subtitle", { name: player.name }), variant: "happy" });
  banner(title);
  flash(FLASH.PINK);
  shake(SHAKE.SMALL);
  burst({ ...screenCenter(), count: COUNT.HEARTS, emojis: EMOJIS.HEARTS, spread: SPREAD_PX.CENTER, sizeRem: SIZE_REM.MEDIUM });
  parade([player.character]);
}

/**
 * Plays the animation matching a turn that just closed.
 * @param {{ turn: import("./game.js").TurnRecord, player: import("./game.js").Player, friends: import("./characters/character-catalog.js").Character[] }} params - closed turn, its player, other players' characters
 * @returns {void}
 */
export function playTurnEffect(params) {
  const { turn, player } = params;
  if (turn.checkout) {
    clearMessages();
    return;
  }
  if (turn.bust) {
    const art = characterSvg({ character: player.character, mood: MOOD.SAD });
    showPopup({ art, title: t("fx_bust_title"), subtitle: t("fx_bust_subtitle", { name: player.name }), variant: "sad" });
    flash(FLASH.BLUE);
    shake(SHAKE.BIG);
    rainEmojis({ count: COUNT.BUST_RAIN, emojis: EMOJIS.SAD });
    return;
  }
  if (turn.total >= TURN_SCORE.TON) {
    celebrateBigTurn(params);
    return;
  }
  if (turn.total >= TURN_SCORE.NICE) {
    burst({ ...screenCenter(), count: COUNT.HEARTS, emojis: EMOJIS.HEARTS, spread: SPREAD_PX.CENTER, sizeRem: SIZE_REM.MEDIUM });
    flash(FLASH.PINK);
    showToast(t("fx_turn_nice", { name: player.name, total: turn.total }));
    return;
  }
  showToast(t("fx_turn", { name: player.name, total: turn.total }));
}

/**
 * Victory: the winner rains from the sky, runs around, and everything explodes.
 * @param {{ winner: import("./characters/character-catalog.js").Character, friends: import("./characters/character-catalog.js").Character[] }} params - winner's and other players' characters
 * @returns {void}
 */
export function celebrateWin(params) {
  const { winner, friends } = params;
  flash(FLASH.RAINBOW);
  shake(SHAKE.BIG);
  burst({ ...screenCenter(), count: COUNT.MAGIC, emojis: EMOJIS.MAGIC, spread: SPREAD_PX.HUGE, sizeRem: SIZE_REM.LARGE });
  rainEmojis({ count: COUNT.CONFETTI, emojis: EMOJIS.MAGIC });
  rainCharacters({ count: COUNT.WIN_CHARACTERS, characters: [winner, winner, ...friends] });
  parade([winner, winner, winner]);
}
