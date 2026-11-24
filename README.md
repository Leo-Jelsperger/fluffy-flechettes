# Fluffy Fléchettes

A deliberately over-cute X01 darts scorer (301 / 501 / 701, optional double-out)
with kittens and unicorns. Plain HTML/CSS/JS, no build step, installable as an
offline PWA on a tablet.

## Run locally

```bash
npm start        # serves the folder on http://localhost:8080
npm test         # rules and checkout tests (node:test)
```

## Install on a tablet

A PWA must be served over HTTPS to be installable. The simplest free option is
GitHub Pages: push this folder to a repository, enable Pages on the default
branch, then open the URL on the tablet.

- **iPad (Safari)**: Share → *Add to Home Screen*.
- **Android (Chrome)**: menu → *Install app*.

After the first visit the app works fully offline. The game in progress is
saved in the browser, so closing the app never loses a score.

## Structure

| File | Role |
|---|---|
| `js/game.js` | Pure X01 rules, replayed from the list of darts (undo = drop the last one) |
| `js/checkout.js` | Shortest checkout suggestion |
| `js/app-actions.js` | Immutable app-state transitions |
| `js/views/*` | Setup and game screens |
| `js/characters/*` | The 10 species (face-on and side view), colour variants and accessories |
| `js/effects.js`, `js/runner.js` | Dart/turn animations and the wavy side-view runners |
| `js/messages.js` | French UI copy |
| `sw.js`, `manifest.webmanifest` | Offline support and install metadata |
