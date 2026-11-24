/**
 * Builds the SVG of a character: face-on portrait (avatars, popups) or side
 * view (runners), with the shared cute face and the chosen accessory.
 */
import { paletteFor } from "./character-catalog.js";
import { FRONT_SPECIES, MOUTH } from "./front-species.js";
import { PROFILE_SPECIES } from "./profile-species.js";
import { BRIDGE_STYLE, HEAD_ACCESSORIES, HEAD_SHAPES, LENS_SHAPES, SIDE_ACCESSORIES } from "./accessory-shapes.js";
import { BLUSH, LINE, OUTLINE, TEAR } from "./svg-style.js";

/** Facial expression of a character. */
export const MOOD = Object.freeze({ HAPPY: "happy", SAD: "sad" });

/** Eye positions shared by every face-on drawing. */
const EYE_X = Object.freeze({ LEFT: 37, RIGHT: 63 });
const DEFAULT_CHEEK_DX = 24;
const CHEEK_BELOW_EYES = 11;
const FROWN_BELOW_EYES = 22;
const HAT_TILT_DEG = 15;
const SIDE_ITEM_DROP = 8;

/** Leg layout of the side view: rear and front pairs, far legs drawn behind the body. */
const LEGS = Object.freeze({ FAR_X: [48, 86], NEAR_X: [38, 76], WIDTH: 12, HEIGHT: 22, TOP: 72 });

/**
 * Happy or sad eyes.
 * @param {{ eyeY: number, darkEyes: boolean, mood: string }} params - eye line, whether eyes sit on dark patches, mood
 * @returns {string} SVG markup
 */
function eyesSvg(params) {
  const { eyeY, darkEyes, mood } = params;
  if (mood === MOOD.SAD) {
    const stroke = darkEyes ? "#fff" : LINE;
    return `<path d="M${EYE_X.LEFT - 6} ${eyeY + 2} q6 -6 12 0 M${EYE_X.RIGHT - 6} ${eyeY + 2} q6 -6 12 0" fill="none" stroke="${stroke}" stroke-width="3" stroke-linecap="round"/>
      <path class="tear" d="M${EYE_X.LEFT - 2} ${eyeY + 6} q-4 7 0 9 q4 -2 0 -9z" fill="${TEAR}"/>`;
  }
  const rings = darkEyes
    ? `<ellipse cx="${EYE_X.LEFT}" cy="${eyeY}" rx="7" ry="8.5" fill="#fff"/><ellipse cx="${EYE_X.RIGHT}" cy="${eyeY}" rx="7" ry="8.5" fill="#fff"/>`
    : "";
  return `<g class="eyes">${rings}
    <ellipse cx="${EYE_X.LEFT}" cy="${eyeY}" rx="5" ry="6.5" fill="${LINE}"/><ellipse cx="${EYE_X.RIGHT}" cy="${eyeY}" rx="5" ry="6.5" fill="${LINE}"/>
    <circle cx="${EYE_X.LEFT + 2}" cy="${eyeY - 3}" r="2.2" fill="#fff"/><circle cx="${EYE_X.RIGHT + 2}" cy="${eyeY - 3}" r="2.2" fill="#fff"/></g>`;
}

/**
 * Mouth in the requested style.
 * @param {{ style: string, y: number }} mouth - style and height
 * @returns {string} SVG markup
 */
function happyMouthSvg(mouth) {
  const stroke = `fill="none" stroke="${LINE}" stroke-width="2.5" stroke-linecap="round"`;
  const catMouth = `<path d="M50 ${mouth.y} q-3.5 5 -7.5 2 M50 ${mouth.y} q3.5 5 7.5 2" ${stroke}/>`;
  if (mouth.style === MOUTH.CAT) return catMouth;
  if (mouth.style === MOUTH.SMILE) return `<path d="M44 ${mouth.y} q6 5 12 0" ${stroke}/>`;
  if (mouth.style === MOUTH.WIDE) return `<path d="M36 ${mouth.y} q14 10 28 0" ${stroke}/>`;
  if (mouth.style === MOUTH.TONGUE) {
    return `<ellipse cx="50" cy="${mouth.y + 5}" rx="4" ry="5" fill="#ff8fb3" stroke="${LINE}" stroke-width="2"/>${catMouth}`;
  }
  return "";
}

