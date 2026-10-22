# Security Policy

## Core Security Model: Client-Side Sandbox

DevKit Forge is engineered with a strict **local-first, browser-only architecture**:

1. **Zero Data Uploads:** User inputs, tokens, code snippets, and payloads are strictly processed in the browser's JavaScript engine memory. They are never transmitted over the network.
2. **Zero Telemetry:** No analytics scripts, tracker cookies, or remote logging exist in this repository.
3. **Safe Markdown Rendering:** All markdown output is parsed via `marked` and sanitized with `DOMPurify` to neutralize cross-site scripting (XSS) vectors.
4. **Regular Expression Safety:** The regex engine wraps pattern evaluation to guard against catastrophic backtracking and browser UI freezing.

## Supported Versions

| Version | Supported          |
| ------- | ------------------ |
| 1.0.x   | :white_check_mark: |

## Reporting Security Issues

If you discover a security vulnerability (such as an XSS bypass in markdown sanitization or sensitive data leakage in browser storage):

1. **Do not** file a public issue.
2. Submit a private advisory via GitHub Security Advisories or contact the maintainers directly.
3. Include clear reproduction steps, sample payload, and environment details.

We aim to review reports within 48 hours and release patched updates swiftly.
