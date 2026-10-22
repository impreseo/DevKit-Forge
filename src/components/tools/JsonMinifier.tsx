import React, { useState } from 'react';
import { minifyJson, isLargeJson, hasUnsafeInteger } from '../../utils/jsonUtils';
import { Minimize2, Copy, Check, Trash2, RefreshCw, AlertCircle, AlertTriangle, ArrowRight } from 'lucide-react';

const SAMPLE_JSON = `{
  "compilerOptions": {
    "target": "ES2022",
    "module": "ESNext",
    "moduleResolution": "bundler",
    "strict": true,
    "noEmit": true
  },
  "include": [
    "src/**/*",
    "tests/**/*"
  ],
  "exclude": [
    "node_modules",
    "dist"
  ]
}`;

export const JsonMinifier: React.FC = () => {
  const [input, setInput] = useState<string>(SAMPLE_JSON);
  const [copied, setCopied] = useState<boolean>(false);

  const { output, originalBytes, minifiedBytes, savedBytes, compressionPercent, error } =
    minifyJson(input);

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
          <Minimize2 className="w-5 h-5 text-sky-500" />
          <h2 className="text-base font-semibold text-ide-text-light dark:text-ide-text">
            JSON Minifier & Compressor
          </h2>
          <span className="text-xs px-2 py-0.5 rounded bg-sky-500/10 text-sky-600 dark:text-sky-400 font-mono">
            Client-Side
          </span>
        </div>

        {/* Toolbar Buttons */}
        <div className="flex flex-wrap items-center gap-2 text-xs">
          <button
            type="button"
            onClick={handleLoadSample}
            className="flex items-center gap-1 px-2.5 py-1 rounded border border-ide-border-light dark:border-ide-border bg-ide-panel-light dark:bg-ide-panel text-ide-text-mutedLight dark:text-ide-text-muted hover:text-ide-text-light dark:hover:text-ide-text transition-colors"
            title="Load sample JSON"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            <span>Sample</span>
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

          <button
            type="button"
            onClick={handleCopy}
            disabled={!output || !!error}
            className="flex items-center gap-1 px-3 py-1 rounded bg-sky-600 hover:bg-sky-500 text-white font-medium disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
            title="Copy minified JSON"
          >
            {copied ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
            <span>{copied ? 'Copied' : 'Copy Minified'}</span>
          </button>
        </div>
      </div>

      {/* Metrics Row */}
      {!error && input.trim() && (
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs">
          <div className="p-2.5 rounded border border-ide-border-light dark:border-ide-border bg-ide-panel-light dark:bg-ide-panel">
            <span className="text-ide-text-mutedLight dark:text-ide-text-muted block text-[11px]">Original Size</span>
            <span className="font-mono font-semibold text-ide-text-light dark:text-ide-text">{originalBytes} bytes</span>
          </div>
          <div className="p-2.5 rounded border border-ide-border-light dark:border-ide-border bg-ide-panel-light dark:bg-ide-panel">
            <span className="text-ide-text-mutedLight dark:text-ide-text-muted block text-[11px]">Minified Size</span>
            <span className="font-mono font-semibold text-sky-600 dark:text-sky-400">{minifiedBytes} bytes</span>
          </div>
          <div className="p-2.5 rounded border border-ide-border-light dark:border-ide-border bg-ide-panel-light dark:bg-ide-panel">
            <span className="text-ide-text-mutedLight dark:text-ide-text-muted block text-[11px]">Saved Space</span>
            <span className="font-mono font-semibold text-emerald-600 dark:text-emerald-400">-{savedBytes} bytes</span>
          </div>
          <div className="p-2.5 rounded border border-ide-border-light dark:border-ide-border bg-ide-panel-light dark:bg-ide-panel">
            <span className="text-ide-text-mutedLight dark:text-ide-text-muted block text-[11px]">Reduction Ratio</span>
            <span className="font-mono font-semibold text-emerald-600 dark:text-emerald-400">{compressionPercent}%</span>
          </div>
        </div>
      )}

      {/* Large Document Warning */}
      {isLargeJson(input) && (
        <div className="flex items-center gap-2 p-2.5 rounded bg-amber-500/10 border border-amber-500/30 text-amber-600 dark:text-amber-400 text-xs">
          <AlertTriangle className="w-4 h-4 shrink-0" />
          <span>Large document detected (&gt;5 MB). Client-side minification runs on the main thread and may briefly affect responsiveness.</span>
        </div>
      )}

      {/* Precision Loss Warning for Unsafe Integers */}
      {!error && hasUnsafeInteger(input) && (
        <div className="flex items-center gap-2 p-2.5 rounded bg-amber-500/10 border border-amber-500/30 text-amber-600 dark:text-amber-400 text-xs">
          <AlertTriangle className="w-4 h-4 shrink-0" />
          <span>
            <strong>Precision Warning:</strong> One or more numbers exceed JavaScript's safe integer range (±9,007,199,254,740,991). Standard minification parsing may alter their lowest digits.
          </span>
        </div>
      )}

      {/* Error Callout */}
      {error && (
        <div className="flex items-start gap-2.5 p-3 rounded bg-rose-500/10 border border-rose-500/30 text-rose-600 dark:text-rose-400 text-xs font-mono">
          <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
          <div className="flex-1">
            <span className="font-semibold">Parse Error:</span> {error}
          </div>
        </div>
      )}

      {/* Split Views */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Input Column */}
        <div className="flex flex-col h-[360px] sm:h-[440px] lg:h-[480px] rounded border border-ide-border-light dark:border-ide-border bg-ide-surface-light dark:bg-ide-surface overflow-hidden">
          <div className="flex items-center justify-between px-3 py-2 bg-ide-panel-light dark:bg-ide-panel border-b border-ide-border-light dark:border-ide-border text-xs text-ide-text-mutedLight dark:text-ide-text-muted">
            <span className="font-medium">Formatted / Pretty JSON Input</span>
            <span className="font-mono text-[11px]">{originalBytes} B</span>
          </div>
          <textarea
            aria-label="Formatted JSON Input"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Paste verbose JSON here..."
            className="flex-1 p-3 bg-transparent font-mono text-xs text-ide-text-light dark:text-ide-text focus:outline-none resize-none leading-relaxed overflow-auto"
            spellCheck={false}
          />
        </div>

        {/* Output Column */}
        <div className="flex flex-col h-[360px] sm:h-[440px] lg:h-[480px] rounded border border-ide-border-light dark:border-ide-border bg-ide-surface-light dark:bg-ide-surface overflow-hidden">
          <div className="flex items-center justify-between px-3 py-2 bg-ide-panel-light dark:bg-ide-panel border-b border-ide-border-light dark:border-ide-border text-xs text-ide-text-mutedLight dark:text-ide-text-muted">
            <div className="flex items-center gap-1.5 font-medium">
              <span>Single-Line Minified Result</span>
              <ArrowRight className="w-3.5 h-3.5 text-sky-500" />
            </div>
            <span className="font-mono text-[11px]">{minifiedBytes} B</span>
          </div>
          <div className="flex-1 p-3 overflow-auto bg-ide-surface-light dark:bg-ide-surface/50">
            {output ? (
              <pre className="font-mono text-xs text-ide-text-light dark:text-ide-text break-all whitespace-pre-wrap selection:bg-sky-500/20">
                {output}
              </pre>
            ) : (
              <div className="h-full flex items-center justify-center text-xs text-ide-text-mutedLight dark:text-ide-text-muted font-mono">
                {error ? 'Fix input error to view minified JSON' : 'Minified output will appear here'}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
