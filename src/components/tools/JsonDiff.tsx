import React, { useState } from 'react';
import { compareJson, formatJson, isLargeJson, hasUnsafeInteger } from '../../utils/jsonUtils';
import { GitCompare, ArrowLeftRight, Wand2, RefreshCw, AlertCircle, AlertTriangle, Plus, Minus, Edit3 } from 'lucide-react';

const SAMPLE_LEFT = `{
  "appName": "DevKit Forge",
  "version": "1.0.0",
  "env": "development",
  "port": 3000,
  "features": {
    "telemetry": false,
    "darkMode": true,
    "legacyApi": false
  },
  "tags": ["toolkit", "ide", "offline"]
}`;

const SAMPLE_RIGHT = `{
  "appName": "DevKit Forge",
  "version": "1.1.0",
  "env": "production",
  "port": 8080,
  "features": {
    "telemetry": false,
    "darkMode": true,
    "auditLogs": true
  },
  "tags": ["toolkit", "ide", "offline", "enterprise"]
}`;

export const JsonDiff: React.FC = () => {
  const [leftJson, setLeftJson] = useState<string>(SAMPLE_LEFT);
  const [rightJson, setRightJson] = useState<string>(SAMPLE_RIGHT);
  const [showOnlyDiffs, setShowOnlyDiffs] = useState<boolean>(true);

  const { diffs, leftError, rightError, hasDiffs } = compareJson(leftJson, rightJson);

  const handleSwap = () => {
    const temp = leftJson;
    setLeftJson(rightJson);
    setRightJson(temp);
  };

  const handleFormatBoth = () => {
    const fmtLeft = formatJson(leftJson, 2);
    if (fmtLeft.output) setLeftJson(fmtLeft.output);
    const fmtRight = formatJson(rightJson, 2);
    if (fmtRight.output) setRightJson(fmtRight.output);
  };

  const handleLoadSample = () => {
    setLeftJson(SAMPLE_LEFT);
    setRightJson(SAMPLE_RIGHT);
  };

  const filteredDiffs = showOnlyDiffs
    ? diffs.filter((d) => d.type !== 'unchanged')
    : diffs;

  const addedCount = diffs.filter((d) => d.type === 'added').length;
  const removedCount = diffs.filter((d) => d.type === 'removed').length;
  const modifiedCount = diffs.filter((d) => d.type === 'modified').length;

  return (
    <div className="space-y-4">
      {/* Header & Controls Toolbar */}
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-ide-border-light dark:border-ide-border pb-3">
        <div className="flex items-center gap-2">
          <GitCompare className="w-5 h-5 text-sky-500" />
          <h2 className="text-base font-semibold text-ide-text-light dark:text-ide-text">
            JSON Structural Comparison & Diff
          </h2>
          <span className="text-xs px-2 py-0.5 rounded bg-sky-500/10 text-sky-600 dark:text-sky-400 font-mono">
            Client-Side
          </span>
        </div>

        {/* Toolbar Buttons */}
        <div className="flex flex-wrap items-center gap-2 text-xs">
          <button
            type="button"
            onClick={handleSwap}
            className="flex items-center gap-1 px-2.5 py-1 rounded border border-ide-border-light dark:border-ide-border bg-ide-panel-light dark:bg-ide-panel text-ide-text-mutedLight dark:text-ide-text-muted hover:text-ide-text-light dark:hover:text-ide-text transition-colors"
            title="Swap Left and Right documents"
          >
            <ArrowLeftRight className="w-3.5 h-3.5" />
            <span>Swap</span>
          </button>

          <button
            type="button"
            onClick={handleFormatBoth}
            className="flex items-center gap-1 px-2.5 py-1 rounded border border-ide-border-light dark:border-ide-border bg-ide-panel-light dark:bg-ide-panel text-ide-text-mutedLight dark:text-ide-text-muted hover:text-ide-text-light dark:hover:text-ide-text transition-colors"
            title="Prettify both JSON panes"
          >
            <Wand2 className="w-3.5 h-3.5" />
            <span>Prettify Both</span>
          </button>

          <button
            type="button"
            onClick={handleLoadSample}
            className="flex items-center gap-1 px-2.5 py-1 rounded border border-ide-border-light dark:border-ide-border bg-ide-panel-light dark:bg-ide-panel text-ide-text-mutedLight dark:text-ide-text-muted hover:text-ide-text-light dark:hover:text-ide-text transition-colors"
            title="Load sample comparison"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            <span>Sample</span>
          </button>
        </div>
      </div>

      {/* Warnings & Callouts */}
      {(isLargeJson(leftJson) || isLargeJson(rightJson)) && (
        <div className="flex items-center gap-2 p-2.5 rounded bg-amber-500/10 border border-amber-500/30 text-amber-600 dark:text-amber-400 text-xs">
          <AlertTriangle className="w-4 h-4 shrink-0" />
          <span>Large document detected (&gt;5 MB). Client-side comparison runs in-browser and may briefly affect responsiveness.</span>
        </div>
      )}

      {/* Errors if either JSON is invalid */}
      {(leftError || rightError) && (
        <div className="space-y-2">
          {leftError && (
            <div className="flex items-start gap-2 p-3 rounded bg-rose-500/10 border border-rose-500/30 text-rose-600 dark:text-rose-400 text-xs font-mono">
              <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
              <span>{leftError}</span>
            </div>
          )}
          {rightError && (
            <div className="flex items-start gap-2 p-3 rounded bg-rose-500/10 border border-rose-500/30 text-rose-600 dark:text-rose-400 text-xs font-mono">
              <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
              <span>{rightError}</span>
            </div>
          )}
        </div>
      )}

      {/* Unsafe Integer Precision Notice */}
      {!leftError && !rightError && (hasUnsafeInteger(leftJson) || hasUnsafeInteger(rightJson)) && (
        <div className="flex items-center gap-2 p-2.5 rounded bg-sky-500/10 border border-sky-500/30 text-sky-700 dark:text-sky-300 text-xs">
          <AlertTriangle className="w-4 h-4 shrink-0 text-sky-500" />
          <span>Notice: Large numbers exceeding JavaScript&apos;s safe integer limit (&gt;2^53 - 1) detected. Values above 9,007,199,254,740,991 may experience IEEE 754 precision loss during browser formatting.</span>
        </div>
      )}

      {/* Diff Metrics Bar */}
      {!leftError && !rightError && (
        <div className="flex flex-wrap items-center justify-between gap-2 p-2.5 rounded border border-ide-border-light dark:border-ide-border bg-ide-panel-light dark:bg-ide-panel text-xs">
          <div className="flex flex-wrap items-center gap-4">
            <span className="font-medium text-ide-text-light dark:text-ide-text">
              {hasDiffs ? 'Differences Found' : 'No Differences — Objects are identical'}
            </span>
            <div className="flex flex-wrap items-center gap-2 font-mono text-[11px]">
              <span className="flex items-center gap-1 text-emerald-600 dark:text-emerald-400 font-semibold">
                <Plus className="w-3 h-3" /> {addedCount} added
              </span>
              <span className="flex items-center gap-1 text-rose-600 dark:text-rose-400 font-semibold">
                <Minus className="w-3 h-3" /> {removedCount} removed
              </span>
              <span className="flex items-center gap-1 text-amber-600 dark:text-amber-400 font-semibold">
                <Edit3 className="w-3 h-3" /> {modifiedCount} changed
              </span>
            </div>
          </div>

          <label className="flex items-center gap-2 cursor-pointer text-ide-text-mutedLight dark:text-ide-text-muted select-none">
            <input
              type="checkbox"
              checked={showOnlyDiffs}
              onChange={(e) => setShowOnlyDiffs(e.target.checked)}
              className="rounded accent-sky-500"
            />
            <span>Show differences only</span>
          </label>
        </div>
      )}

      {/* Diff Table / List View */}
      {!leftError && !rightError && filteredDiffs.length > 0 && (
        <div className="rounded border border-ide-border-light dark:border-ide-border bg-ide-surface-light dark:bg-ide-surface overflow-hidden">
          <div className="px-3 py-2 bg-ide-panel-light dark:bg-ide-panel border-b border-ide-border-light dark:border-ide-border text-xs font-medium text-ide-text-mutedLight dark:text-ide-text-muted flex justify-between">
            <span>Path & Type</span>
            <span>Original (Left) ➔ Modified (Right)</span>
          </div>
          <div className="max-h-60 overflow-y-auto divide-y divide-ide-border-light dark:divide-ide-border text-xs font-mono">
            {filteredDiffs.map((diff, idx) => (
              <div
                key={idx}
                className={`p-2.5 flex flex-wrap items-center justify-between gap-2 transition-colors ${
                  diff.type === 'added'
                    ? 'bg-emerald-500/5 hover:bg-emerald-500/10'
                    : diff.type === 'removed'
                    ? 'bg-rose-500/5 hover:bg-rose-500/10'
                    : diff.type === 'modified'
                    ? 'bg-amber-500/5 hover:bg-amber-500/10'
                    : 'hover:bg-slate-500/5'
                }`}
              >
                <div className="flex items-center gap-2">
                  <span
                    className={`px-1.5 py-0.5 rounded text-[10px] font-semibold uppercase ${
                      diff.type === 'added'
                        ? 'bg-emerald-500/20 text-emerald-600 dark:text-emerald-400'
                        : diff.type === 'removed'
                        ? 'bg-rose-500/20 text-rose-600 dark:text-rose-400'
                        : diff.type === 'modified'
                        ? 'bg-amber-500/20 text-amber-600 dark:text-amber-400'
                        : 'bg-slate-500/20 text-slate-500'
                    }`}
                  >
                    {diff.type}
                  </span>
                  <span className="font-semibold text-ide-text-light dark:text-ide-text">{diff.path}</span>
                </div>

                <div className="flex items-center gap-2 text-right">
                  {diff.type !== 'added' && (
                    <span className="line-through text-rose-600/80 dark:text-rose-400/80 max-w-[120px] sm:max-w-xs truncate">
                      {JSON.stringify(diff.oldValue)}
                    </span>
                  )}
                  {diff.type === 'modified' && <span className="text-ide-text-muted">➔</span>}
                  {diff.type !== 'removed' && (
                    <span className="text-emerald-600 dark:text-emerald-400 max-w-[120px] sm:max-w-xs truncate font-medium">
                      {JSON.stringify(diff.newValue)}
                    </span>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Editor Inputs (Left and Right) */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Left Document */}
        <div className="flex flex-col h-[320px] sm:h-[380px] lg:h-[400px] rounded border border-ide-border-light dark:border-ide-border bg-ide-surface-light dark:bg-ide-surface overflow-hidden">
          <div className="flex items-center justify-between px-3 py-2 bg-ide-panel-light dark:bg-ide-panel border-b border-ide-border-light dark:border-ide-border text-xs text-ide-text-mutedLight dark:text-ide-text-muted">
            <span className="font-medium">Original Document (Left)</span>
            <span className="font-mono text-[11px]">{leftJson ? `${leftJson.length} chars` : '0'}</span>
          </div>
          <textarea
            aria-label="Original Document (Left)"
            value={leftJson}
            onChange={(e) => setLeftJson(e.target.value)}
            className="flex-1 p-3 bg-transparent font-mono text-xs text-ide-text-light dark:text-ide-text focus:outline-none resize-none leading-relaxed overflow-auto"
            spellCheck={false}
          />
        </div>

        {/* Right Document */}
        <div className="flex flex-col h-[320px] sm:h-[380px] lg:h-[400px] rounded border border-ide-border-light dark:border-ide-border bg-ide-surface-light dark:bg-ide-surface overflow-hidden">
          <div className="flex items-center justify-between px-3 py-2 bg-ide-panel-light dark:bg-ide-panel border-b border-ide-border-light dark:border-ide-border text-xs text-ide-text-mutedLight dark:text-ide-text-muted">
            <span className="font-medium">Modified Document (Right)</span>
            <span className="font-mono text-[11px]">{rightJson ? `${rightJson.length} chars` : '0'}</span>
          </div>
          <textarea
            aria-label="Modified Document (Right)"
            value={rightJson}
            onChange={(e) => setRightJson(e.target.value)}
            className="flex-1 p-3 bg-transparent font-mono text-xs text-ide-text-light dark:text-ide-text focus:outline-none resize-none leading-relaxed overflow-auto"
            spellCheck={false}
          />
        </div>
      </div>
    </div>
  );
};
