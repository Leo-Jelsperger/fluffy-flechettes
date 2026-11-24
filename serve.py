"""Local static server for testing the app on a tablet over Wi-Fi.

Python's built-in server sends no Cache-Control header, so browsers apply
heuristic caching and may mix an old module with new ones after an update.
This server forbids HTTP caching; offline support stays the service worker's job.
"""

from functools import partial
from http.server import SimpleHTTPRequestHandler, ThreadingHTTPServer
from pathlib import Path

PORT = 8080
ROOT = Path(__file__).resolve().parent


class NoCacheHandler(SimpleHTTPRequestHandler):
    """Static file handler that tells browsers never to reuse a stored copy."""

    def end_headers(self) -> None:
        self.send_header("Cache-Control", "no-store")
        super().end_headers()


def main() -> None:
    """Serve the app folder on every network interface."""
    handler = partial(NoCacheHandler, directory=str(ROOT))
    with ThreadingHTTPServer(("0.0.0.0", PORT), handler) as server:
        print(f"Serving {ROOT} on port {PORT}")
        server.serve_forever()


if __name__ == "__main__":
    main()
