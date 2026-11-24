/**
 * User-facing copy. Keys are English identifiers; values are the French UI text.
 * Placeholders such as `{name}` are filled by `t()`.
 */

/** Locale used to format numbers shown to players. */
export const LOCALE = "fr-FR";

const MESSAGES = Object.freeze({
  app_title: "Fluffy Fléchettes",
  app_tagline: "Le compteur de fléchettes le plus mignon de l'univers",
  setup_players: "Les joueurs",
  setup_players_hint: "Touche un animal pour choisir ton personnage",
  setup_change_character: "Changer le personnage de {name}",
  picker_title: "Choisis ton perso",
  picker_species: "Animal",
  picker_variant: "Couleur",
  picker_variant_label: "Couleur {n}",
  picker_accessory: "Accessoire",
  picker_done: "C'est moi !",
  species_unicorn: "Licorne",
  species_cat: "Chat",
  species_otter: "Loutre",
  species_panda: "Panda",
  species_lizard: "Lézard",
  species_giraffe: "Girafe",
  species_elephant: "Éléphant",
  species_nazi: "Nazi",
  species_dog: "Chien",
  species_raccoon: "Raton laveur",
  accessory_none: "Rien",
  accessory_partyHat: "Chapeau de fête",
  accessory_topHat: "Haut-de-forme",
  accessory_crown: "Couronne",
  accessory_bow: "Nœud",
  accessory_flower: "Fleur",
  accessory_officerCap: "Casquette nazie",
  accessory_heartGlasses: "Lunettes cœur",
  setup_player_name_label: "Nom du joueur {n}",
  setup_default_player_name: "Joueur {n}",
  setup_add_player: "Ajouter un joueur",
  setup_remove_player: "Retirer {name}",
  setup_rules: "Les règles",
  setup_start_score: "Score de départ",
  setup_double_out: "Finir sur un double",
  setup_double_out_hint: "La dernière fléchette doit tomber dans un double (ou le Bull).",
  setup_sound: "Petits sons",
  setup_sound_hint: "Un petit bruit mignon à chaque fléchette (pense à couper le mode silencieux).",
  game_sound_mute: "Couper le son",
  game_sound_unmute: "Activer le son",
  setup_start: "C'est parti !",
  setup_resume: "Reprendre la partie en cours",
  game_turn_of: "Au tour de",
  game_points_left: "points restants",
  game_checkout: "Finish :",
  game_average: "Moy.",
  game_modifier_single: "Simple",
  game_modifier_double: "Double",
  game_modifier_triple: "Triple",
  game_bull: "25",
  game_bull_double: "Bull 50",
  game_miss: "Raté",
  game_undo: "Annuler",
  game_menu: "Nouvelle partie",
  game_confirm_quit: "Abandonner la partie en cours ?",
  game_keypad_label: "Pavé de saisie",
  game_scoreboard_label: "Tableau des scores",
  dart_miss: "Raté",
  dart_bull: "Bull",
  fx_turn: "{name} : {total}",
  fx_turn_nice: "Joli ! {name} : {total} ✨",
  fx_dart_double: "Double !",
  fx_dart_triple: "Triple !!",
  fx_dart_bull: "BULL !!!",
  fx_dart_outer_bull: "25 !",
  fx_dart_miss: "Raté…",
  fx_big_subtitle: "Toute la bande part en galopade !",
  fx_bust_title: "Bust ! Oups…",
  fx_bust_subtitle: "{name} est tout triste…",
  fx_ton_title: "Wouah, {total} !",
  fx_ton_subtitle: "{name} part au galop !",
  fx_max_title: "180 !!!",
  fx_max_subtitle: "Pluie de licornes magiques pour {name} !",
  win_title: "{name} a gagné !",
  win_stats: "{turns} tours · moyenne {average}",
  win_replay: "Revanche !",
  win_new_game: "Nouvelle partie",
  win_undo: "Oups, annuler la dernière fléchette",
});

/**
 * Looks up a message and fills its `{placeholder}` slots.
 * @param {keyof typeof MESSAGES} key - message key
 * @param {Record<string, string | number>} [values] - placeholder values
 * @returns {string} the formatted message
 * @throws {Error} when the key does not exist (a programming error)
 */
export function t(key, values) {
  const template = MESSAGES[key];
  if (template === undefined) throw new Error(`Unknown message key: ${key}`);
  if (!values) return template;
  let text = template;
  for (const [name, value] of Object.entries(values)) {
    text = text.replaceAll(`{${name}}`, String(value));
  }
  return text;
}
