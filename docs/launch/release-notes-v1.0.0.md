# DevKit Forge v1.0.0 — Launch Release Notes

**DevKit Forge** is an open-source, client-side developer toolkit engineered for speed, utility, and absolute privacy. It provides a focused set of everyday utilities running inside a native desktop IDE aesthetic.

🌐 **Live Demo:** [https://impreseo.github.io/DevKit-Forge/](https://impreseo.github.io/DevKit-Forge/)  
📦 **Repository:** [https://github.com/impreseo/DevKit-Forge](https://github.com/impreseo/DevKit-Forge)  
📄 **License:** MIT

---

## 🛠️ Implemented Tool Suites

### 1. JSON Suite
* **JSON Formatter:** Prettify JSON with configurable indentation (2 spaces, 4 spaces, tabs) and optional alphabetical key sorting.
* **JSON Minifier:** Whitespace stripper with real-time compression metrics (original bytes, minified bytes, bytes saved, compression ratio).
* **JSON Validator:** RFC 8259 syntax checker with exact line/column pointers, error excerpt snippets, and structural metrics (key count, nesting depth, root type).
* **JSON Structural Comparison:** Deep key-by-key recursive diff identifying added, removed, and modified properties with color-coded status badges, side-by-side review, and swap controls.

### 2. Regular Expression Suite
* **Regex Tester:** Live pattern evaluator with alternating match highlight badges directly over the test text.
* **Full Flag Controls:** Toggle `g`, `i`, `m`, `s`, `u`, and `y` flags.
* **Match Inspector:** Inspects character spans, lengths, and named/numbered capture groups.
* **Worker-Isolated Execution:** Evaluated inside a dedicated Web Worker with a 500 ms safety timeout to guard against catastrophic backtracking (ReDoS).
* **Curated Presets:** Ready-to-test patterns for Email, URL, SemVer, IPv4, ISO 8601, Hex colors, and UUID v4.

### 3. Git Utilities
* **.gitignore Generator:** 15+ curated local templates across Languages (Node.js, Python, Rust, Go, Java, C/C++), Frameworks (React/Vite, Next.js, Flutter), Operating Systems (macOS, Windows, Linux), and Editors (VS Code, JetBrains, Vim).
* **Zero-Network Assembly:** Assembled completely client-side with custom rule appending, clipboard copy, and `.gitignore` file download.

### 4. Documentation Suite
* **Markdown Preview:** Safe GitHub Flavored Markdown (GFM) editor with split, editor-only, and preview-only modes.
* **XSS Sanitization:** Evaluated via `marked` and sanitized through `DOMPurify` to neutralize unsafe script injections.
* **Document Metrics:** Live character, word, and line count with estimated reading time, copy HTML, and `.md` file export.

### 5. Desktop IDE Interface
* **Command Palette:** Global `Ctrl+K` / `⌘K` modal with instant fuzzy search across all tools, descriptions, and tags.
* **Theme Support:** Dark mode (default), Light mode, and OS System preference.
* **Local Persistence:** Pinned favorites and recent history persisted safely in `localStorage`.

---

## 🔒 Verified Privacy & Security Guarantees

* **Zero Server Uploads:** All processing executes within your browser's local memory. No backend APIs, no proxy servers.
* **Zero Telemetry:** No Google Analytics, tracking cookies, or marketing beacons.
* **Local Font Resolution:** Monospace and sans-serif typography resolves from native system font stacks—no runtime requests to Google Fonts or third-party CDNs.
* **Ephemeral Data:** User inputs and code snippets are never written to disk or `localStorage`. Refreshing or closing the tab wipes all data.

---

## 🚀 Getting Started

```bash
# Clone repository
git clone https://github.com/impreseo/DevKit-Forge.git
cd DevKit-Forge

# Install dependencies
npm ci

# Start local development server
npm run dev
```

---

## ⚠️ Known Limitations
* Regular expressions run against ECMAScript RegExp standards. Specialized syntax from PCRE or Python `re` (such as recursion or atomic groups without lookaround) follows standard browser engine support.
* Deep structural diffing of large JSON documents (>15 MB) runs on the main thread; WebAssembly acceleration is planned for v2.0.0.

---

## 🤝 Feedback & Contributions
Found a bug or have a tool proposal? Please open an issue on our [GitHub Issue Tracker](https://github.com/impreseo/DevKit-Forge/issues) or check [CONTRIBUTING.md](https://github.com/impreseo/DevKit-Forge/blob/main/CONTRIBUTING.md).
