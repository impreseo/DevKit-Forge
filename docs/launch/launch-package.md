# DevKit Forge — Public Launch & Distribution Package

This document contains ready-to-use launch content, demo scripts, and distribution guidelines for announcing **DevKit Forge v1.0.0**.

🌐 **Live Application:** [https://impreseo.github.io/DevKit-Forge/](https://impreseo.github.io/DevKit-Forge/)  
📦 **GitHub Repository:** [https://github.com/impreseo/DevKit-Forge](https://github.com/impreseo/DevKit-Forge)

---

## A. GitHub Repository Metadata

### Repository Description
> Fast, privacy-focused browser-based developer toolkit for JSON, regex, Git utilities, and Markdown.

### Website URL
> `https://impreseo.github.io/DevKit-Forge/`

### Suggested GitHub Topics
`developer-tools`, `developer-utilities`, `json-formatter`, `json-diff`, `regex-tester`, `gitignore-generator`, `markdown-preview`, `privacy-focused`, `client-side`, `react`, `typescript`, `vite`, `tailwind-css`

---

## B. Social Launch Copy

### Option 1: Professional Developer Post (LinkedIn / Tech Communities)

```text
Tired of ad-heavy developer utility websites that send your code and tokens to third-party servers?

I built and launched DevKit Forge 🛠️ — an open-source, desktop-inspired developer toolkit that runs 100% in your browser.

Key Highlights:
• Zero Server Relays: All computations run strictly in client memory. No inputs leave your machine.
• Zero Telemetry: No analytics, no tracking pixels, and no third-party cookies.
• Fast & Native Aesthetic: Clean desktop IDE UI with a global Command Palette (Ctrl+K / ⌘K) and Dark/Light modes.

Included Tools in v1.0.0:
1. JSON Suite: Formatter, Minifier, RFC 8259 Validator with line pointers, and deep structural path comparison (Diff).
2. Regex Tester: Real-time match highlighting, flag controls, capture group breakdown, and Web Worker isolation with a 500ms safety timeout to prevent ReDoS UI freezing.
3. .gitignore Generator: 15+ curated local templates for languages, frameworks, OS, and editors—built 100% offline.
4. Markdown Preview: GitHub Flavored Markdown editor with live metrics, DOMPurify XSS defense, and export controls.

Try the live app: https://impreseo.github.io/DevKit-Forge/
Source code (MIT): https://github.com/impreseo/DevKit-Forge

Feedback, tool suggestions, and contributions are warmly welcome!
```

---

### Option 2: Short-Form Social Post (X / Twitter / Mastodon)

```text
🚀 Launching DevKit Forge: an open-source, client-side developer toolkit with a desktop IDE feel.

🛠️ JSON Diff & Formatter
🔍 Regex Tester (Worker-isolated, 500ms timeout)
📋 Curated .gitignore Generator (100% offline)
📝 Safe GFM Markdown Preview (DOMPurify sanitized)

🔒 Zero server uploads • Zero telemetry • MIT

Try live: https://impreseo.github.io/DevKit-Forge/
GitHub: https://github.com/impreseo/DevKit-Forge
```

---

### Option 3: Technical Community Post (Reddit r/webdev or Show HN)

**Title:** Show HN: DevKit Forge – Browser-native developer toolkit (Zero server uploads, zero tracking)

```text
Hey everyone,

Like many developers, I frequently format JSON, debug regex patterns, generate .gitignore files, or preview Markdown. But many everyday utility sites have become bloated with intrusive ads, trackers, and unneeded server roundtrips.

I wanted a fast, distraction-free toolkit with a native desktop IDE aesthetic where privacy is architecturally guaranteed:

• 100% Client-Side: Inputs are processed exclusively in browser memory.
• Zero Outbound Network Requests: The entire application has 0 fetch(), XMLHttpRequest, or sendBeacon calls.
• No Telemetry: Zero analytics libraries, tracking pixels, or cookies. Fonts resolve from local system stacks.
• Web Worker Protection: The regex tester runs in a dedicated worker with a 500ms timeout to avoid UI freezes.
• Safe Markdown: GFM parsed via marked and sanitized via DOMPurify.

Stack: React 18, TypeScript, Vite, Tailwind CSS, Vitest.

Live Demo: https://impreseo.github.io/DevKit-Forge/
GitHub Repo: https://github.com/impreseo/DevKit-Forge

I'd love feedback on ergonomics, missing everyday utilities, or edge-case handling!
```

---

## C. 30–60 Second Video / Screencast Demo Script

| Time | Screen / Visual | Voiceover / Action |
| :--- | :--- | :--- |
| **0:00 – 0:10** | **Dashboard Overview** (`docs/screenshots/dashboard.png`) | *"This is DevKit Forge — a fast, private developer toolkit designed like a desktop IDE. Notice the clean interface, dark theme, and keyboard navigation."* <br>Press `Ctrl+K` to reveal the fuzzy Command Palette. |
| **0:10 – 0:25** | **JSON Comparison** (`docs/screenshots/json-diff.png`) | Navigate to JSON Comparison. <br>*"Instead of a raw text diff, the JSON comparison recursively analyzes structural paths, instantly highlighting added, removed, and modified keys with color badges and swap controls."* |
| **0:25 – 0:40** | **Regex Tester** (`docs/screenshots/regex-tester.png`) | Select Regex Tester from sidebar. <br>*"The regex tester provides real-time match highlighting and capture group inspection. Because it runs in an isolated Web Worker with a 500ms timeout, catastrophic backtracking won't lock up your browser tab."* |
| **0:40 – 0:55** | **Markdown Preview & .gitignore** (`docs/screenshots/markdown-preview.png`) | Click Markdown Preview. <br>*"The Markdown editor features live GFM rendering, document metrics, and XSS sanitization via DOMPurify. You also get a local .gitignore generator with 15+ curated templates."* |
| **0:55 – 1:00** | **Conclusion & Link** | *"100% client-side, zero tracking, MIT licensed. Try it at impreseo.github.io/DevKit-Forge."* |

---

## D. Distribution & Community Checklist

Before posting to any community, check these guidelines:

### 1. Developer Subreddits (e.g. `r/webdev`, `r/javascript`, `r/reactjs`)
* **Format:** Self-post with technical explanation, architectural decisions, and links.
* **Rules to Verify:**
  * Must comply with self-promotion ratios (e.g. 9:1 rule on Reddit).
  * Check day-specific rules (some subreddits only allow project showcases on "Showoff Saturday").
  * Do not ask for upvotes or stars.

### 2. Hacker News (`Show HN`)
* **Format:** Submit directly as a URL (`https://impreseo.github.io/DevKit-Forge/`) with title `Show HN: DevKit Forge – Browser-native developer toolkit (zero server uploads)`.
* **Rules to Verify:**
  * Read the official Show HN guidelines. The submitted link must lead directly to a working product.
  * Be present in the comments to answer questions about architecture and performance.

### 3. Developer Blogs (Dev.to / Hashnode / Medium)
* **Format:** A short technical article: *"Building a Zero-Telemetry Developer Toolkit with React, Vite, and Web Workers"*.
* **Focus:** Deep-dive into Web Worker timeouts for regex safety, deep JSON structural diffing, and GitHub Pages CI/CD configuration.

### 4. GitHub Community & Awesome Lists
* Target curated lists such as `awesome-developer-tools`, `awesome-privacy`, and `awesome-react`.
* Open respectful PRs following each list's contribution guidelines.
