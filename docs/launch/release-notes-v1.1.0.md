# DevKit Forge v1.1.0 — Release Notes

**DevKit Forge v1.1.0** expands the browser-native developer toolkit with three new cryptographic and encoding tools, deep linking navigation, worker-isolated regex substitution, strict input validation, and extended template coverage.

🌐 **Live Demo:** [https://impreseo.github.io/DevKit-Forge/](https://impreseo.github.io/DevKit-Forge/)
📦 **Repository:** [https://github.com/impreseo/DevKit-Forge](https://github.com/impreseo/DevKit-Forge)
📄 **License:** MIT

---

## 🚀 Highlights

### 1. Three New Developer Tools
* **Base64, URL & Hex Encoders:** Full UTF-8 compliant text transformations with bidirectional swapping, character/byte metrics, and strict hexadecimal format validation rejecting malformed hex characters (`1g`, `zz`).
* **Hash & UUID Generator:** Native Web Crypto hashing for SHA-256, SHA-512, SHA-384, and SHA-1 alongside RFC 4122 UUID v4 bulk generation (up to 50 at a time), with proactive contextual guidance if accessed in insecure browser contexts.
* **JWT Inspector:** Safe, in-memory JSON Web Token decoder separating Header, Payload, and Signature components with live timestamp parsing (`exp`, `iat`, `nbf`), countdown expiration analysis, automatic `Bearer ` prefix stripping, and prominent distinction between local decoding and cryptographic signature verification.

### 2. Hash-Based Deep Linking & Browser History
* Direct URL access to individual tools via hash routes (`#/tool-id`, e.g., `#/jwt-inspector`, `#/codec`, `#/hasher`).
* Seamless browser Back and Forward navigation support and tab refresh state preservation fully compatible with GitHub Pages base path.

### 3. Worker-Isolated Regex Replacement
* Safe regex substitution and pattern replacement executing completely inside the isolated Web Worker with 500 ms safety timeout protection.
* Full support for capture group replacement tokens (`$1`, `$2`, `$&`, `$$`).

### 4. Input Validation & Error Handling
* Strict hexadecimal validation rejecting invalid byte pairs and non-hex characters.
* Graceful Web Crypto error handling and security warnings when running in insecure HTTP contexts.

### 5. Expanded Git Templates
* Added curated `.gitignore` configurations for **Docker**, **Terraform**, and **Gradle**.

---

## 🛠️ Improvements

* **Comprehensive Automated Testing:** Expanded Vitest test suite to 130 tests across 8 test suites covering regex timeout/replacement, JWT decoding, cryptographic hashing, codec Unicode round-trips, and component workflows.
* **Enhanced SEO & Social Metadata:** Open Graph and Twitter Card tags configured with high-resolution dashboard preview imagery.
* **Tool Discovery:** Updated Command Palette (`Ctrl+K` / `⌘K`) and Sidebar with search keywords and badges for all 10 tools.
* **Developer Attribution:** Credited project creator Niranjan (IMPRESEO) and acknowledged development assistance from ChatGPT, Claude, Claude Opus, and Gemini.

---

## 👨‍💻 Creator & Acknowledgements

DevKit Forge was created by [Niranjan](https://github.com/impreseo) ([IMPRESEO](https://github.com/impreseo)), with development assistance from [ChatGPT](https://chatgpt.com), [Claude](https://claude.ai), Claude Opus, and [Gemini](https://gemini.google.com).

---

## 🔒 Verified Privacy & Security Guarantees

* **Zero Server Uploads:** All processing executes within browser local memory. No backend APIs, no proxy servers.
* **Zero Telemetry:** No analytics, tracking cookies, or external CDN dependencies.
* **Ephemeral Data:** Refreshing or navigating away clears in-memory user inputs.