/**
 * Mouth matching the mood.
 * @param {{ parts: import("./front-species.js").FrontParts, mood: string }} params - species parts and mood
 * @returns {string} SVG markup
 */
function mouthSvg(params) {
  const { parts, mood } = params;
  if (mood === MOOD.HAPPY) return happyMouthSvg(parts.mouth);
  if (parts.mouth.style === MOUTH.NONE) return "";
  const y = Math.max(parts.mouth.y, parts.eyeY + FROWN_BELOW_EYES);
  return `<path d="M43 ${y + 4} q7 -6 14 0" fill="none" stroke="${LINE}" stroke-width="2.5" stroke-linecap="round"/>`;
}

/**
 * Pink cheeks of a face-on drawing.
 * @param {import("./front-species.js").FrontParts} parts - species parts
 * @returns {string} SVG markup
 */
function cheeksSvg(parts) {
  const dx = parts.cheekDx ?? DEFAULT_CHEEK_DX;
  const y = parts.eyeY + CHEEK_BELOW_EYES;
  return `<ellipse cx="${50 - dx}" cy="${y}" rx="6" ry="3.8" fill="${BLUSH}" opacity=".75"/><ellipse cx="${50 + dx}" cy="${y}" rx="6" ry="3.8" fill="${BLUSH}" opacity=".75"/>`;
}

/**
 * Accessory placed on a face-on head.
 * @param {{ accessory: string, parts: import("./front-species.js").FrontParts }} params - accessory id and anchors
 * @returns {string} SVG markup
 */
function frontAccessorySvg(params) {
  const { accessory, parts } = params;
  if (HEAD_ACCESSORIES.includes(accessory)) {
    return `<g transform="translate(${parts.hatX} ${parts.topY + 3}) rotate(${HAT_TILT_DEG})">${HEAD_SHAPES[accessory]}</g>`;
  }
  if (SIDE_ACCESSORIES.includes(accessory)) {
    return `<g transform="translate(${100 - parts.hatX} ${parts.topY + SIDE_ITEM_DROP}) rotate(-${HAT_TILT_DEG})">${HEAD_SHAPES[accessory]}</g>`;
  }
  const lens = LENS_SHAPES[accessory];
  if (!lens) return "";
  return `<g transform="translate(${EYE_X.LEFT} ${parts.eyeY})">${lens}</g><g transform="translate(${EYE_X.RIGHT} ${parts.eyeY})">${lens}</g>
    <path d="M${EYE_X.LEFT + 9} ${parts.eyeY - 1} q4 -4 8 0" ${BRIDGE_STYLE}/>`;
}

/**
 * Face-on portrait of a character.
 * @param {{ character: import("./character-catalog.js").Character, mood: string }} params - character and MOOD
 * @returns {string} SVG markup
 */
export function characterSvg(params) {
  const { character, mood } = params;
  const parts = FRONT_SPECIES[character.species](paletteFor(character));
  const face = `${eyesSvg({ eyeY: parts.eyeY, darkEyes: parts.darkEyes === true, mood })}${mouthSvg({ parts, mood })}`;
  return `<svg class="mascot" viewBox="0 0 100 100" aria-hidden="true">
    ${parts.back}${parts.head}${cheeksSvg(parts)}${parts.front}${face}${frontAccessorySvg({ accessory: character.accessory, parts })}
  </svg>`;
}

/**
 * One pair of side-view legs.
 * @param {{ xs: number[], legs: { w: number, h: number, y: number, fill: string }, far: boolean }} params - leg centres, size, whether behind the body
 * @returns {string} SVG markup
 */
