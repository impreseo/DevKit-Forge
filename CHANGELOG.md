# Changelog

All notable changes to **DevKit Forge** will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

---

## [1.0.0] - 2026-10-22

### Summary
Initial production launch of **DevKit Forge** — a fast, privacy-focused, browser-native developer toolkit with a desktop IDE aesthetic. All computations, parsing, and data comparisons run 100% in local browser memory with zero server relays and zero telemetry.

### Added
* **JSON Suite:**
  * **JSON Formatter:** Multi-indentation formatting (2 spaces, 4 spaces, tabs) with alphabetical key sorting and clipboard actions.
  * **JSON Minifier:** Whitespace stripper with real-time compression metrics (original bytes, minified bytes, bytes saved, compression %).
  * **JSON Validator:** RFC 8259 syntax checker featuring exact line/column pointers, contextual error excerpt snippets, and structural metrics (key count, nesting depth, root type).
  * **JSON Structural Comparison:** Deep key-by-key path comparison detecting added, removed, and modified properties with color-coded status badges, side-by-side review, and swap controls.
* **Regular Expression Suite:**
  * **Regex Tester:** Live pattern evaluator with alternating match highlight badges directly over the test text.
  * **Flag Controls:** Support for `g`, `i`, `m`, `s`, `u`, and `y` regex flags.
  * **Match Inspector:** Breakdown of match index spans, match lengths, and named/numbered capture groups.
  * **Web Worker Isolation:** Pattern evaluation executed in a terminable Web Worker with a 500 ms safety timeout to prevent ReDoS UI freezes.
  * **Curated Presets:** Ready-to-test patterns for Email, URL, SemVer, IPv4, ISO 8601, Hex colors, and UUID v4.
* **Git Utilities:**
  * **.gitignore Generator:** 15+ curated local templates across Languages (Node.js, Python, Rust, Go, Java, C/C++), Frameworks (React/Vite, Next.js, Flutter), Operating Systems (macOS, Windows, Linux), and Editors (VS Code, JetBrains, Vim).
  * **Zero-Network Generation:** 100% offline template assembly with custom rule appending and direct `.gitignore` file download.
* **Documentation Suite:**
  * **Markdown Preview:** Safe GitHub Flavored Markdown (GFM) editor with split, editor-only, and preview-only modes.
  * **XSS Defense:** Parsed via `marked` and sanitized with `DOMPurify` to eliminate cross-site scripting risks.
  * **Document Metrics:** Live character, word, and line count with estimated reading time, copy HTML, and `.md` file export.
* **Desktop IDE Interface:**
  * **Command Palette:** Global `Ctrl+K` / `⌘K` modal with instant fuzzy search across tools, descriptions, and tags.
  * **Navigation & Themes:** Dark mode (default), Light mode, and OS System preference; pinned favorites and recent history persisted safely in `localStorage`.
* **CI/CD & Deployment:**
  * Automated GitHub Actions pipeline for linting (ESLint 9), typechecking (TypeScript 5.7), unit/integration testing (Vitest 2.1), and automated deployment to GitHub Pages.

### Security & Privacy
* Zero network requests: Verified absence of `fetch()`, `XMLHttpRequest`, or `sendBeacon` calls.
* Zero tracking or analytics cookies.
* Local system font resolution: no runtime Google Fonts or CDN requests.
* Ephemeral data retention: User inputs and payloads exist solely in volatile React state.

### Known Limitations
* Regular expression testing relies on the browser's JavaScript RegExp engine (V8 / JavaScriptCore). Features specific to PCRE, Python `re`, or Oniguruma (e.g. recursive patterns, atomic grouping without lookaround) are subject to standard ECMAScript specifications.
* Very large JSON payloads (>15 MB) may cause brief UI stutter during deep comparison; WebAssembly offloading is planned for v2.0.0.
