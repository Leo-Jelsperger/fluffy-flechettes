/**
 * Offline support: the app shell is cached on install, every response
 * (including the Google font) refreshes the cache, and the cache is only
 * used when the network is unreachable. Bump CACHE_VERSION when files are
 * added or removed.
 */
const CACHE_VERSION = "fluffy-darts-v5";

const APP_SHELL = [
  "./",
  "./index.html",
  "./manifest.webmanifest",
  "./css/styles.css",
  "./js/main.js",
  "./js/app-actions.js",
  "./js/game.js",
  "./js/checkout.js",
  "./js/messages.js",
  "./js/effects.js",
  "./js/runner.js",
  "./js/fx-layer.js",
  "./js/screen-effects.js",
  "./js/characters/character-catalog.js",
  "./js/characters/character-svg.js",
  "./js/characters/front-species.js",
  "./js/characters/profile-species.js",
  "./js/characters/accessory-shapes.js",
  "./js/characters/svg-style.js",
  "./js/views/character-picker-view.js",
  "./js/storage.js",
  "./js/pwa.js",
  "./js/dom.js",
  "./js/views/setup-view.js",
  "./js/views/game-view.js",
  "./js/views/dart-label.js",
  "./icons/icon.svg",
  "./icons/icon-192.png",
  "./icons/icon-512.png",
];

self.addEventListener("install", (event) => {
  // "reload" bypasses the HTTP cache so the offline copy is never an old file.
  const requests = APP_SHELL.map((url) => new Request(url, { cache: "reload" }));
  event.waitUntil(caches.open(CACHE_VERSION).then((cache) => cache.addAll(requests)));
  self.skipWaiting();
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches.keys().then((keys) => Promise.all(keys.filter((key) => key !== CACHE_VERSION).map((key) => caches.delete(key)))),
  );
  self.clients.claim();
});

/**
 * Network first, so an online tablet always gets the latest version;
 * falls back to the cache when offline.
 * @param {Request} request - GET request
 * @returns {Promise<Response>} fresh or cached response
 */
async function networkFirst(request) {
  try {
    // "no-cache" revalidates with the server: without it the browser's HTTP cache
    // can hand back an old module next to new ones and break the imports.
    // Page navigations are fetched as-is: some Safari versions reject an init on them.
    const isNavigation = request.mode === "navigate";
    const response = isNavigation ? await fetch(request) : await fetch(request, { cache: "no-cache" });
    if (response.ok || response.type === "opaque") {
      const cache = await caches.open(CACHE_VERSION);
      await cache.put(request, response.clone());
    }
    return response;
  } catch (error) {
    const cached = await caches.match(request, { ignoreSearch: true });
    if (cached) return cached;
    throw error;
  }
}

self.addEventListener("fetch", (event) => {
  if (event.request.method !== "GET") return;
  event.respondWith(networkFirst(event.request));
});
