# Contributing to DevKit Forge

Thank you for your interest in contributing to DevKit Forge! We welcome contributions ranging from new client-side developer utilities to performance optimizations, accessibility improvements, and documentation enhancements.

---

## Architecture Principles

Every contribution must honor our core design and security principles:
1. **100% In-Browser Execution:** Utilities must never upload user data or invoke external server endpoints.
2. **Zero Telemetry:** No tracking, telemetry scripts, or cookies may be added.
3. **Desktop IDE Aesthetic:** Maintain clean, compact typography (JetBrains Mono & Inter), subtle borders (`border-ide-border`), accessible contrast, and native developer tool ergonomics. No excessive gradients or marketing fluff.
4. **Resilient Error Handling:** Inputs must be validated safely with informative error indicators and helpful pointers.

---

## Development Setup

### 1. Prerequisites
- Node.js `20.x` or higher
- npm `10.x` or higher

### 2. Install Dependencies
```bash
git clone https://github.com/impreseo/devkit-forge.git
cd devkit-forge
npm install
```

### 3. Start Local Development Server
```bash
npm run dev
```
Open `http://localhost:5173` in your browser.

---

## How to Add a New Tool

DevKit Forge uses a **modular tool registry** designed for easy and safe expansion. Adding a new tool is accomplished in three steps:

### Step 1: Implement the Pure Logic & Unit Tests
Create your algorithmic logic in `src/utils/myToolUtils.ts` and companion tests in `src/test/myToolUtils.test.ts`.

```typescript
// src/utils/hashUtils.ts
export function computeHash(text: string): string {
  // Pure in-browser logic
  return ...;
}
```

### Step 2: Build the Tool React Component
Create `src/components/tools/MyTool.tsx`. Use standard IDE toolbar conventions (Copy, Clear, Sample data, Error Callout):

```tsx
import React, { useState } from 'react';
import { Copy, Trash2, Cpu } from 'lucide-react';

export const MyTool: React.FC = () => {
  const [input, setInput] = useState('');

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between border-b border-ide-border-light dark:border-ide-border pb-3">
        <div className="flex items-center gap-2">
          <Cpu className="w-5 h-5 text-sky-500" />
          <h2 className="text-base font-semibold">My Developer Tool</h2>
        </div>
        <div className="flex items-center gap-2 text-xs">
          {/* Action buttons */}
        </div>
      </div>
      {/* Tool Workspaces */}
    </div>
  );
};
```

### Step 3: Register in the Modular Tool Registry
Open `src/registry/tools.ts`, import your component, and register its metadata:

```typescript
import { MyTool } from '../components/tools/MyTool';
import { Hash } from 'lucide-react';

export const TOOL_REGISTRY: ToolMetadata[] = [
  // ... existing tools
  {
    id: 'my-new-tool',
    title: 'My New Tool',
    shortDescription: 'Concise explanation of what this utility does.',
    category: 'json', // 'json' | 'regex' | 'git' | 'documentation'
    tags: ['hash', 'crypto', 'checksum', 'offline'],
    icon: Hash,
    component: MyTool,
    featured: true,
  },
];
```

The tool is immediately indexed, searchable via the Command Palette (`Ctrl+K`), filterable by category, and supportable as a favorite!

---

## Validation & Verification Commands

Before opening a pull request, run all quality checks locally:

```bash
# 1. Typecheck TypeScript
npm run typecheck

# 2. Run ESLint flat configuration
npm run lint

# 3. Run all Vitest unit and integration tests
npm run test

# 4. Verify production bundle build
npm run build
```

---

## Pull Request Process

1. Fork the repository and create a branch from `main`:
   ```bash
   git checkout -b feature/my-new-tool
   ```
2. Commit clear, descriptive changes.
3. Ensure all tests and linting pass (`npm run typecheck && npm run lint && npm run test && npm run build`).
4. Submit a Pull Request referencing any relevant issue.
