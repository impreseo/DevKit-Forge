import React, { useState, useMemo } from 'react';
import { marked } from 'marked';
import DOMPurify from 'dompurify';
import { FileText, Copy, Check, Download, Trash2, BookOpen, Eye, Code, SplitSquareVertical } from 'lucide-react';

const SAMPLE_MARKDOWN = `# DevKit Forge

Fast, offline-first developer toolkit running **100% locally in your browser**.

## Key Guarantees
- [x] **Zero Tracking:** No analytics or telemetry scripts loaded
- [x] **Zero Cloud Uploads:** All processing executes client-side
- [x] **Desktop IDE Aesthetic:** Clean, compact, native feel
- [ ] Support for native WebAssembly formatters

### Supported Tool Categories

| Category | Tools Included | Engine Status |
| :--- | :--- | :--- |
| **JSON Suite** | Formatter, Minifier, Validator, Diff | Ready |
| **Regex** | Tester, Match Inspector, Presets | Ready |
| **Git Config** | .gitignore Multi-Template Generator | Ready |
| **Docs** | Safe GFM Markdown Previewer | Ready |

\`\`\`typescript
import { formatJson } from 'devkit-forge/utils';

const cleanOutput = formatJson(rawInput, 2);
console.log('Processed securely in-browser:', cleanOutput);
\`\`\`

> *Simplicity is prerequisite for reliability.* — Edsger W. Dijkstra
`;

const TEMPLATES: { name: string; content: string }[] = [
  {
    name: 'README.md',
    content: `# Project Name\n\nBrief one-sentence description of the project.\n\n## Installation\n\`\`\`bash\nnpm install my-package\n\`\`\`\n\n## Usage\n\`\`\`typescript\nimport { feature } from 'my-package';\n\`\`\`\n\n## License\nMIT`,
  },
  {
    name: 'Release Notes',
    content: `# Release v1.2.0\n\n### 🚀 Features\n- Added regex match highlighting with zero latency\n- Curated 15+ local .gitignore presets\n\n### 🐛 Bug Fixes\n- Resolved edge case in JSON diff array indexing\n\n### 📦 Chores\n- Upgraded dependencies to latest stable versions`,
  },
  {
    name: 'Pull Request Template',
    content: `## Description\nExplain what changes this pull request introduces and why.\n\n## Type of Change\n- [ ] Bug fix\n- [ ] New tool feature\n- [ ] Documentation update\n\n## Checklist\n- [ ] Tests written and passing\n- [ ] Type check passes (\`npm run typecheck\`)\n- [ ] Local build verified (\`npm run build\`)`,
  },
];

