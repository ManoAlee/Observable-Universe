# 🌌 Observable Universe (Zero-Entropy Knowledge Engine)

<div align="center">

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](LICENSE)
[![HTML5 / JavaScript](https://img.shields.io/badge/Stack-HTML5%20%2F%20Vanilla%20JS-blue.svg)](universe-web/)
[![CI Status](https://github.com/ManoAlee/Observable-Universe/actions/workflows/ci.yml/badge.svg)](https://github.com/ManoAlee/Observable-Universe/actions)
[![Live Explorer](https://img.shields.io/badge/Live-Interactive%20Explorer-brightgreen.svg)](universe-web/index.html)

**An interactive multi-scale cosmological knowledge graph and scientific document navigator modeling the physical, thermodynamic, and astronomical structures of the observable universe.**

</div>

---

## Overview

**Observable Universe** is a data-driven cosmological visualization platform. Powered by structured manifest schemas (`universe/manifest.json`), it indexes astronomical hierarchies—from fundamental particles and stellar nucleosynthesis to galaxies, galaxy clusters, and the cosmic microwave background (CMB)—rendering dynamic, zero-entropy scientific documentation in the browser.

### Key Features

- 🔭 **Cosmological Graph Navigator:** Real-time exploration of celestial structures categorized by logarithmic distance and physical scale.
- 📜 **Zero-Entropy Document Engine:** Lightweight JSON-driven markdown renderer for structured astronomical papers and telemetry.
- ⚡ **Zero-Dependency Architecture:** Pure HTML5, CSS3, and modern ES6 JavaScript ensuring instantaneous page loads and offline reliability.
- 🌐 **Netlify & Static Host Ready:** Pre-configured `netlify.toml` for seamless static deployment.

---

## Directory Architecture

```
Observable-Universe/
├── universe/             # Cosmological manifests, JSON data schemas and scientific documents
├── universe-app/         # Application shell and state orchestration
├── universe-web/         # Static web client (index.html, styles.css, app.js)
├── netlify.toml          # Static hosting and routing configuration
└── LICENSE               # MIT License
```

---

## Local Setup

Launch the viewer with Python's built-in HTTP server:

```bash
# Clone the repository
git clone https://github.com/ManoAlee/Observable-Universe.git
cd Observable-Universe/universe-web

# Start local server
python -m http.server 8000

# Open in your browser: http://localhost:8000
```

---

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.
