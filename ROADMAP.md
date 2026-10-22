# DevKit Forge Roadmap

This document outlines the planned direction and milestones for DevKit Forge.

---

## 🚀 Released: v1.0.0 (Foundation)
- [x] **Desktop IDE Interface:** Compact typography, restrained neutral colors, dark/light theme switcher, desktop scrollbars.
- [x] **Command Palette:** Keyboard-driven instant search (`Ctrl+K` / `⌘K`) across tool titles, categories, and tags.
- [x] **JSON Suite:**
  - [x] Formatter & Prettifier with 2/4/tab spacing and key sorting
  - [x] Minifier & Compressor with real-time compression metrics
  - [x] Validator & Syntax Inspector with line/column pointers and structural stats
  - [x] Visual Comparison & Structural Diff with path additions, removals, and modifications
- [x] **Regex Tester:** Live match highlighting, flag selectors, capture groups inspector, and syntax error diagnostics.
- [x] **.gitignore Generator:** 15+ curated local templates for languages, frameworks, operating systems, and editors.
- [x] **Markdown Preview:** Safe GFM editor with XSS sanitization (`DOMPurify`), reading stats, and export options.
- [x] **Local Persistence:** Pinned favorites and recently used tools persisted exclusively in `localStorage`.
- [x] **CI/CD:** Automated GitHub Actions pipeline with Vitest, ESLint, TypeScript checking, and Vite production bundle.

---

## 📦 Planned: v1.1.0 (Developer Essentials)
- [ ] **Base64 & URL Encoder/Decoder:** Pure client-side UTF-8 string, binary array, and URL component encoding/decoding.
- [ ] **JWT (JSON Web Token) Inspector:** Safe client-side header and payload decoder with expiration timer inspection (no key verification to avoid security risks).
- [ ] **UUID & Hash Generator:** UUID v4/v7 generator, SHA-256, SHA-512, and MD5 hashing using standard Web Crypto API.
- [ ] **Cron Expression Explainer:** Visual cron schedule parser and next run dates calculation.

---

## 🛠️ Planned: v1.2.0 (Data & Conversion)
- [ ] **cURL to Fetch / Axios / Python Converter:** Transforms standard cURL command lines into idiomatic code snippets.
- [ ] **SQL Query Formatter:** Formatter supporting PostgreSQL, MySQL, SQLite, and ANSI SQL standards.
- [ ] **Color Palette & Contrast Checker:** WCAG 2.1 contrast ratio tester and HEX/RGB/HSL conversion.
- [ ] **Keyboard Shortcut Cheatsheet Overlay:** Press `?` to view all global keybindings.

---

## 🔮 Future Vision (v2.0.0)
- [ ] **WebAssembly Acceleration:** Optional WebAssembly modules for large-file (>10MB) JSON formatting and diffing.
- [ ] **PWA / Offline Desktop App:** Progressive Web App manifest and service worker caching for 100% offline flight/disconnected usage.
- [ ] **Plugin API:** Dynamic runtime loading of sandboxed user scripts.
