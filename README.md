# DevKit Forge 🛠️

> **Fast, private, browser-native developer toolkit with a desktop IDE aesthetic.**  
> 100% client-side processing • Zero server uploads • Zero telemetry • Zero tracking cookies

[![CI](https://github.com/impreseo/devkit-forge/actions/workflows/ci.yml/badge.svg)](https://github.com/impreseo/devkit-forge/actions)
[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](LICENSE)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.7-blue)](https://www.typescriptlang.org/)
[![React](https://img.shields.io/badge/React-18.3-61dafb)](https://react.dev/)
[![Vite](https://img.shields.io/badge/Vite-6.0-646cff)](https://vitejs.dev/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind-3.4-38bdf8)](https://tailwindcss.com/)
[![Vitest](https://img.shields.io/badge/Vitest-2.1-729b1b)](https://vitest.dev/)

---

## 💡 Overview

Modern developer utility websites are frequently overloaded with heavy tracking scripts, intrusive banner ads, slow server-side relays, and oversized marketing pages. **DevKit Forge** provides an open-source, desktop-inspired developer toolkit engineered for speed, privacy, and utility.

All data parsing, compression, regex matching, diffing, and previewing happens **entirely within your browser's memory**. No inputs are ever sent to an external server.

---

## ✨ Features & Included Utilities

### 1. JSON Suite
- **JSON Formatter & Prettifier:** Format nested JSON with configurable indentation (2 spaces, 4 spaces, or tabs) and optional alphabetical key sorting.
- **JSON Minifier & Compressor:** Strip unneeded whitespace and inspect compression statistics (original bytes, minified bytes, space saved, compression %).
- **JSON Validator & Syntax Inspector:** RFC 8259 syntax checker with exact line/column pointers, error excerpt snippets, and structural metrics (key count, nesting depth, root type).
- **JSON Comparison & Diff:** Deep structural path-by-path comparison identifying additions, removals, and modifications with color-coded badges and swap controls.

### 2. Regular Expression Tester
- **Real-Time Match Highlighting:** Matches are highlighted in alternating badges directly over the test text.
- **Full Flag Support:** Toggle `g` (global), `i` (ignore case), `m` (multiline), `s` (dotAll), `u` (unicode), and `y` (sticky).
- **Match Inspector:** Inspects match index spans, match lengths, and named or numbered capture groups.
- **Syntax Error Diagnostics:** Friendly explanations for common regex pitfalls (unclosed parentheses, dangling quantifiers, unclosed character classes).
- **Worker-isolated execution:** Regex evaluation runs in a terminable Web Worker with a 500 ms timeout and input-size limits to protect the UI from pathological patterns.
- **Curated Presets:** Ready-to-test patterns for Email, URL, SemVer, IPv4, ISO 8601 timestamps, Hex colors, and UUID v4.

### 3. Curated .gitignore Generator
- **Zero-Network Generation:** 15+ curated local templates for languages (Node.js, Python, Rust, Go, Java, C/C++), frameworks (React/Vite, Next.js, Flutter), OS (macOS, Windows, Linux), and editors (VS Code, JetBrains, Vim).
- **Category Filter & Tag Selection:** Search templates, toggle multiple tags, append custom project rules, and download `.gitignore` directly.

### 4. Safe Markdown Editor & Live Preview
- **Split & Full Views:** Switch between split editor/preview, editor-only, and preview-only modes.
- **GitHub Flavored Markdown (GFM):** Supports tables, task lists (`- [x]`), inline code, fenced code blocks, and blockquotes.
- **XSS-Safe Sanitization:** Evaluated using `marked` and sanitized with `DOMPurify` to ensure malicious scripts and unsafe tags can never execute.
- **Live Statistics & Export:** Real-time character count, word count, line count, reading time estimation, copy HTML, and `.md` file export.

### 5. Native Desktop IDE Interface
- **Restrained Aesthetics:** Compact toolbars, monospace typography (JetBrains Mono & Inter), subtle IDE borders, and custom low-friction scrollbars.
- **Command Palette (`Ctrl+K` or `⌘K`):** Keyboard-accessible modal with instant fuzzy search across all tools, descriptions, and tags.
- **Favorites & Recents:** Pin frequently used tools and browse recent history; persisted safely in `localStorage`.
- **Theme Switcher:** Seamlessly toggle between dark mode, light mode, or system OS preference.

---

## 🔒 Privacy & Security Guarantees

| Guarantee | How DevKit Forge Enforces It |
| :--- | :--- |
| **Zero Server Uploads** | All computations run in client-side JavaScript memory. No backend API calls exist. |
| **Zero Tracking** | No telemetry libraries, Google Analytics, or third-party cookies are loaded. Fonts use local system stacks; the app does not fetch web fonts at runtime. |
| **XSS Immunity** | Live HTML renders are sanitized via `DOMPurify` before DOM insertion. |
| **Local Storage Only** | Pinned favorites and themes remain on your device in standard `localStorage`. |

---

## 🚀 Getting Started Locally

### Prerequisites
- [Node.js](https://nodejs.org/) v20 or higher
- [npm](https://www.npmjs.com/) v10 or higher

### Installation & Run

```bash
# 1. Clone repository
git clone https://github.com/impreseo/devkit-forge.git
cd devkit-forge

# 2. Install dependencies
npm install

# 3. Start local development server
npm run dev
```

Visit `http://localhost:5173` to explore the workspace.

---

## 🧪 Testing, Linting & Typechecking

DevKit Forge maintains high code quality with automated test suites:

```bash
# Run unit & integration tests with Vitest
npm run test

# Run tests in watch mode during development
npm run test:watch

# Run TypeScript strict type verification
npm run typecheck

# Run ESLint (Flat Config)
npm run lint

# Compile production bundle
npm run build
```

---

## 🌐 Deployment Guide

Because DevKit Forge operates 100% in the browser, the production output in `dist/` consists of static HTML, CSS, and JavaScript.

### 1. GitHub Pages Deployment (automated)

A workflow at `.github/workflows/deploy-pages.yml` runs the typecheck, lint, tests, and production build on every push to `main`, then deploys `dist/` to GitHub Pages if every check passes.

To enable it:

1. Push this repository to GitHub and ensure the default branch is named `main`.
2. Open **Settings → Pages** in the repository.
3. Under **Build and deployment**, choose **GitHub Actions** as the source.
4. Open the **Actions** tab and watch the **Deploy DevKit Forge to GitHub Pages** workflow.
5. After a successful deployment, open the URL shown by the `deploy` job. For a repository named `devkit-forge`, the URL is typically `https://<username>.github.io/devkit-forge/`.

The workflow builds with `VITE_BASE_PATH` set to the repository subpath. If you rename the repository, the workflow uses the new repository name automatically. The deployment URL is not live until you push the files and enable GitHub Pages in repository settings.

### 2. Static Hosts (Vercel, Netlify, Cloudflare Pages)
- **Build command:** `npm run build`
- **Output directory:** `dist`
- **Root directory:** `./`
- **Environment variable:** leave `VITE_BASE_PATH` unset for the default relative asset paths, unless your host requires a specific subpath.

### 2. Static Hosts (Vercel, Netlify, Cloudflare Pages)
- **Build command:** `npm run build`
- **Output directory:** `dist`
- **Root directory:** `./`

---

## 🧩 Adding a New Tool

DevKit Forge has a **modular registry**. To add a tool:

1. Create your component in `src/components/tools/MyTool.tsx`.
2. Add pure utility functions in `src/utils/myToolUtils.ts` and automated tests in `src/test/myToolUtils.test.ts`.
3. Register the tool in `src/registry/tools.ts`:
   ```typescript
   {
     id: 'my-tool',
     title: 'My Tool Title',
     shortDescription: 'Clear summary of the tool.',
     category: 'json', // 'json' | 'regex' | 'git' | 'documentation'
     tags: ['tag1', 'tag2'],
     icon: MyLucideIcon,
     component: MyTool,
   }
   ```
4. Verify with `npm run test` and `npm run typecheck`.

See [CONTRIBUTING.md](CONTRIBUTING.md) for detailed guidelines.

---

## 📄 License

DevKit Forge is open source software licensed under the [MIT License](LICENSE).
