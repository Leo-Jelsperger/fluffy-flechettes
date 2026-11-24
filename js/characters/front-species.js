/**
 * Face-on head of every species, in a 100×100 box. Each drawing returns its
 * layers plus the anchors the shared face and accessories are placed on.
 * Eyes are always at x = 37 and x = 63 so glasses fit every species.
 */
import { CARICATURE_HAIR, LINE, OUTLINE, THIN_OUTLINE, outlinedStroke, radialSpikes } from "./svg-style.js";

/** Directions (degrees, 0 = right, -90 = up) of the lizard's frill spikes: a collar open at the chin. */
const LIZARD_FRILL_DEG = Object.freeze([-200, -170, -140, -110, -90, -70, -40, -10, 20]);
/**
 * @typedef {{
 *   back: string, head: string, front: string,
 *   eyeY: number, topY: number, hatX: number,
 *   mouth: { style: string, y: number },
 *   cheekDx?: number, darkEyes?: boolean
 * }} FrontParts
 */

/** Mouth shapes understood by the face renderer. */
export const MOUTH = Object.freeze({ CAT: "cat", SMILE: "smile", WIDE: "wide", TONGUE: "tongue", NONE: "none" });

/** @type {Record<string, (palette: import("./character-catalog.js").Palette) => FrontParts>} */
export const FRONT_SPECIES = {
  unicorn: (p) => {
    const [c0, c1, c2, c3] = p.mane;
    return {
      back: `<g stroke="${LINE}" stroke-width="2.5">
          <circle cx="24" cy="36" r="11" fill="${c0}"/><circle cx="17" cy="52" r="10" fill="${c1}"/><circle cx="18" cy="68" r="9" fill="${c2}"/><circle cx="24" cy="82" r="8" fill="${c3}"/>
          <circle cx="76" cy="36" r="11" fill="${c0}"/><circle cx="83" cy="52" r="10" fill="${c1}"/><circle cx="82" cy="68" r="9" fill="${c2}"/><circle cx="76" cy="82" r="8" fill="${c3}"/>
          <circle cx="38" cy="26" r="10" fill="${c1}"/><circle cx="62" cy="26" r="10" fill="${c2}"/>
        </g>
        <path d="M27 38 L29 14 L44 29Z" fill="${p.main}" ${OUTLINE}/><path d="M73 38 L71 14 L56 29Z" fill="${p.main}" ${OUTLINE}/>`,
      head: `<ellipse cx="50" cy="57" rx="30" ry="29" fill="${p.main}" ${OUTLINE}/>`,
      front: `<path d="M43 31 L50 2 L57 31 Z" fill="${p.accent}" ${THIN_OUTLINE}/>
        <path d="M45 23 L55 19 M47 14 L53.5 11.5" stroke="${LINE}" stroke-width="1.6" opacity=".5"/>
        <ellipse cx="50" cy="71" rx="18" ry="12" fill="${p.light}" ${THIN_OUTLINE}/>
        <ellipse cx="44" cy="69" rx="2" ry="2.6" fill="${LINE}" opacity=".6"/><ellipse cx="56" cy="69" rx="2" ry="2.6" fill="${LINE}" opacity=".6"/>`,
      eyeY: 51,
      topY: 30,
      hatX: 72,
      mouth: { style: MOUTH.SMILE, y: 75 },
    };
  },

  cat: (p) => ({
    back: `<path d="M16 46 L20 8 L46 28 Z" fill="${p.main}" ${OUTLINE}/><path d="M84 46 L80 8 L54 28 Z" fill="${p.main}" ${OUTLINE}/>
      <path d="M23 36 L25 18 L37 28 Z" fill="${p.accent}"/><path d="M77 36 L75 18 L63 28 Z" fill="${p.accent}"/>`,
    head: `<ellipse cx="50" cy="58" rx="38" ry="32" fill="${p.main}" ${OUTLINE}/>`,
    front: `<path d="M46.5 62 h7 l-3.5 3.5 z" fill="#ff7fb0"/>
      <g stroke="${LINE}" stroke-width="2" stroke-linecap="round" opacity=".6"><path d="M20 64 L5 60"/><path d="M20 69 L6 72"/><path d="M80 64 L95 60"/><path d="M80 69 L94 72"/></g>`,
    eyeY: 54,
    topY: 28,
    hatX: 62,
    mouth: { style: MOUTH.CAT, y: 65.5 },
  }),

  otter: (p) => ({
    back: `<circle cx="20" cy="38" r="9" fill="${p.main}" ${OUTLINE}/><circle cx="20" cy="38" r="4.5" fill="${p.accent}"/>
      <circle cx="80" cy="38" r="9" fill="${p.main}" ${OUTLINE}/><circle cx="80" cy="38" r="4.5" fill="${p.accent}"/>`,
    head: `<ellipse cx="50" cy="57" rx="36" ry="31" fill="${p.main}" ${OUTLINE}/>`,
    front: `<ellipse cx="50" cy="66" rx="24" ry="16" fill="${p.light}"/>
      <ellipse cx="42" cy="68" rx="10" ry="8" fill="${p.light}" ${THIN_OUTLINE}/><ellipse cx="58" cy="68" rx="10" ry="8" fill="${p.light}" ${THIN_OUTLINE}/>
      <ellipse cx="50" cy="61" rx="6" ry="4.2" fill="${LINE}"/><circle cx="48.5" cy="59.8" r="1.3" fill="#fff"/>
      <g fill="${LINE}" opacity=".55"><circle cx="38" cy="67" r="1.3"/><circle cx="41" cy="71" r="1.3"/><circle cx="62" cy="67" r="1.3"/><circle cx="59" cy="71" r="1.3"/></g>`,
    eyeY: 49,
    topY: 27,
    hatX: 62,
    mouth: { style: MOUTH.CAT, y: 64.5 },
  }),

  panda: (p) => ({
    back: `<circle cx="22" cy="32" r="12" fill="${p.accent}" ${OUTLINE}/><circle cx="78" cy="32" r="12" fill="${p.accent}" ${OUTLINE}/>`,
    head: `<ellipse cx="50" cy="58" rx="38" ry="32" fill="${p.main}" ${OUTLINE}/>`,
    front: `<ellipse cx="36" cy="56" rx="10" ry="12.5" transform="rotate(30 36 56)" fill="${p.accent}"/>
      <ellipse cx="64" cy="56" rx="10" ry="12.5" transform="rotate(-30 64 56)" fill="${p.accent}"/>
      <ellipse cx="50" cy="67" rx="5.5" ry="3.8" fill="${LINE}"/>`,
    eyeY: 55,
    topY: 28,
    hatX: 62,
    mouth: { style: MOUTH.CAT, y: 70 },
    darkEyes: true,
  }),

  lizard: (p) => ({
    back: radialSpikes({ cx: 50, cy: 58, radius: 33, anglesDeg: LIZARD_FRILL_DEG, rx: 8, ry: 15, colors: [p.accent, p.light] }),
    head: `<ellipse cx="50" cy="58" rx="30" ry="28" fill="${p.main}" ${OUTLINE}/>`,
    front: `<g fill="${p.accent}"><circle cx="41" cy="38" r="2.6"/><circle cx="50" cy="35" r="3.2"/><circle cx="59" cy="38" r="2.6"/><circle cx="25" cy="58" r="2.2"/><circle cx="75" cy="58" r="2.2"/></g>
      <circle cx="46" cy="64" r="1.6" fill="${LINE}"/><circle cx="54" cy="64" r="1.6" fill="${LINE}"/>`,
    eyeY: 53,
    topY: 32,
    hatX: 60,
    mouth: { style: MOUTH.WIDE, y: 70 },
    cheekDx: 20,
  }),

  giraffe: (p) => ({
    back: `${outlinedStroke({ d: "M39 28 L35 10", color: p.main, width: 5 })}${outlinedStroke({ d: "M61 28 L65 10", color: p.main, width: 5 })}
      <circle cx="35" cy="8" r="5.5" fill="${p.accent}" ${THIN_OUTLINE}/><circle cx="65" cy="8" r="5.5" fill="${p.accent}" ${THIN_OUTLINE}/>
      <ellipse cx="18" cy="40" rx="13" ry="6" transform="rotate(-20 18 40)" fill="${p.main}" ${OUTLINE}/>
      <ellipse cx="82" cy="40" rx="13" ry="6" transform="rotate(20 82 40)" fill="${p.main}" ${OUTLINE}/>
      <ellipse cx="17" cy="40" rx="7" ry="2.5" transform="rotate(-20 17 40)" fill="${p.accent}"/>
      <ellipse cx="83" cy="40" rx="7" ry="2.5" transform="rotate(20 83 40)" fill="${p.accent}"/>`,
    head: `<ellipse cx="50" cy="54" rx="30" ry="32" fill="${p.main}" ${OUTLINE}/>`,
    front: `<g fill="${p.accent}" opacity=".9"><ellipse cx="36" cy="33" rx="6" ry="5"/><ellipse cx="63" cy="31" rx="5" ry="4"/><ellipse cx="27" cy="52" rx="3.5" ry="3.5"/><ellipse cx="73" cy="54" rx="4.5" ry="4"/></g>
      <ellipse cx="50" cy="74" rx="21" ry="13" fill="${p.light}" ${THIN_OUTLINE}/>
      <ellipse cx="43" cy="72" rx="2" ry="2.6" fill="${LINE}" opacity=".6"/><ellipse cx="57" cy="72" rx="2" ry="2.6" fill="${LINE}" opacity=".6"/>`,
    eyeY: 50,
    topY: 24,
    hatX: 50,
    mouth: { style: MOUTH.SMILE, y: 78 },
  }),

  elephant: (p) => ({
    back: `<ellipse cx="17" cy="50" rx="18" ry="24" fill="${p.main}" ${OUTLINE}/><ellipse cx="83" cy="50" rx="18" ry="24" fill="${p.main}" ${OUTLINE}/>
      <ellipse cx="19" cy="50" rx="11" ry="16" fill="${p.accent}"/><ellipse cx="81" cy="50" rx="11" ry="16" fill="${p.accent}"/>`,
    head: `<ellipse cx="50" cy="50" rx="30" ry="30" fill="${p.main}" ${OUTLINE}/>`,
    front: `<path d="M43 60 Q41 82 47 90 Q52 95 57 90 Q55 86 53 84 Q51 76 57 60Z" fill="${p.main}" ${OUTLINE}/>
      <path d="M45 72 h8 M46 79 h6" stroke="${LINE}" stroke-width="2" stroke-linecap="round" opacity=".45"/>`,
    eyeY: 47,
    topY: 22,
    hatX: 62,
    mouth: { style: MOUTH.NONE, y: 70 },
  }),

  nazi: (p) => ({
    back: `<circle cx="20" cy="62" r="7" fill="${p.main}" ${OUTLINE}/><circle cx="80" cy="62" r="7" fill="${p.main}" ${OUTLINE}/>`,
    head: `<ellipse cx="50" cy="61" rx="30" ry="30" fill="${p.main}" ${OUTLINE}/>`,
    // The forelock is drawn first so the helmet brim covers its root.
    front: `<path d="M26 40 Q50 41 73 56 Q54 53 33 53Z" fill="${CARICATURE_HAIR}" ${THIN_OUTLINE}/>
      <path d="M14 48 Q14 12 50 12 Q86 12 86 48 L92 56 Q80 55 75 48 L25 48 Q20 55 8 56Z" fill="${p.accent}" ${OUTLINE}/>
      <path d="M24 44 Q50 40 76 44" fill="none" stroke="${LINE}" stroke-width="2" opacity=".4"/>
      <ellipse cx="50" cy="67" rx="4.5" ry="3.2" fill="#f3bfa0"/>
      <rect x="44" y="70.5" width="12" height="5.5" rx="1.5" fill="${CARICATURE_HAIR}"/>`,
    eyeY: 60,
    topY: 14,
    hatX: 62,
    mouth: { style: MOUTH.SMILE, y: 80 },
    cheekDx: 20,
  }),

  dog: (p) => ({
    back: "",
    head: `<ellipse cx="50" cy="55" rx="34" ry="32" fill="${p.main}" ${OUTLINE}/>`,
    front: `<path d="M24 30 Q6 34 8 60 Q10 74 22 68 Q30 56 30 36Z" fill="${p.accent}" ${OUTLINE}/>
      <path d="M76 30 Q94 34 92 60 Q90 74 78 68 Q70 56 70 36Z" fill="${p.accent}" ${OUTLINE}/>
      <ellipse cx="50" cy="68" rx="16" ry="12" fill="${p.light}" ${THIN_OUTLINE}/>
      <ellipse cx="50" cy="62" rx="6.5" ry="4.5" fill="${LINE}"/><circle cx="48" cy="60.5" r="1.5" fill="#fff"/>`,
    eyeY: 50,
    topY: 24,
    hatX: 60,
    mouth: { style: MOUTH.TONGUE, y: 67 },
    cheekDx: 21,
  }),

  raccoon: (p) => ({
    back: `<path d="M16 44 L22 12 L42 28Z" fill="${p.main}" ${OUTLINE}/><path d="M84 44 L78 12 L58 28Z" fill="${p.main}" ${OUTLINE}/>
      <path d="M22 34 L24 20 L33 28Z" fill="${p.accent}"/><path d="M78 34 L76 20 L67 28Z" fill="${p.accent}"/>`,
    head: `<ellipse cx="50" cy="58" rx="38" ry="31" fill="${p.main}" ${OUTLINE}/>`,
    front: `<path d="M14 56 Q28 42 50 52 Q72 42 86 56 Q72 68 50 60 Q28 68 14 56Z" fill="${p.accent}"/>
      <path d="M50 31 L50 46" stroke="${p.accent}" stroke-width="7" stroke-linecap="round"/>
      <ellipse cx="50" cy="69" rx="15" ry="10" fill="${p.light}" ${THIN_OUTLINE}/>
      <ellipse cx="50" cy="64" rx="5" ry="3.5" fill="${LINE}"/>`,
    eyeY: 55,
    topY: 29,
    hatX: 62,
    mouth: { style: MOUTH.CAT, y: 68 },
    darkEyes: true,
  }),
};
