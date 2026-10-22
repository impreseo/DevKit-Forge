import React, { useState } from 'react';
import { formatJson } from '../../utils/jsonUtils';
import { Copy, Check, Trash2, ArrowDownAZ, FileCode, AlertCircle, RefreshCw } from 'lucide-react';

const SAMPLE_JSON = `{
  "projectName": "DevKit Forge",
  "version": "1.0.0",
  "status": "production-ready",
  "privacy": {
    "clientSideOnly": true,
    "telemetry": false,
    "cloudStorage": false
  },
  "modules": ["json-formatter", "regex-tester", "gitignore-gen", "markdown-preview"],
  "features": {
    "theme": "ide-dark",
    "speedMs": 0.4
  }
}`;

export const JsonFormatter: React.FC = () => {
  const [input, setInput] = useState<string>(SAMPLE_JSON);
  const [indent, setIndent] = useState<number | string>(2);
  const [sortKeys, setSortKeys] = useState<boolean>(false);
  const [copied, setCopied] = useState<boolean>(false);

  const { output, error } = formatJson(input, indent, sortKeys);

  const handleCopy = async () => {
    if (!output) return;
    try {
      await navigator.clipboard.writeText(output);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // Fallback
    }
  };

  const handleClear = () => {
    setInput('');
  };

  const handleLoadSample = () => {
    setInput(SAMPLE_JSON);
  };

  return (
    <div className="space-y-4">
      {/* Header & Controls Toolbar */}
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-ide-border-light dark:border-ide-border pb-3">
        <div className="flex items-center gap-2">
          <FileCode className="w-5 h-5 text-sky-500" />
          <h2 className="text-base font-semibold text-ide-text-light dark:text-ide-text">
            JSON Formatter & Prettifier
          </h2>
          <span className="text-xs px-2 py-0.5 rounded bg-sky-500/10 text-sky-600 dark:text-sky-400 font-mono">
            Client-Side
          </span>
        </div>

        {/* Toolbar buttons */}
        <div className="flex flex-wrap items-center gap-2 text-xs">
          {/* Indentation Selector */}
          <div className="flex items-center gap-1.5 bg-ide-panel-light dark:bg-ide-panel px-2 py-1 rounded border border-ide-border-light dark:border-ide-border">
            <span className="text-ide-text-mutedLight dark:text-ide-text-muted font-medium">Indent:</span>
            <select
              aria-label="Indent spacing"
              value={indent}
              onChange={(e) => setIndent(e.target.value === 'tab' ? 'tab' : Number(e.target.value))}
              className="bg-transparent text-ide-text-light dark:text-ide-text font-mono text-xs focus:outline-none cursor-pointer"
            >
              <option value={2} className="dark:bg-ide-panel text-slate-800 dark:text-slate-100">2 Spaces</option>
              <option value={4} className="dark:bg-ide-panel text-slate-800 dark:text-slate-100">4 Spaces</option>
              <option value="tab" className="dark:bg-ide-panel text-slate-800 dark:text-slate-100">Tab</option>
            </select>
          </div>

          {/* Sort Keys Toggle */}
          <button
            type="button"
            onClick={() => setSortKeys(!sortKeys)}
            className={`flex items-center gap-1 px-2.5 py-1 rounded border transition-colors ${
              sortKeys
                ? 'bg-sky-500/15 border-sky-500 text-sky-600 dark:text-sky-400 font-medium'
                : 'bg-ide-panel-light dark:bg-ide-panel border-ide-border-light dark:border-ide-border text-ide-text-mutedLight dark:text-ide-text-muted hover:text-ide-text-light dark:hover:text-ide-text'
            }`}
            title="Sort object keys alphabetically"
          >
            <ArrowDownAZ className="w-3.5 h-3.5" />
            <span>Sort Keys</span>
          </button>

          {/* Load Sample Button */}
          <button
            type="button"
            onClick={handleLoadSample}
            className="flex items-center gap-1 px-2.5 py-1 rounded border border-ide-border-light dark:border-ide-border bg-ide-panel-light dark:bg-ide-panel text-ide-text-mutedLight dark:text-ide-text-muted hover:text-ide-text-light dark:hover:text-ide-text transition-colors"
            title="Load sample JSON"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            <span>Sample</span>
          </button>

          {/* Clear Button */}
          <button
            type="button"
            onClick={handleClear}
            className="flex items-center gap-1 px-2.5 py-1 rounded border border-ide-border-light dark:border-ide-border bg-ide-panel-light dark:bg-ide-panel text-ide-text-mutedLight dark:text-ide-text-muted hover:text-rose-500 transition-colors"
            title="Clear editor"
          >
            <Trash2 className="w-3.5 h-3.5" />
            <span>Clear</span>
          </button>

          {/* Copy Output Button */}
          <button
            type="button"
            onClick={handleCopy}
            disabled={!output || !!error}
            className="flex items-center gap-1 px-3 py-1 rounded bg-sky-600 hover:bg-sky-500 text-white font-medium disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
            title="Copy formatted JSON to clipboard"
          >
            {copied ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
            <span>{copied ? 'Copied' : 'Copy Formatted'}</span>
          </button>
        </div>
      </div>

      {/* Error Callout if any */}
      {error && (
        <div className="flex items-start gap-2.5 p-3 rounded bg-rose-500/10 border border-rose-500/30 text-rose-600 dark:text-rose-400 text-xs font-mono">
          <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
          <div className="flex-1">
            <span className="font-semibold">Parse Error:</span> {error}
          </div>
        </div>
      )}

      {/* Editor Split View */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Input Column */}
        <div className="flex flex-col h-[520px] rounded border border-ide-border-light dark:border-ide-border bg-ide-surface-light dark:bg-ide-surface overflow-hidden">
          <div className="flex items-center justify-between px-3 py-2 bg-ide-panel-light dark:bg-ide-panel border-b border-ide-border-light dark:border-ide-border text-xs text-ide-text-mutedLight dark:text-ide-text-muted">
            <span className="font-medium">Raw Input JSON</span>
            <span className="font-mono text-[11px]">{input ? `${input.length} chars` : 'Empty'}</span>
          </div>
          <textarea
            aria-label="Raw Input JSON"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Paste your unformatted JSON here..."
            className="flex-1 p-3 bg-transparent font-mono text-xs text-ide-text-light dark:text-ide-text focus:outline-none resize-none leading-relaxed overflow-auto"
            spellCheck={false}
          />
        </div>

        {/* Output Column */}
        <div className="flex flex-col h-[520px] rounded border border-ide-border-light dark:border-ide-border bg-ide-surface-light dark:bg-ide-surface overflow-hidden">
          <div className="flex items-center justify-between px-3 py-2 bg-ide-panel-light dark:bg-ide-panel border-b border-ide-border-light dark:border-ide-border text-xs text-ide-text-mutedLight dark:text-ide-text-muted">
            <span className="font-medium">Formatted Output</span>
            <span className="font-mono text-[11px]">{output ? `${output.split('\n').length} lines` : '0 lines'}</span>
          </div>
          <div className="flex-1 p-3 overflow-auto bg-ide-surface-light dark:bg-ide-surface/50">
            {output ? (
              <pre className="font-mono text-xs text-ide-text-light dark:text-ide-text leading-relaxed whitespace-pre selection:bg-sky-500/20">
                {output}
              </pre>
            ) : (
              <div className="h-full flex items-center justify-center text-xs text-ide-text-mutedLight dark:text-ide-text-muted font-mono">
                {error ? 'Fix input error to view formatted output' : 'Formatted output will appear here'}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
