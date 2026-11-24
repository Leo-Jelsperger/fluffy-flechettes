/**
 * Character picker sheet: species, colour variant and accessory, with a live
 * preview (face-on and trotting side view).
 */
import { ACCESSORIES, ACCESSORY_ICONS, SPECIES, VARIANT_COUNT } from "../characters/character-catalog.js";
import { MOOD, characterProfileSvg, characterSvg } from "../characters/character-svg.js";
import { escapeHtml } from "../dom.js";
import { t } from "../messages.js";

/**
 * One species button, drawn in the current colour variant.
 * @param {{ species: string, current: import("../characters/character-catalog.js").Character }} params - species and current pick
 * @returns {string} HTML
 */
function speciesButton(params) {
  const { species, current } = params;
  const selected = species === current.species;
  const label = t(`species_${species}`);
  const preview = characterSvg({ character: { species, variant: current.variant, accessory: "none" }, mood: MOOD.HAPPY });
  return `<button class="pick ${selected ? "is-active" : ""}" data-action="pick-species" data-value="${species}" aria-pressed="${selected}">
    ${preview}<span>${escapeHtml(label)}</span></button>`;
}

/**
 * One colour-variant button.
 * @param {{ variant: number, current: import("../characters/character-catalog.js").Character }} params - variant and current pick
 * @returns {string} HTML
 */
function variantButton(params) {
  const { variant, current } = params;
  const selected = variant === current.variant;
  const preview = characterSvg({ character: { ...current, variant }, mood: MOOD.HAPPY });
  const label = t("picker_variant_label", { n: variant + 1 });
  return `<button class="pick pick--variant ${selected ? "is-active" : ""}" data-action="pick-variant" data-value="${variant}" aria-pressed="${selected}" aria-label="${escapeHtml(label)}">${preview}</button>`;
}

/**
 * One accessory button.
 * @param {{ accessory: string, current: import("../characters/character-catalog.js").Character }} params - accessory and current pick
 * @returns {string} HTML
 */
function accessoryButton(params) {
  const { accessory, current } = params;
  const selected = accessory === current.accessory;
  return `<button class="pick pick--accessory ${selected ? "is-active" : ""}" data-action="pick-accessory" data-value="${accessory}" aria-pressed="${selected}">
    <b aria-hidden="true">${ACCESSORY_ICONS[accessory]}</b><span>${escapeHtml(t(`accessory_${accessory}`))}</span></button>`;
}

/**
 * Renders the picker sheet for one player.
 * @param {{ player: import("../app-actions.js").SetupPlayer, displayName: string }} params - player being edited and its shown name
 * @returns {string} HTML
 */
export function renderCharacterPicker(params) {
  const current = params.player.character;
  let species = "";
  for (const candidate of SPECIES) species += speciesButton({ species: candidate, current });
  let variants = "";
  for (let variant = 0; variant < VARIANT_COUNT; variant += 1) variants += variantButton({ variant, current });
  let accessories = "";
  for (const accessory of ACCESSORIES) accessories += accessoryButton({ accessory, current });
  return `<div class="picker-overlay" role="dialog" aria-modal="true" aria-label="${escapeHtml(t("picker_title"))}">
    <div class="picker-card">
      <div class="picker-preview">
        <div class="picker-face bounce">${characterSvg({ character: current, mood: MOOD.HAPPY })}</div>
        <div class="picker-side trotting">${characterProfileSvg(current)}</div>
      </div>
      <h2 class="picker-title">${escapeHtml(t("picker_title"))} · ${escapeHtml(params.displayName)}</h2>
      <h3 class="picker-section">${escapeHtml(t("picker_species"))}</h3>
      <div class="pick-grid pick-grid--species">${species}</div>
      <h3 class="picker-section">${escapeHtml(t("picker_variant"))}</h3>
      <div class="pick-grid pick-grid--variants">${variants}</div>
      <h3 class="picker-section">${escapeHtml(t("picker_accessory"))}</h3>
      <div class="pick-grid pick-grid--accessories">${accessories}</div>
      <button class="puffy start-btn picker-done" data-action="close-picker">${escapeHtml(t("picker_done"))} ✨</button>
    </div>
  </div>`;
}
