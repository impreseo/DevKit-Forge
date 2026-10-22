import React, { useState, useMemo, useEffect } from 'react';
import { buildHighlightSegments, COMMON_REGEX_PRESETS, RegexPreset, RegexTestResult } from '../../utils/regexUtils';
import { Search, AlertCircle, CheckCircle2, Copy, Check, Trash2, BookOpen } from 'lucide-react';

const FLAGS_LIST = [
  { flag: 'g', label: 'Global', desc: 'Find all matches rather than stopping after the first' },
  { flag: 'i', label: 'Ignore Case', desc: 'Case-insensitive matching' },
  { flag: 'm', label: 'Multiline', desc: '^ and $ match the start/end of each line' },
  { flag: 's', label: 'DotAll', desc: '. matches any character including newline \\n' },
  { flag: 'u', label: 'Unicode', desc: 'Treat pattern as a sequence of Unicode code points' },
  { flag: 'v', label: 'Unicode Sets', desc: 'Extended Unicode set notation (difference, intersection, strings)' },
  { flag: 'y', label: 'Sticky', desc: 'Matches only from the index indicated by lastIndex' },
];

export const RegexTester: React.FC = () => {
  const [pattern, setPattern] = useState<string>('([a-zA-Z0-9._%+-]+)@([a-zA-Z0-9.-]+\\.[a-zA-Z]{2,})');
  const [flags, setFlags] = useState<string>('g');
  const [testString, setTestString] = useState<string>(
    'DevKit Forge contact list:\nPrimary: contact@devkitforge.dev\nSupport: support.team+priority@infra.internal.io\nInvalid: user@bad_host'
  );
  const [copied, setCopied] = useState<boolean>(false);

  const toggleFlag = (flagChar: string) => {
    if (flags.includes(flagChar)) {
      setFlags(flags.replace(flagChar, ''));
    } else {
      // JavaScript RegExp u and v flags are mutually exclusive in ECMAScript
      let newFlags = flags;
      if (flagChar === 'v') newFlags = newFlags.replace('u', '');
      if (flagChar === 'u') newFlags = newFlags.replace('v', '');
      setFlags(newFlags + flagChar);
    }
  };

  const handleSelectPreset = (preset: RegexPreset) => {
    setPattern(preset.pattern);
    setFlags(preset.flags);
    setTestString(preset.sample);
  };

  const [testResult, setTestResult] = useState<RegexTestResult>({
    isValid: true,
    matches: [],
    executionTimeMs: 0,
  });

  // A Worker keeps user-supplied regular expressions off the UI thread. Terminating
  // the Worker is the only reliable way to stop synchronous catastrophic backtracking.
  useEffect(() => {
    let worker: Worker | undefined;
    let timeoutId: ReturnType<typeof setTimeout> | undefined;
    let settled = false;

    if (pattern.length > 2_000) {
      setTestResult({ isValid: false, error: 'Pattern is too long (maximum 2,000 characters).', matches: [], executionTimeMs: 0 });
      return;
    }
    if (testString.length > 200_000) {
      setTestResult({ isValid: false, error: 'Test text is too long (maximum 200,000 characters).', matches: [], executionTimeMs: 0 });
      return;
    }

    const debounceId = setTimeout(() => {
      try {
        worker = new Worker(new URL('../../workers/regex.worker.ts', import.meta.url), { type: 'module' });
        worker.onmessage = (event: MessageEvent<RegexTestResult>) => {
          if (settled) return;
          settled = true;
          if (timeoutId) clearTimeout(timeoutId);
          setTestResult(event.data);
          worker?.terminate();
        };
        worker.onerror = () => {
          if (settled) return;
          settled = true;
          if (timeoutId) clearTimeout(timeoutId);
          setTestResult({ isValid: false, error: 'Regex worker failed. Try a simpler pattern or shorter input.', matches: [], executionTimeMs: 0 });
          worker?.terminate();
        };
        timeoutId = setTimeout(() => {
          if (settled) return;
          settled = true;
          worker?.terminate();
          setTestResult({ isValid: false, error: 'Regex execution timed out after 500 ms. The pattern may be too expensive; simplify it and try again.', matches: [], executionTimeMs: 500 });
        }, 500);
        worker.postMessage({ pattern, flags, testString });
      } catch {
        setTestResult({ isValid: false, error: 'Could not start the regex worker in this browser.', matches: [], executionTimeMs: 0 });
      }
    }, 100);

    return () => {
      settled = true;
      if (debounceId) clearTimeout(debounceId);
      if (timeoutId) clearTimeout(timeoutId);
      worker?.terminate();
    };
  }, [pattern, flags, testString]);

  const highlightSegments = useMemo(() => {
    if (!testResult.isValid) return [];
    return buildHighlightSegments(testString, testResult.matches);
  }, [testString, testResult]);

  const handleCopyPattern = async () => {
    try {
      await navigator.clipboard.writeText(`/${pattern}/${flags}`);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // Fallback
    }
  };

  const handleClear = () => {
    setPattern('');
    setTestString('');
  };

  return (
    <div className="space-y-4">
      {/* Header & Controls Toolbar */}
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-ide-border-light dark:border-ide-border pb-3">
        <div className="flex items-center gap-2">
          <Search className="w-5 h-5 text-sky-500" />
          <h2 className="text-base font-semibold text-ide-text-light dark:text-ide-text">
            Regular Expression Tester & Match Inspector
          </h2>
          <span className="text-xs px-2 py-0.5 rounded bg-sky-500/10 text-sky-600 dark:text-sky-400 font-mono">
            Client-Side
          </span>
        </div>

        {/* Toolbar Buttons */}
        <div className="flex flex-wrap items-center gap-2 text-xs">
          <button
            type="button"
            onClick={handleClear}
            className="flex items-center gap-1 px-2.5 py-1 rounded border border-ide-border-light dark:border-ide-border bg-ide-panel-light dark:bg-ide-panel text-ide-text-mutedLight dark:text-ide-text-muted hover:text-rose-500 transition-colors"
            title="Clear regex and test string"
          >
            <Trash2 className="w-3.5 h-3.5" />
            <span>Clear</span>
          </button>

          <button
            type="button"
            onClick={handleCopyPattern}
            disabled={!pattern}
            className="flex items-center gap-1 px-3 py-1 rounded bg-sky-600 hover:bg-sky-500 text-white font-medium disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
            title="Copy /pattern/flags to clipboard"
          >
            {copied ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
            <span>{copied ? 'Copied' : 'Copy /RegExp/'}</span>
          </button>
        </div>
      </div>

      {/* Preset Library Quick Bar */}
      <div className="p-2 rounded border border-ide-border-light dark:border-ide-border bg-ide-panel-light dark:bg-ide-panel flex flex-wrap items-center gap-2 text-xs">
        <div className="flex items-center gap-1.5 text-ide-text-mutedLight dark:text-ide-text-muted font-medium mr-1">
          <BookOpen className="w-3.5 h-3.5 text-sky-500" />
          <span>Presets:</span>
        </div>
        {COMMON_REGEX_PRESETS.map((preset) => (
          <button
            key={preset.name}
            type="button"
            onClick={() => handleSelectPreset(preset)}
            className="px-2 py-0.5 rounded bg-ide-surface-light dark:bg-ide-surface border border-ide-border-light dark:border-ide-border hover:border-sky-500 text-ide-text-light dark:text-ide-text text-[11px] transition-colors"
            title={preset.description}
          >
            {preset.name}
          </button>
        ))}
      </div>

      {/* Regex Pattern & Flags Input Box */}
      <div className="p-3 rounded border border-ide-border-light dark:border-ide-border bg-ide-surface-light dark:bg-ide-surface space-y-3">
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2">
          {/* Delimiter / */}
          <div className="flex items-center flex-1 bg-ide-panel-light dark:bg-ide-panel rounded border border-ide-border-light dark:border-ide-border px-3 py-1.5 focus-within:border-sky-500">
            <span className="font-mono text-sm text-sky-500 font-semibold select-none mr-1.5">/</span>
            <input
              aria-label="Regular Expression Pattern"
              type="text"
              value={pattern}
              onChange={(e) => setPattern(e.target.value)}
              placeholder="e.g. ([a-z]+)-(\d+)"
              className="flex-1 bg-transparent font-mono text-xs text-ide-text-light dark:text-ide-text focus:outline-none"
              spellCheck={false}
            />
            <span className="font-mono text-sm text-sky-500 font-semibold select-none ml-1.5">/</span>
            <span className="font-mono text-xs text-ide-text-muted font-medium ml-1 select-none">
              {flags || '—'}
            </span>
          </div>

          {/* Flags Toggles */}
          <div className="flex items-center gap-1">
            {FLAGS_LIST.map(({ flag, label, desc }) => {
              const active = flags.includes(flag);
              return (
                <button
                  key={flag}
                  type="button"
                  onClick={() => toggleFlag(flag)}
                  aria-label={`${label} flag (${flag})`}
                  aria-pressed={active}
                  className={`w-7 h-7 rounded text-xs font-mono font-semibold transition-colors ${
                    active
                      ? 'bg-sky-500 text-white shadow-sm'
                      : 'bg-ide-panel-light dark:bg-ide-panel border border-ide-border-light dark:border-ide-border text-ide-text-muted hover:text-ide-text-light dark:hover:text-ide-text'
                  }`}
                  title={`${label} (${flag}): ${desc}`}
                >
                  {flag}
                </button>
              );
            })}
          </div>
        </div>

        {/* Syntax Error or Success Indicator */}
        {testResult.isValid ? (
          <div className="flex items-center justify-between text-xs font-mono text-ide-text-mutedLight dark:text-ide-text-muted">
            <div className="flex items-center gap-1.5 text-emerald-600 dark:text-emerald-400">
              <CheckCircle2 className="w-3.5 h-3.5" />
              <span>Valid RegExp syntax</span>
            </div>
            <span>
              {testResult.matches.length} match{testResult.matches.length === 1 ? '' : 'es'} found (
              {testResult.executionTimeMs}ms)
            </span>
          </div>
        ) : (
          <div className="flex items-start gap-2 p-2.5 rounded bg-rose-500/10 border border-rose-500/30 text-rose-600 dark:text-rose-400 text-xs font-mono">
            <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
            <div>
              <span className="font-semibold">RegExp Error:</span> {testResult.error}
            </div>
          </div>
        )}
      </div>

      {/* Main Split: Test String Input vs Highlighted Match Preview */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Test String Input */}
        <div className="flex flex-col h-[380px] rounded border border-ide-border-light dark:border-ide-border bg-ide-surface-light dark:bg-ide-surface overflow-hidden">
          <div className="flex items-center justify-between px-3 py-2 bg-ide-panel-light dark:bg-ide-panel border-b border-ide-border-light dark:border-ide-border text-xs text-ide-text-mutedLight dark:text-ide-text-muted">
            <span className="font-medium">Test String Input</span>
            <span className="font-mono text-[11px]">{testString.length} chars</span>
          </div>
          <textarea
            aria-label="Test String Input"
            value={testString}
            onChange={(e) => setTestString(e.target.value)}
            placeholder="Type or paste sample text to test matches..."
            className="flex-1 p-3 bg-transparent font-mono text-xs text-ide-text-light dark:text-ide-text focus:outline-none resize-none leading-relaxed overflow-auto"
            spellCheck={false}
          />
        </div>

        {/* Highlighted Match Visualizer */}
        <div className="flex flex-col h-[380px] rounded border border-ide-border-light dark:border-ide-border bg-ide-surface-light dark:bg-ide-surface overflow-hidden">
          <div className="flex items-center justify-between px-3 py-2 bg-ide-panel-light dark:bg-ide-panel border-b border-ide-border-light dark:border-ide-border text-xs text-ide-text-mutedLight dark:text-ide-text-muted">
            <span className="font-medium">Live Match Highlighting</span>
            <span className="font-mono text-[11px]">{testResult.matches.length} matches</span>
          </div>
          <div className="flex-1 p-3 overflow-auto bg-ide-surface-light dark:bg-ide-surface/40">
            {testResult.isValid ? (
              <pre className="font-mono text-xs leading-relaxed whitespace-pre-wrap break-all text-ide-text-light dark:text-ide-text">
                {highlightSegments.map((segment, idx) => {
                  if (!segment.isMatch) {
                    return <span key={idx}>{segment.text}</span>;
                  }
                  // Alternate match badge styles
                  const isEven = (segment.matchIndex || 1) % 2 === 0;
                  return (
                    <mark
                      key={idx}
                      className={`rounded px-1 py-0.5 mx-0.5 border text-xs font-semibold ${
                        isEven
                          ? 'bg-amber-400/25 text-amber-900 dark:text-amber-200 border-amber-500/40'
                          : 'bg-sky-400/25 text-sky-900 dark:text-sky-200 border-sky-500/40'
                      }`}
                      title={`Match #${segment.matchIndex}`}
                    >
                      {segment.text}
                    </mark>
                  );
                })}
              </pre>
            ) : (
              <div className="h-full flex items-center justify-center text-xs text-ide-text-muted font-mono">
                Correct regex syntax above to view match highlights
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Match Details & Capture Groups Table */}
      {testResult.isValid && testResult.matches.length > 0 && (
        <div className="rounded border border-ide-border-light dark:border-ide-border bg-ide-surface-light dark:bg-ide-surface overflow-hidden">
          <div className="px-3 py-2 bg-ide-panel-light dark:bg-ide-panel border-b border-ide-border-light dark:border-ide-border text-xs font-medium text-ide-text-mutedLight dark:text-ide-text-muted flex justify-between">
            <span>Match Inspection ({testResult.matches.length})</span>
            <span>Index Spans & Capture Groups</span>
          </div>
          <div className="max-h-60 overflow-y-auto divide-y divide-ide-border-light dark:divide-ide-border text-xs font-mono">
            {testResult.matches.map((m, idx) => (
              <div key={idx} className="p-3 hover:bg-slate-500/5 transition-colors space-y-1.5">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <span className="px-1.5 py-0.5 rounded bg-sky-500/20 text-sky-600 dark:text-sky-400 font-semibold text-[11px]">
                      Match #{idx + 1}
                    </span>
                    <span className="font-semibold text-ide-text-light dark:text-ide-text bg-ide-panel-light dark:bg-ide-panel px-1.5 py-0.5 rounded border border-ide-border-light dark:border-ide-border">
                      {m.fullMatch}
                    </span>
                  </div>
                  <span className="text-[11px] text-ide-text-muted">
                    Index: [{m.index} .. {m.index + m.length}], Length: {m.length}
                  </span>
                </div>

                {m.groups.length > 0 && (
                  <div className="pl-4 border-l-2 border-sky-500/30 space-y-1 mt-1 text-[11px]">
                    {m.groups.map((g, gIdx) => (
                      <div key={gIdx} className="flex items-center gap-2">
                        <span className="text-ide-text-muted font-medium">{g.name}:</span>
                        <span className="text-emerald-600 dark:text-emerald-400 bg-emerald-500/10 px-1 py-0.2 rounded font-semibold">
                          {g.value || '<empty>'}
                        </span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
