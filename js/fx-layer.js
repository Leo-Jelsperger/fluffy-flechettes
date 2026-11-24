/**
 * Low-level helpers shared by the effects: the #fx layer, element lifetime,
 * randomness and the reduced-motion preference.
 */

/**
 * Whether the player asked the system for less motion.
 * @returns {boolean} true when animations should be toned down
 */
export function prefersReducedMotion() {
  return window.matchMedia("(prefers-reduced-motion: reduce)").matches;
}

/**
 * The effects layer element, which sits above the re-rendered app root.
 * @returns {HTMLElement | null} the #fx layer
 */
export function fxLayer() {
  return document.getElementById("fx");
}

/**
 * Adds an element to the effects layer and removes it after its animation.
 * @param {{ element: HTMLElement, lifetimeMs: number }} params - element and lifetime
 * @returns {void}
 */
export function mount(params) {
  const layer = fxLayer();
  if (!layer) return;
  layer.append(params.element);
  setTimeout(() => params.element.remove(), params.lifetimeMs);
}

/**
 * Picks a random item.
 * @template T
 * @param {readonly T[]} items - candidates
 * @returns {T} one of them
 */
export function pick(items) {
  return items[Math.floor(Math.random() * items.length)];
}

/**
 * Centre of a rectangle.
 * @param {DOMRect} rect - bounding box
 * @returns {{ x: number, y: number }} centre in px
 */
export function centerOf(rect) {
  return { x: rect.left + rect.width / 2, y: rect.top + rect.height / 2 };
}

/**
 * Centre of the viewport, origin of the big bursts.
 * @returns {{ x: number, y: number }} coordinates in px
 */
export function screenCenter() {
  return { x: window.innerWidth / 2, y: window.innerHeight * 0.42 };
}