function legPairSvg(params) {
  const { xs, legs, far } = params;
  const [rear, front] = xs;
  const shade = far ? `opacity=".8"` : "";
  const rearClass = far ? "leg leg-b" : "leg leg-a";
  const frontClass = far ? "leg leg-a" : "leg leg-b";
  return `<rect class="${rearClass}" x="${rear - legs.w / 2}" y="${legs.y}" width="${legs.w}" height="${legs.h}" rx="${legs.w / 2}" fill="${legs.fill}" ${OUTLINE} ${shade}/>
    <rect class="${frontClass}" x="${front - legs.w / 2}" y="${legs.y}" width="${legs.w}" height="${legs.h}" rx="${legs.w / 2}" fill="${legs.fill}" ${OUTLINE} ${shade}/>`;
}

/**
 * Accessory placed on a side-view head.
 * @param {{ accessory: string, parts: import("./profile-species.js").ProfileParts }} params - accessory id and anchors
 * @returns {string} SVG markup
 */
function profileAccessorySvg(params) {
  const { accessory, parts } = params;
  const { top, eye } = parts;
  if (HEAD_ACCESSORIES.includes(accessory)) {
    return `<g transform="translate(${top.x} ${top.y}) rotate(-${HAT_TILT_DEG}) scale(.85)">${HEAD_SHAPES[accessory]}</g>`;
  }
  if (SIDE_ACCESSORIES.includes(accessory)) {
    return `<g transform="translate(${top.x - 4} ${top.y + 4}) scale(.75)">${HEAD_SHAPES[accessory]}</g>`;
  }
  const lens = LENS_SHAPES[accessory];
  if (!lens) return "";
  return `<path d="M${eye.x - 8} ${eye.y - 1} L${eye.x - 20} ${eye.y - 4}" ${BRIDGE_STYLE}/>
    <g transform="translate(${eye.x} ${eye.y}) scale(.8)">${lens}</g>`;
}

/**
 * Side-view eye (always happy: runners are celebrating).
 * @param {{ eye: { x: number, y: number }, darkEye: boolean }} params - position and whether it sits on a dark patch
 * @returns {string} SVG markup
 */
function profileEyeSvg(params) {
  const { eye, darkEye } = params;
  const ring = darkEye ? `<ellipse cx="${eye.x}" cy="${eye.y}" rx="6" ry="7.5" fill="#fff"/>` : "";
  return `<g class="eyes">${ring}<ellipse cx="${eye.x}" cy="${eye.y}" rx="4" ry="5.5" fill="${LINE}"/><circle cx="${eye.x + 1.5}" cy="${eye.y - 2.5}" r="1.8" fill="#fff"/></g>`;
}

/**
 * Side view of a character, facing right, with animatable legs.
 * @param {import("./character-catalog.js").Character} character - character
 * @returns {string} SVG markup
 */
export function characterProfileSvg(character) {
  const palette = paletteFor(character);
  const parts = PROFILE_SPECIES[character.species](palette);
  const legs = {
    w: parts.legs?.w ?? LEGS.WIDTH,
    h: parts.legs?.h ?? LEGS.HEIGHT,
    y: parts.legs?.y ?? LEGS.TOP,
    fill: parts.legs?.fill ?? palette.main,
  };
  const body = parts.body ?? `<ellipse cx="62" cy="62" rx="36" ry="23" fill="${palette.main}" ${OUTLINE}/>`;
  const cheek = `<ellipse cx="${parts.cheek.x}" cy="${parts.cheek.y}" rx="5" ry="3.2" fill="${BLUSH}" opacity=".8"/>`;
  // Upright species draw their own two legs in `beforeBody`.
  const fourLegs = parts.upright ? "" : `${legPairSvg({ xs: LEGS.FAR_X, legs, far: true })}${legPairSvg({ xs: LEGS.NEAR_X, legs, far: false })}`;
  return `<svg class="mascot profile" viewBox="-14 -26 164 130" aria-hidden="true">
    ${parts.tail}${fourLegs}
    ${parts.beforeBody ?? ""}${body}${parts.bodyDecor ?? ""}${parts.head}${cheek}
    ${profileEyeSvg({ eye: parts.eye, darkEye: parts.darkEye === true })}${profileAccessorySvg({ accessory: character.accessory, parts })}
  </svg>`;
}
