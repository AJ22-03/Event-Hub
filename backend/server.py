"""
EventHub Unified Backend Server (Python 3.13 Standard Library)
Zero external dependencies required (no pip install needed).
Serves all modular frontend files (HTML, CSS, JS, Assets) and provides REST APIs.
"""

import http.server
import socketserver
import os
import json
import urllib.parse
import mimetypes
import webbrowser

PORT = int(os.environ.get("PORT", 3000))
HOST = os.environ.get("HOST", "127.0.0.1")

BASE_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
FRONTEND_DIR = os.path.join(BASE_DIR, "frontend")
DATA_DIR = os.path.join(os.path.dirname(os.path.abspath(__file__)), "data")
DATA_FILE = os.path.join(DATA_DIR, "database.json")

# Ensure standard MIME types
mimetypes.init()
mimetypes.add_type("text/css", ".css")
mimetypes.add_type("application/javascript", ".js")
mimetypes.add_type("text/html", ".html")
mimetypes.add_type("application/json", ".json")

def load_data():
    os.makedirs(DATA_DIR, exist_ok=True)
    if os.path.exists(DATA_FILE):
        try:
            with open(DATA_FILE, "r", encoding="utf-8") as f:
                return json.load(f)
        except Exception:
            pass
    return {"status": "ok", "service": "EventHub Python Server"}

class EventHubRequestHandler(http.server.SimpleHTTPRequestHandler):
    def __init__(self, *args, **kwargs):
        super().__init__(*args, directory=FRONTEND_DIR, **kwargs)

    def do_OPTIONS(self):
        self.send_response(204)
        self.send_header("Access-Control-Allow-Origin", "*")
        self.send_header("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE, OPTIONS")
        self.send_header("Access-Control-Allow-Headers", "Content-Type, Authorization")
        self.end_headers()

    def do_GET(self):
        parsed = urllib.parse.urlparse(self.path)
        
        # REST API Endpoints
        if parsed.path == "/api/health":
            self.send_json(200, {"status": "healthy", "engine": "Python 3.13", "platform": "EventHub"})
            return
        elif parsed.path == "/api/events":
            data = load_data()
            self.send_json(200, {"events": data.get("events", [])})
            return

        # Route root to index.html
        if parsed.path == "/" or parsed.path == "":
            self.path = "/index.html"

        return super().do_GET()

    def send_json(self, status_code, data):
        payload = json.dumps(data).encode("utf-8")
        self.send_response(status_code)
        self.send_header("Content-Type", "application/json; charset=utf-8")
        self.send_header("Access-Control-Allow-Origin", "*")
        self.send_header("Content-Length", str(len(payload)))
        self.end_headers()
        self.wfile.write(payload)

    def log_message(self, format, *args):
        # Clean logging
        print(f"[EventHub Server] {self.address_string()} - {format % args}")

def start_server():
    server_address = (HOST, PORT)
    with socketserver.TCPServer(server_address, EventHubRequestHandler) as httpd:
        print("=" * 65)
        print(f"  EVENTHUB SERVER IS ACTIVE & RUNNING!")
        print(f"  URL: http://localhost:{PORT}")
        print(f"  Serving Modular Frontend from: {FRONTEND_DIR}")
        print("=" * 65)
        print("Press Ctrl+C to stop the server.")
        try:
            httpd.serve_forever()
        except KeyboardInterrupt:
            print("\nShutting down EventHub server...")

if __name__ == "__main__":
    start_server()
