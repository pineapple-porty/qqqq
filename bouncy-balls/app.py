from pathlib import Path

from flask import Flask, send_from_directory

BASE_DIR = Path(__file__).resolve().parent

app = Flask(__name__, static_folder=None)


@app.route("/")
def index():
    return send_from_directory(BASE_DIR, "index.html")


@app.route("/css/<path:filename>")
def css(filename):
    return send_from_directory(BASE_DIR / "css", filename)


@app.route("/js/<path:filename>")
def js(filename):
    return send_from_directory(BASE_DIR / "js", filename)


if __name__ == "__main__":
    # 0.0.0.0 so the port is reachable from the GitHub Codespaces "Ports" panel.
    app.run(host="0.0.0.0", port=8000, debug=False)
