import React, { useState } from 'react';
import { validateJson } from '../../utils/jsonUtils';
import { CheckCircle2, AlertOctagon, RefreshCw, Trash2, ShieldCheck, Code, Layers, Hash } from 'lucide-react';

const VALID_SAMPLE = `{
  "api": "DevKit Forge",
  "endpoint": "/v1/validate",
  "secure": true,
  "config": {
    "rateLimit": 0,
    "networkTransfers": 0,
    "allowedTypes": ["json", "regex", "markdown"]
  },
  "tags": ["offline", "privacy-first", "wasm-free"]
}`;

const BROKEN_SAMPLE = `{
  "api": "DevKit Forge",
  "endpoint": "/v1/validate",
  "secure": true,
  "brokenTrailingComma": true,
}`;

export const JsonValidator: React.FC = () => {
  const [input, setInput] = useState<string>(VALID_SAMPLE);

  const result = validateJson(input);

  const handleClear = () => setInput('');
  const handleLoadValid = () => setInput(VALID_SAMPLE);
  const handleLoadBroken = () => setInput(BROKEN_SAMPLE);

  return (
    <div className="space-y-4">
      {/* Header & Controls Toolbar */}
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-ide-border-light dark:border-ide-border pb-3">
        <div className="flex items-center gap-2">
          <ShieldCheck className="w-5 h-5 text-sky-500" />
          <h2 className="text-base font-semibold text-ide-text-light dark:text-ide-text">
            JSON Validator & Syntax Inspector
          </h2>
          <span className="text-xs px-2 py-0.5 rounded bg-sky-500/10 text-sky-600 dark:text-sky-400 font-mono">
            Client-Side
          </span>
        </div>

        {/* Toolbar Buttons */}
        <div className="flex flex-wrap items-center gap-2 text-xs">
          <button
            type="button"
            onClick={handleLoadValid}
            className="flex items-center gap-1 px-2.5 py-1 rounded border border-ide-border-light dark:border-ide-border bg-ide-panel-light dark:bg-ide-panel text-ide-text-mutedLight dark:text-ide-text-muted hover:text-ide-text-light dark:hover:text-ide-text transition-colors"
            title="Load valid sample"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            <span>Valid Sample</span>
          </button>

          <button
            type="button"
            onClick={handleLoadBroken}
            className="flex items-center gap-1 px-2.5 py-1 rounded border border-rose-500/30 bg-rose-500/10 text-rose-600 dark:text-rose-400 hover:bg-rose-500/20 transition-colors"
            title="Load broken sample to inspect error pointer"
          >
            <span>Broken Sample</span>
          </button>

          <button
            type="button"
            onClick={handleClear}
            className="flex items-center gap-1 px-2.5 py-1 rounded border border-ide-border-light dark:border-ide-border bg-ide-panel-light dark:bg-ide-panel text-ide-text-mutedLight dark:text-ide-text-muted hover:text-rose-500 transition-colors"
            title="Clear editor"
          >
            <Trash2 className="w-3.5 h-3.5" />
            <span>Clear</span>
          </button>
        </div>
      </div>

      {/* Validation Status Banner */}
      {input.trim() ? (
        result.isValid ? (
          <div className="p-3.5 rounded border border-emerald-500/30 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 flex items-center justify-between text-xs">
            <div className="flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
              <span className="font-semibold text-sm">Valid JSON Document</span>
              <span className="opacity-80">— Syntax passed strict RFC 8259 parsing</span>
            </div>
          </div>
        ) : (
          <div className="p-3.5 rounded border border-rose-500/40 bg-rose-500/10 text-rose-600 dark:text-rose-400 text-xs space-y-2">
            <div className="flex items-center gap-2">
              <AlertOctagon className="w-4 h-4 text-rose-500 shrink-0" />
              <span className="font-semibold text-sm">Invalid JSON Syntax Detected</span>
              {result.line && (
                <span className="px-2 py-0.5 rounded bg-rose-500/20 font-mono font-medium">
                  Line {result.line}, Column {result.column}
                </span>
              )}
            </div>
            <p className="font-mono text-xs text-rose-700 dark:text-rose-300 pl-6">{result.error}</p>
            {result.snippet && (
              <pre className="mt-2 p-2.5 rounded bg-slate-900 text-rose-300 font-mono text-xs overflow-x-auto whitespace-pre">
                {result.snippet}
              </pre>
            )}
          </div>
        )
      ) : (
        <div className="p-3 rounded border border-ide-border-light dark:border-ide-border bg-ide-panel-light dark:bg-ide-panel text-xs text-ide-text-mutedLight dark:text-ide-text-muted font-mono">
          Enter or paste JSON payload below to validate syntax.
        </div>
      )}

      {/* Structural Stats (if valid) */}
      {result.isValid && result.stats && (
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs">
          <div className="p-2.5 rounded border border-ide-border-light dark:border-ide-border bg-ide-panel-light dark:bg-ide-panel flex items-center gap-2">
            <Code className="w-4 h-4 text-sky-500" />
            <div>
              <span className="text-ide-text-mutedLight dark:text-ide-text-muted block text-[11px]">Root Type</span>
              <span className="font-mono font-semibold uppercase text-ide-text-light dark:text-ide-text">
                {result.stats.type}
              </span>
            </div>
          </div>
          <div className="p-2.5 rounded border border-ide-border-light dark:border-ide-border bg-ide-panel-light dark:bg-ide-panel flex items-center gap-2">
            <Hash className="w-4 h-4 text-sky-500" />
            <div>
              <span className="text-ide-text-mutedLight dark:text-ide-text-muted block text-[11px]">Total Keys</span>
              <span className="font-mono font-semibold text-ide-text-light dark:text-ide-text">
                {result.stats.keyCount}
              </span>
            </div>
          </div>
          <div className="p-2.5 rounded border border-ide-border-light dark:border-ide-border bg-ide-panel-light dark:bg-ide-panel flex items-center gap-2">
            <Layers className="w-4 h-4 text-sky-500" />
            <div>
              <span className="text-ide-text-mutedLight dark:text-ide-text-muted block text-[11px]">Max Depth</span>
              <span className="font-mono font-semibold text-ide-text-light dark:text-ide-text">
                {result.stats.depth} levels
              </span>
            </div>
          </div>
          <div className="p-2.5 rounded border border-ide-border-light dark:border-ide-border bg-ide-panel-light dark:bg-ide-panel flex items-center gap-2">
            <ShieldCheck className="w-4 h-4 text-sky-500" />
            <div>
              <span className="text-ide-text-mutedLight dark:text-ide-text-muted block text-[11px]">Payload Size</span>
              <span className="font-mono font-semibold text-ide-text-light dark:text-ide-text">
                {result.stats.sizeBytes} B
              </span>
            </div>
          </div>
        </div>
      )}

      {/* Editor Area */}
      <div className="flex flex-col h-[480px] rounded border border-ide-border-light dark:border-ide-border bg-ide-surface-light dark:bg-ide-surface overflow-hidden">
        <div className="flex items-center justify-between px-3 py-2 bg-ide-panel-light dark:bg-ide-panel border-b border-ide-border-light dark:border-ide-border text-xs text-ide-text-mutedLight dark:text-ide-text-muted">
          <span className="font-medium">JSON Source Code</span>
          <span className="font-mono text-[11px]">{input ? `${input.length} characters` : '0 characters'}</span>
        </div>
        <textarea
          aria-label="JSON Source Code"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Type or paste JSON text to test for syntax conformance..."
          className="flex-1 p-3 bg-transparent font-mono text-xs text-ide-text-light dark:text-ide-text focus:outline-none resize-none leading-relaxed overflow-auto"
          spellCheck={false}
        />
      </div>
    </div>
  );
};
