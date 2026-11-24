/**
 * Whole-screen effects: particle bursts, colour flashes, screen shakes,
 * shockwave rings, a giant sweeping banner and rains of confetti or characters.
 */
import { MOOD, characterSvg } from "./characters/character-svg.js";
import { mount, pick, prefersReducedMotion } from "./fx-layer.js";

const LIFETIME_MS = Object.freeze({ BURST: 1500, FLASH: 700, SHAKE: 650, RING: 900, BANNER: 1900, RAIN_EXTRA: 2000 });

/** Shake strengths, matching the `.shake--*` CSS classes. */
export const SHAKE = Object.freeze({ SMALL: "small", MEDIUM: "medium", BIG: "big" });

/** Flash colours, matching the `.fx-flash--*` CSS classes. */
export const FLASH = Object.freeze({ PINK: "pink", MINT: "mint", LAVENDER: "lavender", RAINBOW: "rainbow", BLUE: "blue" });

/** Ring colours, matching the `.fx-ring--*` CSS classes. */
export const RING = Object.freeze({ SOFT: "soft", MINT: "mint", LAVENDER: "lavender", PINK: "pink", RAINBOW: "rainbow" });

const RAIN = Object.freeze({ MAX_DELAY_MS: 1800, MIN_FALL_MS: 2000, EXTRA_FALL_MS: 1800, MAX_DRIFT_PX: 160 });
const CHARACTER_RAIN_SIZE = Object.freeze({ MIN_PX: 70, EXTRA_PX: 70 });

/**
 * Sends emoji particles flying out of a point.
 * @param {{ x: number, y: number, count: number, emojis: readonly string[], spread: number, sizeRem: number }} params - origin and look
 * @returns {void}
 */
export function burst(params) {
  if (prefersReducedMotion()) return;
  for (let i = 0; i < params.count; i += 1) {
    const particle = document.createElement("span");
    particle.className = "fx-particle";
    particle.textContent = pick(params.emojis);
    const angle = (i / params.count) * Math.PI * 2 + Math.random() * 0.6;
    const distance = params.spread * (0.35 + Math.random() * 0.65);
    particle.style.left = `${params.x}px`;
    particle.style.top = `${params.y}px`;
    particle.style.fontSize = `${params.sizeRem * (0.7 + Math.random() * 0.6)}rem`;
    particle.style.setProperty("--dx", `${Math.cos(angle) * distance}px`);
    particle.style.setProperty("--dy", `${Math.sin(angle) * distance}px`);
    particle.style.setProperty("--rot", `${Math.round(Math.random() * 720 - 360)}deg`);
    particle.style.setProperty("--dur", `${LIFETIME_MS.BURST}ms`);
    mount({ element: particle, lifetimeMs: LIFETIME_MS.BURST });
  }
}

/**
 * Flashes the whole screen with a colour.
 * @param {string} color - one of FLASH
 * @returns {void}
 */
export function flash(color) {
  if (prefersReducedMotion()) return;
  const element = document.createElement("div");
  element.className = `fx-flash fx-flash--${color}`;
  mount({ element, lifetimeMs: LIFETIME_MS.FLASH });
}

/**
 * Shakes the app (restarting the shake if one is already running).
 * @param {string} strength - one of SHAKE
 * @returns {void}
 */
export function shake(strength) {
  const app = document.getElementById("app");
  if (!app || prefersReducedMotion()) return;
  for (const name of Object.values(SHAKE)) app.classList.remove(`shake--${name}`);
  void app.offsetWidth;
  app.classList.add(`shake--${strength}`);
  setTimeout(() => app.classList.remove(`shake--${strength}`), LIFETIME_MS.SHAKE);
}

/**
 * Expanding ring from a point.
 * @param {{ x: number, y: number, color: string }} params - centre and one of RING
 * @returns {void}
 */
export function shockwave(params) {
  if (prefersReducedMotion()) return;
  const ring = document.createElement("span");
  ring.className = `fx-ring fx-ring--${params.color}`;
  ring.style.left = `${params.x}px`;
  ring.style.top = `${params.y}px`;
  mount({ element: ring, lifetimeMs: LIFETIME_MS.RING });
}

/**
 * Giant text sweeping across the screen.
 * @param {string} text - text to show
 * @returns {void}
 */
export function banner(text) {
  const element = document.createElement("div");
  element.className = "fx-banner";
  element.textContent = text;
  mount({ element, lifetimeMs: LIFETIME_MS.BANNER });
}

/**
 * Drops one falling element at a random place and time.
 * @param {{ element: HTMLElement }} params - element to drop (already filled)
 * @returns {void}
 */
function dropFromSky(params) {
  const { element } = params;
  const fallMs = RAIN.MIN_FALL_MS + Math.round(Math.random() * RAIN.EXTRA_FALL_MS);
  element.style.left = `${Math.random() * 100}vw`;
  element.style.setProperty("--delay", `${Math.round(Math.random() * RAIN.MAX_DELAY_MS)}ms`);
  element.style.setProperty("--dur", `${fallMs}ms`);
  element.style.setProperty("--drift", `${Math.round((Math.random() - 0.5) * RAIN.MAX_DRIFT_PX)}px`);
  mount({ element, lifetimeMs: RAIN.MAX_DELAY_MS + fallMs + LIFETIME_MS.RAIN_EXTRA });
}

/**
 * Emoji raining from the top of the screen.
 * @param {{ count: number, emojis: readonly string[] }} params - how many and which
 * @returns {void}
 */
export function rainEmojis(params) {
  if (prefersReducedMotion()) return;
  for (let i = 0; i < params.count; i += 1) {
    const piece = document.createElement("span");
    piece.className = "fx-confetti";
    piece.textContent = pick(params.emojis);
    dropFromSky({ element: piece });
  }
}

/**
 * Characters (the players' own) raining from the top of the screen.
 * @param {{ count: number, characters: import("./characters/character-catalog.js").Character[] }} params - how many and who
 * @returns {void}
 */
export function rainCharacters(params) {
  if (prefersReducedMotion() || params.characters.length === 0) return;
  for (let i = 0; i < params.count; i += 1) {
    const piece = document.createElement("div");
    piece.className = "fx-confetti fx-confetti--character";
    piece.style.width = `${CHARACTER_RAIN_SIZE.MIN_PX + Math.round(Math.random() * CHARACTER_RAIN_SIZE.EXTRA_PX)}px`;
    piece.innerHTML = characterSvg({ character: pick(params.characters), mood: MOOD.HAPPY });
    dropFromSky({ element: piece });
  }
}
