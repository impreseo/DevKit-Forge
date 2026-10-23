import React, { useState, useEffect } from 'react';
import {
  computeHash,
  generateUuids,
  HashAlgorithm,
  HASH_ALGORITHMS,
} from '../../utils/cryptoUtils';
import { Fingerprint, Copy, Check, Trash2, RefreshCw, KeyRound, CheckCircle2, AlertCircle } from 'lucide-react';

type ActiveTab = 'hash' | 'uuid';

const HASH_SAMPLE = 'DevKit Forge - Safe, client-side, zero-telemetry developer tools.';

export const HashUuidGenerator: React.FC = () => {
  const [activeTab, setActiveTab] = useState<ActiveTab>('hash');

  // Hash state
  const [hashInput, setHashInput] = useState<string>(HASH_SAMPLE);
  const [selectedAlgo, setSelectedAlgo] = useState<HashAlgorithm>('SHA-256');
  const [isHashUppercase, setIsHashUppercase] = useState<boolean>(false);
  const [computedHash, setComputedHash] = useState<string>('');
  const [hashError, setHashError] = useState<string | null>(null);
  const [hashCopied, setHashCopied] = useState<boolean>(false);

  // UUID state
  const [uuidCount, setUuidCount] = useState<number>(5);
  const [uuidHyphens, setUuidHyphens] = useState<boolean>(true);
  const [uuidUppercase, setUuidUppercase] = useState<boolean>(false);
  const [generatedUuids, setGeneratedUuids] = useState<string[]>([]);
  const [uuidsCopied, setUuidsCopied] = useState<boolean>(false);

  // Compute hash when input or algo changes
  useEffect(() => {
    let isCancelled = false;
    computeHash(selectedAlgo, hashInput).then((res) => {
      if (!isCancelled) {
        if (res.error) {
          setHashError(res.error);
          setComputedHash('');
        } else {
          setHashError(null);
          setComputedHash(res.hash);
        }
      }
    });
    return () => {
      isCancelled = true;
    };
  }, [hashInput, selectedAlgo]);

  // Generate initial UUIDs
  useEffect(() => {
    setGeneratedUuids(generateUuids(uuidCount, { hyphens: uuidHyphens, uppercase: uuidUppercase }));
  }, [uuidCount, uuidHyphens, uuidUppercase]);

  const handleRegenerateUuids = () => {
    setGeneratedUuids(generateUuids(uuidCount, { hyphens: uuidHyphens, uppercase: uuidUppercase }));
  };

  const handleCopyHash = async () => {
    if (!computedHash) return;
    const textToCopy = isHashUppercase ? computedHash.toUpperCase() : computedHash.toLowerCase();
    try {
      await navigator.clipboard.writeText(textToCopy);
      setHashCopied(true);
      setTimeout(() => setHashCopied(false), 2000);
    } catch {
      // Fallback
    }
  };

  const handleCopyUuids = async () => {
    if (generatedUuids.length === 0) return;
    try {
      await navigator.clipboard.writeText(generatedUuids.join('\n'));
      setUuidsCopied(true);
      setTimeout(() => setUuidsCopied(false), 2000);
    } catch {
      // Fallback
    }
  };

  const formattedHash = isHashUppercase ? computedHash.toUpperCase() : computedHash.toLowerCase();
  const algoConfig = HASH_ALGORITHMS[selectedAlgo];

  return (
    <div className="space-y-4">
      {/* Header & Controls Toolbar */}
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-ide-border-light dark:border-ide-border pb-3">
        <div className="flex items-center gap-2">
          <Fingerprint className="w-5 h-5 text-sky-500" />
          <h2 className="text-base font-semibold text-ide-text-light dark:text-ide-text">
            Hash & UUID Generator
          </h2>
          <span className="text-xs px-2 py-0.5 rounded bg-sky-500/10 text-sky-600 dark:text-sky-400 font-mono">
            Web Crypto API
          </span>
        </div>

        {/* Tab Selection */}
        <div className="flex items-center gap-1 bg-ide-panel-light dark:bg-ide-panel p-1 rounded border border-ide-border-light dark:border-ide-border text-xs">
          <button
            type="button"
            onClick={() => setActiveTab('hash')}
            className={`flex items-center gap-1.5 px-3 py-1 rounded font-medium transition-colors ${
              activeTab === 'hash'
                ? 'bg-sky-500 text-white shadow-xs'
                : 'text-ide-text-muted hover:text-ide-text-light dark:hover:text-ide-text'
            }`}
          >
            <KeyRound className="w-3.5 h-3.5" />
            <span>Cryptographic Hash</span>
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('uuid')}
            className={`flex items-center gap-1.5 px-3 py-1 rounded font-medium transition-colors ${
              activeTab === 'uuid'
                ? 'bg-sky-500 text-white shadow-xs'
                : 'text-ide-text-muted hover:text-ide-text-light dark:hover:text-ide-text'
            }`}
          >
            <Fingerprint className="w-3.5 h-3.5" />
            <span>UUID v4 Generator</span>
          </button>
        </div>
      </div>

      {/* Tab 1: Cryptographic Hash */}
      {activeTab === 'hash' && (
        <div className="space-y-4">
          {/* Options Bar */}
          <div className="flex flex-wrap items-center justify-between gap-3 p-2.5 rounded border border-ide-border-light dark:border-ide-border bg-ide-panel-light dark:bg-ide-panel text-xs">
            {/* Algorithm Selector */}
            <div className="flex items-center gap-1.5">
              <span className="text-ide-text-muted font-medium">Algorithm:</span>
              {(['SHA-256', 'SHA-512', 'SHA-384', 'SHA-1'] as HashAlgorithm[]).map((algo) => (
                <button
                  key={algo}
                  type="button"
                  onClick={() => setSelectedAlgo(algo)}
                  className={`px-2.5 py-1 rounded font-mono font-medium transition-colors ${
                    selectedAlgo === algo
                      ? 'bg-sky-500 text-white shadow-xs'
                      : 'bg-ide-surface-light dark:bg-ide-surface text-ide-text-muted hover:text-ide-text-light dark:hover:text-ide-text border border-ide-border-light dark:border-ide-border'
                  }`}
                >
                  {algo}
                </button>
              ))}
            </div>

            {/* Formatting & Action controls */}
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => setIsHashUppercase(!isHashUppercase)}
                className={`px-2.5 py-1 rounded border transition-colors ${
                  isHashUppercase
                    ? 'bg-sky-500/15 border-sky-500 text-sky-600 dark:text-sky-400 font-medium'
                    : 'bg-ide-surface-light dark:bg-ide-surface border-ide-border-light dark:border-ide-border text-ide-text-muted hover:text-ide-text-light dark:hover:text-ide-text'
                }`}
              >
                UPPERCASE
              </button>

              <button
                type="button"
                onClick={() => setHashInput(HASH_SAMPLE)}
                className="flex items-center gap-1 px-2.5 py-1 rounded border border-ide-border-light dark:border-ide-border bg-ide-surface-light dark:bg-ide-surface text-ide-text-muted hover:text-ide-text-light dark:hover:text-ide-text"
              >
                <RefreshCw className="w-3.5 h-3.5" />
                <span>Sample</span>
              </button>

              <button
                type="button"
                onClick={() => setHashInput('')}
                className="flex items-center gap-1 px-2.5 py-1 rounded border border-ide-border-light dark:border-ide-border bg-ide-surface-light dark:bg-ide-surface text-ide-text-muted hover:text-rose-500"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span>Clear</span>
              </button>
            </div>
          </div>

          {/* Input text */}
          <div className="flex flex-col h-[220px] rounded border border-ide-border-light dark:border-ide-border bg-ide-surface-light dark:bg-ide-surface overflow-hidden">
            <div className="flex items-center justify-between px-3 py-2 bg-ide-panel-light dark:bg-ide-panel border-b border-ide-border-light dark:border-ide-border text-xs text-ide-text-muted">
              <span className="font-medium">Input Plaintext</span>
              <span className="font-mono text-[11px]">{hashInput.length} characters</span>
            </div>
            <textarea
              aria-label="Plaintext to hash"
              value={hashInput}
              onChange={(e) => setHashInput(e.target.value)}
              placeholder="Enter text to hash..."
              className="flex-1 p-3 bg-transparent font-mono text-xs text-ide-text-light dark:text-ide-text focus:outline-none resize-none leading-relaxed overflow-auto"
              spellCheck={false}
            />
          </div>

          {/* Web Crypto Error Callout */}
          {hashError && (
            <div className="flex items-start gap-2.5 p-3 rounded bg-rose-500/10 border border-rose-500/30 text-rose-600 dark:text-rose-400 text-xs font-mono">
              <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
              <div className="flex-1">
                <span className="font-semibold">Web Crypto Error:</span> {hashError}
              </div>
            </div>
          )}

          {/* Hash Result Box */}
          <div className="p-4 rounded border border-ide-border-light dark:border-ide-border bg-ide-surface-light dark:bg-ide-surface space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="text-xs font-semibold text-ide-text-light dark:text-ide-text">
                  {selectedAlgo} Digest
                </span>
                <span className="text-[11px] font-mono px-1.5 py-0.5 rounded bg-ide-panel-light dark:bg-ide-panel text-ide-text-muted border border-ide-border-light dark:border-ide-border">
                  {algoConfig.bitLength} bits / {algoConfig.byteLength} bytes
                </span>
              </div>

              <button
                type="button"
                onClick={handleCopyHash}
                disabled={!formattedHash || !!hashError}
                className="flex items-center gap-1.5 px-3 py-1 rounded bg-sky-600 hover:bg-sky-500 text-white font-medium text-xs disabled:opacity-40 transition-colors"
              >
                {hashCopied ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                <span>{hashCopied ? 'Copied' : 'Copy Hash'}</span>
              </button>
            </div>

            <div className="p-3 rounded border border-ide-border-light dark:border-ide-border bg-ide-panel-light dark:bg-ide-panel/60">
              <code className="font-mono text-xs text-sky-600 dark:text-sky-400 break-all select-all leading-relaxed">
                {hashError ? 'Hashing unavailable: Web Crypto API required' : formattedHash || 'No output'}
              </code>
            </div>
          </div>
        </div>
      )}

      {/* Tab 2: UUID v4 Generator */}
      {activeTab === 'uuid' && (
        <div className="space-y-4">
          {/* UUID Options Bar */}
          <div className="flex flex-wrap items-center justify-between gap-3 p-2.5 rounded border border-ide-border-light dark:border-ide-border bg-ide-panel-light dark:bg-ide-panel text-xs">
            {/* Count Selector */}
            <div className="flex items-center gap-1.5">
              <span className="text-ide-text-muted font-medium">Quantity:</span>
              {[1, 5, 10, 25, 50].map((count) => (
                <button
                  key={count}
                  type="button"
                  onClick={() => setUuidCount(count)}
                  className={`px-2.5 py-1 rounded font-mono font-medium transition-colors ${
                    uuidCount === count
                      ? 'bg-sky-500 text-white shadow-xs'
                      : 'bg-ide-surface-light dark:bg-ide-surface text-ide-text-muted hover:text-ide-text-light dark:hover:text-ide-text border border-ide-border-light dark:border-ide-border'
                  }`}
                >
                  {count}
                </button>
              ))}
            </div>

            {/* Format Toggles & Buttons */}
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => setUuidHyphens(!uuidHyphens)}
                className={`px-2.5 py-1 rounded border transition-colors ${
                  uuidHyphens
                    ? 'bg-sky-500/15 border-sky-500 text-sky-600 dark:text-sky-400 font-medium'
                    : 'bg-ide-surface-light dark:bg-ide-surface border-ide-border-light dark:border-ide-border text-ide-text-muted hover:text-ide-text-light dark:hover:text-ide-text'
                }`}
              >
                Hyphens
              </button>

              <button
                type="button"
                onClick={() => setUuidUppercase(!uuidUppercase)}
                className={`px-2.5 py-1 rounded border transition-colors ${
                  uuidUppercase
                    ? 'bg-sky-500/15 border-sky-500 text-sky-600 dark:text-sky-400 font-medium'
                    : 'bg-ide-surface-light dark:bg-ide-surface border-ide-border-light dark:border-ide-border text-ide-text-muted hover:text-ide-text-light dark:hover:text-ide-text'
                }`}
              >
                UPPERCASE
              </button>

              <button
                type="button"
                onClick={handleRegenerateUuids}
                className="flex items-center gap-1 px-3 py-1 rounded bg-ide-surface-light dark:bg-ide-surface border border-ide-border-light dark:border-ide-border text-sky-600 dark:text-sky-400 hover:border-sky-500 font-medium"
              >
                <RefreshCw className="w-3.5 h-3.5" />
                <span>Regenerate</span>
              </button>

              <button
                type="button"
                onClick={handleCopyUuids}
                disabled={generatedUuids.length === 0}
                className="flex items-center gap-1 px-3 py-1 rounded bg-sky-600 hover:bg-sky-500 text-white font-medium disabled:opacity-40 transition-colors"
              >
                {uuidsCopied ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                <span>{uuidsCopied ? 'Copied' : 'Copy All'}</span>
              </button>
            </div>
          </div>

          {/* Generated UUIDs list */}
          <div className="rounded border border-ide-border-light dark:border-ide-border bg-ide-surface-light dark:bg-ide-surface overflow-hidden">
            <div className="px-3 py-2 bg-ide-panel-light dark:bg-ide-panel border-b border-ide-border-light dark:border-ide-border text-xs text-ide-text-muted flex justify-between items-center">
              <span className="font-medium">Generated Cryptographic UUIDs ({generatedUuids.length})</span>
              <span className="flex items-center gap-1 text-emerald-600 dark:text-emerald-400 font-mono text-[11px]">
                <CheckCircle2 className="w-3 h-3" />
                <span>RFC 4122 v4</span>
              </span>
            </div>
            <div className="p-3 max-h-[380px] overflow-y-auto space-y-1 font-mono text-xs">
              {generatedUuids.map((id, idx) => (
                <div
                  key={idx}
                  className="flex items-center justify-between p-2 rounded hover:bg-slate-500/5 group"
                >
                  <span className="text-ide-text-light dark:text-ide-text select-all">{id}</span>
                  <button
                    type="button"
                    onClick={async () => {
                      await navigator.clipboard.writeText(id);
                    }}
                    className="opacity-0 group-hover:opacity-100 p-1 text-ide-text-muted hover:text-sky-500 transition-opacity"
                    title="Copy this UUID"
                    aria-label={`Copy UUID ${id}`}
                  >
                    <Copy className="w-3.5 h-3.5" />
                  </button>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
