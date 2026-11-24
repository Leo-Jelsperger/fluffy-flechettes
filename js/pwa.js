/**
 * Installable-app plumbing: offline service worker and screen wake lock.
 */

const SERVICE_WORKER_URL = "./sw.js";

/** @type {WakeLockSentinel | null} */
let wakeLock = null;

/**
 * Registers the service worker that makes the app work offline.
 * @returns {void}
 */
export function registerServiceWorker() {
  if (!("serviceWorker" in navigator)) return;
  navigator.serviceWorker.register(SERVICE_WORKER_URL, { updateViaCache: "none" }).catch((error) => {
    console.warn("Service worker registration failed", error);
  });
}

/**
 * Keeps the tablet screen on during a game (where the browser supports it).
 * @returns {Promise<void>} resolves once the lock is held or refused
 */
export async function keepScreenAwake() {
  if (!("wakeLock" in navigator) || wakeLock !== null || document.visibilityState !== "visible") return;
  try {
    wakeLock = await navigator.wakeLock.request("screen");
    wakeLock.addEventListener("release", () => {
      wakeLock = null;
    });
  } catch (error) {
    console.warn("Screen wake lock refused", error);
  }
}