export const MarkdownPreview: React.FC = () => {
  const [content, setContent] = useState<string>(SAMPLE_MARKDOWN);
  const [viewMode, setViewMode] = useState<'split' | 'editor' | 'preview'>('split');
  const [copiedMd, setCopiedMd] = useState<boolean>(false);
  const [copiedHtml, setCopiedHtml] = useState<boolean>(false);

  // Configure marked for GitHub Flavored Markdown
  marked.setOptions({
    gfm: true,
    breaks: true,
  });

  // Safely parse and sanitize markdown using DOMPurify to eliminate XSS vectors
  const sanitizedHtml = useMemo(() => {
    try {
      const rawHtml = marked.parse(content) as string;
      return DOMPurify.sanitize(rawHtml, {
        USE_PROFILES: { html: true },
        ADD_ATTR: ['target', 'rel'],
      });
    } catch {
      return '<p class="text-rose-500">Error rendering markdown.</p>';
    }
  }, [content]);

  // Statistics
  const stats = useMemo(() => {
    const chars = content.length;
    const words = content.trim() ? content.trim().split(/\s+/).length : 0;
    const lines = content.split('\n').length;
    const readTimeMin = Math.max(1, Math.ceil(words / 200));
    return { chars, words, lines, readTimeMin };
  }, [content]);

  const handleCopyMarkdown = async () => {
    try {
      await navigator.clipboard.writeText(content);
      setCopiedMd(true);
      setTimeout(() => setCopiedMd(false), 2000);
    } catch {
      // Fallback
    }
  };

  const handleCopyHtml = async () => {
    try {
      await navigator.clipboard.writeText(sanitizedHtml);
      setCopiedHtml(true);
      setTimeout(() => setCopiedHtml(false), 2000);
    } catch {
      // Fallback
    }
  };

  const handleDownload = () => {
    const blob = new Blob([content], { type: 'text/markdown;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = 'document.md';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  const handleClear = () => setContent('');

  return (
    <div className="space-y-4">
      {/* Header & Controls Toolbar */}
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-ide-border-light dark:border-ide-border pb-3">
        <div className="flex items-center gap-2">
          <FileText className="w-5 h-5 text-sky-500" />
          <h2 className="text-base font-semibold text-ide-text-light dark:text-ide-text">
            Safe Markdown Editor & Live Preview
          </h2>
          <span className="text-xs px-2 py-0.5 rounded bg-sky-500/10 text-sky-600 dark:text-sky-400 font-mono">
            Client-Side • XSS-Safe
          </span>
        </div>

        {/* Toolbar Buttons */}
        <div className="flex flex-wrap items-center gap-2 text-xs">
          {/* View mode buttons */}
          <div className="flex items-center rounded border border-ide-border-light dark:border-ide-border bg-ide-panel-light dark:bg-ide-panel p-0.5">
            <button
              type="button"
              onClick={() => setViewMode('split')}
              aria-label="Split View"
              aria-pressed={viewMode === 'split'}
              className={`px-2 py-1 rounded flex items-center gap-1 transition-colors ${
                viewMode === 'split'
                  ? 'bg-sky-500 text-white font-medium'
                  : 'text-ide-text-muted hover:text-ide-text-light dark:hover:text-ide-text'
              }`}
              title="Split View"
            >
              <SplitSquareVertical className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Split</span>
            </button>
            <button
              type="button"
              onClick={() => setViewMode('editor')}
              aria-label="Editor Only"
              aria-pressed={viewMode === 'editor'}
              className={`px-2 py-1 rounded flex items-center gap-1 transition-colors ${
                viewMode === 'editor'
                  ? 'bg-sky-500 text-white font-medium'
                  : 'text-ide-text-muted hover:text-ide-text-light dark:hover:text-ide-text'
              }`}
              title="Editor Only"
            >
              <Code className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Editor</span>
            </button>
            <button
              type="button"
              onClick={() => setViewMode('preview')}
              aria-label="Preview Only"
              aria-pressed={viewMode === 'preview'}
              className={`px-2 py-1 rounded flex items-center gap-1 transition-colors ${
                viewMode === 'preview'
                  ? 'bg-sky-500 text-white font-medium'
                  : 'text-ide-text-muted hover:text-ide-text-light dark:hover:text-ide-text'
              }`}
              title="Preview Only"
            >
              <Eye className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Preview</span>
            </button>
          </div>

          <button
            type="button"
            onClick={handleClear}
            className="flex items-center gap-1 px-2.5 py-1 rounded border border-ide-border-light dark:border-ide-border bg-ide-panel-light dark:bg-ide-panel text-ide-text-muted hover:text-rose-500 transition-colors"
            title="Clear editor"
          >
            <Trash2 className="w-3.5 h-3.5" />
            <span>Clear</span>
          </button>

          <button
            type="button"
            onClick={handleCopyMarkdown}
            className="flex items-center gap-1 px-2.5 py-1 rounded border border-ide-border-light dark:border-ide-border bg-ide-panel-light dark:bg-ide-panel text-ide-text-light dark:text-ide-text hover:border-sky-500 transition-colors"
            title="Copy Raw Markdown"
          >
            {copiedMd ? <Check className="w-3.5 h-3.5 text-emerald-500" /> : <Copy className="w-3.5 h-3.5" />}
            <span>{copiedMd ? 'Copied' : 'Copy MD'}</span>
          </button>

          <button
            type="button"
            onClick={handleCopyHtml}
            className="flex items-center gap-1 px-2.5 py-1 rounded border border-ide-border-light dark:border-ide-border bg-ide-panel-light dark:bg-ide-panel text-ide-text-light dark:text-ide-text hover:border-sky-500 transition-colors"
            title="Copy Sanitized HTML"
          >
            {copiedHtml ? <Check className="w-3.5 h-3.5 text-emerald-500" /> : <Copy className="w-3.5 h-3.5" />}
            <span>{copiedHtml ? 'Copied' : 'Copy HTML'}</span>
          </button>

          <button
            type="button"
            onClick={handleDownload}
            className="flex items-center gap-1 px-3 py-1 rounded bg-sky-600 hover:bg-sky-500 text-white font-medium transition-colors"
            title="Download .md file"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Export .md</span>
          </button>
        </div>
      </div>

      {/* Templates & Quick Metrics Bar */}
      <div className="flex flex-wrap items-center justify-between gap-2 p-2 rounded border border-ide-border-light dark:border-ide-border bg-ide-panel-light dark:bg-ide-panel text-xs">
        <div className="flex flex-wrap items-center gap-1.5 sm:gap-2">
          <BookOpen className="w-3.5 h-3.5 text-sky-500 shrink-0" />
          <span className="text-ide-text-muted font-medium">Templates:</span>
          {TEMPLATES.map((tmpl) => (
            <button
              key={tmpl.name}
              type="button"
              onClick={() => setContent(tmpl.content)}
              className="px-2 py-0.5 rounded bg-ide-surface-light dark:bg-ide-surface border border-ide-border-light dark:border-ide-border hover:border-sky-500 text-ide-text-light dark:text-ide-text text-[11px] transition-colors"
            >
              {tmpl.name}
            </button>
          ))}
        </div>

        <div className="flex flex-wrap items-center gap-2 sm:gap-3 font-mono text-[10px] sm:text-[11px] text-ide-text-muted">
          <span>{stats.words} words</span>
          <span>{stats.chars} chars</span>
          <span>{stats.lines} lines</span>
          <span>~{stats.readTimeMin} min read</span>
        </div>
      </div>

      {/* Editor & Preview Panes */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Markdown Source Editor */}
        {(viewMode === 'split' || viewMode === 'editor') && (
          <div
            className={`flex flex-col h-[380px] sm:h-[480px] lg:h-[560px] rounded border border-ide-border-light dark:border-ide-border bg-ide-surface-light dark:bg-ide-surface overflow-hidden ${
              viewMode === 'editor' ? 'lg:col-span-2' : ''
            }`}
          >
            <div className="flex items-center justify-between px-3 py-2 bg-ide-panel-light dark:bg-ide-panel border-b border-ide-border-light dark:border-ide-border text-xs text-ide-text-muted">
              <span className="font-medium">Markdown Source (GFM)</span>
              <span className="font-mono text-[11px]">{stats.lines} lines</span>
            </div>
            <textarea
              aria-label="Markdown Source Code"
              value={content}
              onChange={(e) => setContent(e.target.value)}
              placeholder="Write your markdown here..."
              className="flex-1 p-3 bg-transparent font-mono text-xs text-ide-text-light dark:text-ide-text focus:outline-none resize-none leading-relaxed overflow-auto"
              spellCheck={false}
            />
          </div>
        )}

        {/* Live Sanitized Preview */}
        {(viewMode === 'split' || viewMode === 'preview') && (
          <div
            className={`flex flex-col h-[380px] sm:h-[480px] lg:h-[560px] rounded border border-ide-border-light dark:border-ide-border bg-ide-surface-light dark:bg-ide-surface overflow-hidden ${
              viewMode === 'preview' ? 'lg:col-span-2' : ''
            }`}
          >
            <div className="flex items-center justify-between px-3 py-2 bg-ide-panel-light dark:bg-ide-panel border-b border-ide-border-light dark:border-ide-border text-xs text-ide-text-muted">
              <span className="font-medium">Rendered Preview (DOMPurified)</span>
              <span className="font-mono text-[11px] text-emerald-500">Live</span>
            </div>
            <div className="flex-1 p-4 overflow-auto bg-ide-surface-light dark:bg-ide-surface/50">
              <div
                className="markdown-preview text-xs sm:text-sm text-ide-text-light dark:text-ide-text leading-relaxed"
                dangerouslySetInnerHTML={{ __html: sanitizedHtml }}
              />
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
