/**
 * A character running across the screen, seen from the side, along a random
 * wavy path and leaving a rainbow trail behind it.
 */
import { characterProfileSvg } from "./characters/character-svg.js";

const RUNNER = Object.freeze({
  WIDTH_PX: 260,
  PATH_STEPS: 48,
  MIN_DURATION_MS: 2600,
  EXTRA_DURATION_MS: 1600,
  /** The path's resting height is picked in this band of the viewport height. */
  BASE_Y_MIN: 0.18,
  BASE_Y_RANGE: 0.55,
  MIN_AMPLITUDE_PX: 40,
  EXTRA_AMPLITUDE_PX: 110,
  MIN_WAVES: 1.2,
  EXTRA_WAVES: 2.3,
  /** A faster, smaller second wave makes the path less regular. */
  WOBBLE_RATIO: 0.25,
  WOBBLE_SPEED: 3.1,
  MAX_TILT_DEG: 28,
  TRAIL_EVERY_MS: 40,
  TRAIL_LIFETIME_MS: 1100,
});

const TRAIL_COLORS = Object.freeze(["#ff9bb3", "#ffc48a", "#fff19a", "#a8eec4", "#9fd4ff", "#c9a8ff"]);

/**
 * Random number in [min, min + range).
 * @param {{ min: number, range: number }} params - lower bound and spread
 * @returns {number} random value
 */
function randomIn(params) {
  return params.min + Math.random() * params.range;
}

/**
 * Random parameters of one run.
 * @returns {{ fromLeft: boolean, baseY: number, amplitude: number, waves: number, phase: number, duration: number }} run shape
 */
function randomRunShape() {
  return {
    fromLeft: Math.random() < 0.5,
    baseY: window.innerHeight * randomIn({ min: RUNNER.BASE_Y_MIN, range: RUNNER.BASE_Y_RANGE }),
    amplitude: randomIn({ min: RUNNER.MIN_AMPLITUDE_PX, range: RUNNER.EXTRA_AMPLITUDE_PX }),
    waves: randomIn({ min: RUNNER.MIN_WAVES, range: RUNNER.EXTRA_WAVES }),
    phase: Math.random() * Math.PI * 2,
    duration: randomIn({ min: RUNNER.MIN_DURATION_MS, range: RUNNER.EXTRA_DURATION_MS }),
  };
}

/**
 * Vertical position of the path at a given progress.
 * @param {{ shape: ReturnType<typeof randomRunShape>, progress: number }} params - run shape and progress in [0, 1]
 * @returns {number} y in px
 */
function pathY(params) {
  const { shape, progress } = params;
  const angle = Math.PI * 2 * shape.waves * progress + shape.phase;
  const wobble = Math.sin(angle * RUNNER.WOBBLE_SPEED) * shape.amplitude * RUNNER.WOBBLE_RATIO;
  return shape.baseY + Math.sin(angle) * shape.amplitude + wobble;
}

/**
 * Keyframes following the wavy path; the runner tilts with the slope.
 * @param {ReturnType<typeof randomRunShape>} shape - run shape
 * @returns {Keyframe[]} Web Animations keyframes
 */
function buildKeyframes(shape) {
  const startX = shape.fromLeft ? -RUNNER.WIDTH_PX : window.innerWidth;
  const endX = shape.fromLeft ? window.innerWidth : -RUNNER.WIDTH_PX;
  const stepX = (endX - startX) / RUNNER.PATH_STEPS;
  const direction = shape.fromLeft ? 1 : -1;
  const keyframes = [];
  for (let step = 0; step <= RUNNER.PATH_STEPS; step += 1) {
    const progress = step / RUNNER.PATH_STEPS;
    const y = pathY({ shape, progress });
    const nextY = pathY({ shape, progress: progress + 1 / RUNNER.PATH_STEPS });
    const slopeDeg = (Math.atan2(nextY - y, Math.abs(stepX)) * 180) / Math.PI;
    const tilt = Math.max(-RUNNER.MAX_TILT_DEG, Math.min(RUNNER.MAX_TILT_DEG, slopeDeg)) * direction;
    keyframes.push({ transform: `translate(${startX + stepX * step}px, ${y}px) rotate(${tilt}deg)` });
  }
  return keyframes;
}

/**
 * Drops one rainbow dot where the runner currently is.
 * @param {{ layer: HTMLElement, runner: HTMLElement, colorIndex: number }} params - effects layer, runner element, colour to use
 * @returns {void}
 */
function dropTrailDot(params) {
  const { layer, runner, colorIndex } = params;
  const rect = runner.getBoundingClientRect();
  const dot = document.createElement("span");
  dot.className = "fx-trail";
  dot.style.left = `${rect.left + rect.width / 2}px`;
  dot.style.top = `${rect.top + rect.height * 0.55}px`;
  dot.style.background = TRAIL_COLORS[colorIndex % TRAIL_COLORS.length];
  layer.append(dot);
  setTimeout(() => dot.remove(), RUNNER.TRAIL_LIFETIME_MS);
}

/**
 * Sends a character running across the screen.
 * @param {{ layer: HTMLElement, character: import("./characters/character-catalog.js").Character, delayMs: number }} params - effects layer, who runs, start delay
 * @returns {void}
 */
export function runAcross(params) {
  const { layer, character, delayMs } = params;
  const shape = randomRunShape();
  const runner = document.createElement("div");
  runner.className = "fx-runner";
  runner.innerHTML = `<div class="fx-runner-body trotting ${shape.fromLeft ? "" : "is-flipped"}">${characterProfileSvg(character)}</div>`;
  const keyframes = buildKeyframes(shape);
  runner.style.transform = keyframes[0].transform;
  layer.append(runner);
  const animation = runner.animate(keyframes, { duration: shape.duration, delay: delayMs, easing: "linear", fill: "both" });
  let colorIndex = 0;
  const trail = setInterval(() => {
    colorIndex += 1;
    dropTrailDot({ layer, runner, colorIndex });
  }, RUNNER.TRAIL_EVERY_MS);
  animation.finished.finally(() => {
    clearInterval(trail);
    runner.remove();
  });
}
