/**
 * Small DOM helpers shared by the views.
 */

const HTML_ESCAPES = Object.freeze({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" });

/**
 * Escapes text before interpolating it into HTML (player names are user input).
 * @param {string} text - raw text
 * @returns {string} HTML-safe text
 */
export function escapeHtml(text) {
  return String(text).replace(/[&<>"']/g, (char) => HTML_ESCAPES[char]);
}
