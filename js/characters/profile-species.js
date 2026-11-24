/**
 * Side view of every species, facing right, used by the characters that run
 * across the screen. The composer adds the legs, eye, cheek and accessory on
 * the anchors each drawing returns.
 */
import { CARICATURE_HAIR, LINE, OUTLINE, THIN_OUTLINE, outlinedStroke, radialSpikes } from "./svg-style.js";

/** Directions (degrees) of the lizard's frill seen from the side: fanned out behind the head. */
const LIZARD_SIDE_FRILL_DEG = Object.freeze([-150, -120, -90, -60, 150, 180, 120]);

/** Joints of the upright (two-legged) side view, in the profile viewBox. */
const UPRIGHT = Object.freeze({ HIP_Y: 68, LEG_LENGTH: 34, SHOULDER_Y: 44, ARM_LENGTH: 24 });
const LEG = Object.freeze({ WIDTH: 11, END_HEIGHT: 10 });
const ARM = Object.freeze({ WIDTH: 9, END_HEIGHT: 7 });

/**
 * A stiff limb hanging from its joint, ending in a boot or a hand; the
 * stylesheet swings it around its top edge.
 * @param {{ className: string, x: number, y: number, length: number, size: { WIDTH: number, END_HEIGHT: number }, fill: string, endFill: string, far: boolean }} params - animation classes, joint position, length, LEG or ARM size, sleeve colour, boot/hand colour, whether behind the body
 * @returns {string} SVG markup
 */
function marchingLimb(params) {
  const { className, x, y, length, size, fill, endFill, far } = params;
  const left = x - size.WIDTH / 2;
  const shade = far ? `opacity=".8"` : "";
  return `<g class="${className}" ${shade}>
    <rect x="${left}" y="${y}" width="${size.WIDTH}" height="${length}" rx="${size.WIDTH / 2}" fill="${fill}" ${OUTLINE}/>
    <rect x="${left - 1}" y="${y + length - size.END_HEIGHT}" width="${size.WIDTH + 4}" height="${size.END_HEIGHT}" rx="4" fill="${endFill}" ${THIN_OUTLINE}/>
  </g>`;
}

/**
 * @typedef {{ x: number, y: number }} Point
 * @typedef {{
 *   upright?: boolean,
 *   tail: string, beforeBody?: string, body?: string, bodyDecor?: string, head: string,
 *   legs?: { w?: number, h?: number, y?: number, fill?: string },
 *   eye: Point, top: Point, cheek: Point, darkEye?: boolean
 * }} ProfileParts
 */

/** @type {Record<string, (palette: import("./character-catalog.js").Palette) => ProfileParts>} */
export const PROFILE_SPECIES = {
  unicorn: (p) => {
    const [c0, c1, c2] = p.mane;
    return {
      tail: `${outlinedStroke({ d: "M28 58 Q4 52 8 82", color: c1, width: 9 })}
        <path d="M28 55 Q3 49 5 79" fill="none" stroke="${c0}" stroke-width="4" stroke-linecap="round"/>
        <path d="M28 61 Q8 58 12 84" fill="none" stroke="${c2}" stroke-width="4" stroke-linecap="round"/>`,
      head: `<g stroke="${LINE}" stroke-width="2.5"><circle cx="86" cy="26" r="9" fill="${c0}"/><circle cx="82" cy="39" r="9" fill="${c1}"/><circle cx="82" cy="52" r="8" fill="${c2}"/></g>
        <path d="M92 24 L95 7 L103 20Z" fill="${p.main}" ${OUTLINE}/>
        <ellipse cx="102" cy="38" rx="20" ry="18" fill="${p.main}" ${OUTLINE}/>
        <ellipse cx="117" cy="46" rx="12" ry="10" fill="${p.light}" ${THIN_OUTLINE}/>
        <circle cx="124" cy="43" r="1.8" fill="${LINE}" opacity=".6"/>
        <path d="M112 52 q4 3 8 0" fill="none" stroke="${LINE}" stroke-width="2.2" stroke-linecap="round"/>
        <path d="M100 22 L113 -2 L108 24Z" fill="${p.accent}" ${THIN_OUTLINE}/>`,
      eye: { x: 104, y: 34 },
      top: { x: 91, y: 22 },
      cheek: { x: 102, y: 45 },
    };
  },

  cat: (p) => ({
    tail: outlinedStroke({ d: "M28 58 Q8 52 12 32 Q14 24 22 28", color: p.main, width: 7 }),
    head: `<path d="M100 22 L110 4 L116 26Z" fill="${p.main}" ${OUTLINE}/>
      <circle cx="102" cy="40" r="21" fill="${p.main}" ${OUTLINE}/>
      <path d="M86 28 L89 6 L102 20Z" fill="${p.main}" ${OUTLINE}/><path d="M90 22 L91 12 L97 19Z" fill="${p.accent}"/>
      <ellipse cx="119" cy="46" rx="6" ry="5" fill="${p.light}"/>
      <ellipse cx="123" cy="43" rx="2.6" ry="2" fill="#ff7fb0"/>
      <path d="M118 50 q2 2 4 0" fill="none" stroke="${LINE}" stroke-width="2" stroke-linecap="round"/>
      <g stroke="${LINE}" stroke-width="1.8" stroke-linecap="round" opacity=".55"><path d="M116 47 L134 45"/><path d="M116 50 L133 54"/></g>`,
    eye: { x: 108, y: 37 },
    top: { x: 96, y: 21 },
    cheek: { x: 105, y: 49 },
  }),

  otter: (p) => ({
    tail: `<path d="M28 60 Q6 62 -2 80 Q14 76 30 72Z" fill="${p.main}" ${OUTLINE}/>`,
    bodyDecor: `<ellipse cx="68" cy="72" rx="24" ry="9" fill="${p.light}"/>`,
    head: `<circle cx="90" cy="26" r="6.5" fill="${p.main}" ${OUTLINE}/>
      <circle cx="102" cy="42" r="20" fill="${p.main}" ${OUTLINE}/>
      <ellipse cx="117" cy="48" rx="10" ry="8" fill="${p.light}" ${THIN_OUTLINE}/>
      <ellipse cx="125" cy="44" rx="3.6" ry="2.6" fill="${LINE}"/>
      <g fill="${LINE}" opacity=".5"><circle cx="116" cy="47" r="1.2"/><circle cx="119" cy="51" r="1.2"/></g>`,
    eye: { x: 106, y: 37 },
    top: { x: 96, y: 23 },
    cheek: { x: 106, y: 49 },
  }),

  panda: (p) => ({
    tail: `<circle cx="27" cy="56" r="6" fill="${p.main}" ${OUTLINE}/>`,
    legs: { fill: p.accent },
    head: `<circle cx="90" cy="22" r="7" fill="${p.accent}" ${OUTLINE}/><circle cx="104" cy="19" r="6" fill="${p.accent}" ${OUTLINE}/>
      <circle cx="102" cy="40" r="21" fill="${p.main}" ${OUTLINE}/>
      <ellipse cx="108" cy="38" rx="8" ry="10" transform="rotate(20 108 38)" fill="${p.accent}"/>
      <ellipse cx="118" cy="46" rx="8" ry="7" fill="${p.main}" ${THIN_OUTLINE}/>
      <ellipse cx="124" cy="43" rx="3" ry="2.2" fill="${LINE}"/>`,
    eye: { x: 108, y: 38 },
    top: { x: 97, y: 21 },
    cheek: { x: 102, y: 51 },
    darkEye: true,
  }),

  lizard: (p) => ({
    tail: outlinedStroke({ d: "M30 64 Q6 72 -4 58 Q-10 44 2 42 Q12 42 10 52", color: p.main, width: 9 }),
    body: `<ellipse cx="62" cy="63" rx="38" ry="18" fill="${p.main}" ${OUTLINE}/>`,
    bodyDecor: `<ellipse cx="64" cy="72" rx="26" ry="6" fill="${p.light}"/>
      <g fill="${p.accent}"><circle cx="42" cy="56" r="3.5"/><circle cx="56" cy="51" r="4"/><circle cx="71" cy="53" r="3.5"/><circle cx="84" cy="57" r="3"/></g>`,
    legs: { w: 11, h: 15, y: 70 },
    head: `${radialSpikes({ cx: 98, cy: 44, radius: 20, anglesDeg: LIZARD_SIDE_FRILL_DEG, rx: 6, ry: 11, colors: [p.accent, p.light] })}
      <ellipse cx="108" cy="47" rx="21" ry="16" fill="${p.main}" ${OUTLINE}/>
      <path d="M113 56 Q122 57 127 51" fill="none" stroke="${LINE}" stroke-width="2.2" stroke-linecap="round"/>
      <circle cx="125" cy="44" r="1.5" fill="${LINE}"/>
      <g fill="${p.accent}"><circle cx="102" cy="35" r="2.2"/><circle cx="110" cy="33" r="2"/></g>`,
    eye: { x: 112, y: 43 },
    top: { x: 104, y: 33 },
    cheek: { x: 114, y: 53 },
  }),

  giraffe: (p) => ({
    tail: `<path d="M28 56 Q16 60 14 74" fill="none" stroke="${LINE}" stroke-width="3" stroke-linecap="round"/><circle cx="14" cy="76" r="4" fill="${p.accent}" ${THIN_OUTLINE}/>`,
    beforeBody: `<path d="M76 56 L94 8 L108 12 L94 64Z" fill="${p.main}" ${OUTLINE}/>`,
    bodyDecor: `<g fill="${p.accent}"><ellipse cx="48" cy="56" rx="6" ry="5"/><ellipse cx="64" cy="68" rx="5" ry="4"/><ellipse cx="76" cy="52" rx="4.5" ry="4"/><ellipse cx="38" cy="68" rx="4" ry="3.5"/><ellipse cx="97" cy="24" rx="3.5" ry="3"/><ellipse cx="94" cy="40" rx="4" ry="3.5"/></g>`,
    legs: { w: 10, h: 28 },
    head: `${outlinedStroke({ d: "M102 0 L100 -12", color: p.main, width: 4 })}
      <circle cx="100" cy="-14" r="4" fill="${p.accent}" ${THIN_OUTLINE}/>
      <ellipse cx="93" cy="0" rx="8" ry="3.5" transform="rotate(-20 93 0)" fill="${p.main}" ${OUTLINE}/>
      <ellipse cx="106" cy="6" rx="15" ry="11" fill="${p.main}" ${OUTLINE}/>
      <ellipse cx="119" cy="11" rx="8" ry="7" fill="${p.light}" ${THIN_OUTLINE}/>
      <circle cx="123" cy="9" r="1.5" fill="${LINE}" opacity=".6"/>`,
    eye: { x: 108, y: 3 },
    top: { x: 104, y: -5 },
    cheek: { x: 108, y: 11 },
  }),

  elephant: (p) => ({
    tail: `<path d="M26 56 Q18 64 18 72" fill="none" stroke="${LINE}" stroke-width="3" stroke-linecap="round"/><circle cx="18" cy="74" r="3.5" fill="${p.main}" ${THIN_OUTLINE}/>`,
    legs: { w: 16, h: 20 },
    head: `${outlinedStroke({ d: "M116 44 Q134 50 130 66 Q128 74 136 74", color: p.main, width: 9 })}
      <circle cx="102" cy="40" r="22" fill="${p.main}" ${OUTLINE}/>
      <ellipse cx="90" cy="44" rx="13" ry="18" fill="${p.main}" ${OUTLINE}/>
      <ellipse cx="91" cy="44" rx="8" ry="12" fill="${p.accent}"/>`,
    eye: { x: 110, y: 34 },
    top: { x: 100, y: 19 },
    cheek: { x: 112, y: 44 },
  }),

  // The only biped: stands upright and marches with stiff legs (see `.march` in the stylesheet).
  nazi: (p) => ({
    upright: true,
    tail: "",
    beforeBody: `${marchingLimb({ className: "march march-b", x: 68, y: UPRIGHT.HIP_Y, length: UPRIGHT.LEG_LENGTH, size: LEG, fill: p.light, endFill: CARICATURE_HAIR, far: true })}
      ${marchingLimb({ className: "march march-a", x: 76, y: UPRIGHT.HIP_Y, length: UPRIGHT.LEG_LENGTH, size: LEG, fill: p.light, endFill: CARICATURE_HAIR, far: false })}
      ${marchingLimb({ className: "swing swing-a", x: 78, y: UPRIGHT.SHOULDER_Y, length: UPRIGHT.ARM_LENGTH, size: ARM, fill: p.light, endFill: p.main, far: true })}`,
    body: `<rect x="56" y="38" width="38" height="38" rx="14" fill="${p.light}" ${OUTLINE}/>
      <rect x="57" y="62" width="36" height="5" fill="${CARICATURE_HAIR}" opacity=".75"/>
      <g fill="${LINE}" opacity=".45"><circle cx="86" cy="47" r="1.8"/><circle cx="86" cy="55" r="1.8"/></g>`,
    bodyDecor: marchingLimb({ className: "swing swing-b", x: 70, y: UPRIGHT.SHOULDER_Y, length: UPRIGHT.ARM_LENGTH, size: ARM, fill: p.light, endFill: p.main, far: false }),
    head: `<g transform="translate(-31 -22)">
        <circle cx="98" cy="44" r="4.5" fill="${p.main}" ${THIN_OUTLINE}/>
        <circle cx="105" cy="42" r="20" fill="${p.main}" ${OUTLINE}/>
        <ellipse cx="125" cy="45" rx="4" ry="4.5" fill="${p.main}" ${THIN_OUTLINE}/>
        <rect x="116" y="50" width="9" height="4.5" rx="1.2" fill="${CARICATURE_HAIR}"/>
        <path d="M82 42 Q82 16 105 16 Q128 18 127 36 L131 42 Q121 40 118 34 L92 34 Q90 44 80 48Z" fill="${p.accent}" ${OUTLINE}/>
      </g>`,
    eye: { x: 84, y: 19 },
    top: { x: 75, y: -4 },
    cheek: { x: 80, y: 29 },
  }),

  dog: (p) => ({
    tail: `<g class="wag">${outlinedStroke({ d: "M28 54 Q14 42 20 26", color: p.main, width: 7 })}</g>`,
    bodyDecor: `<ellipse cx="52" cy="56" rx="11" ry="8" fill="${p.accent}" opacity=".75"/>`,
    head: `<circle cx="102" cy="40" r="21" fill="${p.main}" ${OUTLINE}/>
      <ellipse cx="119" cy="47" rx="11" ry="8.5" fill="${p.light}" ${THIN_OUTLINE}/>
      <ellipse cx="128" cy="43" rx="4" ry="3" fill="${LINE}"/>
      <ellipse cx="118" cy="57" rx="3" ry="4" fill="#ff8fb3" stroke="${LINE}" stroke-width="1.5"/>
      <path d="M92 22 Q80 26 82 48 Q84 56 92 50 Q96 38 98 24Z" fill="${p.accent}" ${OUTLINE}/>`,
    eye: { x: 108, y: 36 },
    top: { x: 101, y: 21 },
    cheek: { x: 108, y: 48 },
  }),

  raccoon: (p) => ({
    tail: `<g transform="rotate(-25 28 58)" ${THIN_OUTLINE}>
        <ellipse cx="-2" cy="58" rx="7" ry="6" fill="${p.accent}"/><ellipse cx="6" cy="58" rx="7" ry="7" fill="${p.main}"/>
        <ellipse cx="14" cy="58" rx="7" ry="8" fill="${p.accent}"/><ellipse cx="23" cy="58" rx="8" ry="8" fill="${p.main}"/>
      </g>`,
    head: `<circle cx="102" cy="40" r="21" fill="${p.main}" ${OUTLINE}/>
      <path d="M88 26 L92 6 L104 20Z" fill="${p.main}" ${OUTLINE}/><path d="M92 20 L93 12 L99 18Z" fill="${p.accent}"/>
      <ellipse cx="108" cy="38" rx="12" ry="7" fill="${p.accent}"/>
      <ellipse cx="119" cy="45" rx="9" ry="7" fill="${p.light}" ${THIN_OUTLINE}/>
      <ellipse cx="126" cy="42" rx="3" ry="2.2" fill="${LINE}"/>`,
    eye: { x: 108, y: 38 },
    top: { x: 98, y: 21 },
    cheek: { x: 106, y: 50 },
    darkEye: true,
  }),
};
