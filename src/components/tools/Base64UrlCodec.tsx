import React, { useState } from 'react';
import {
  encodeBase64,
  decodeBase64,
  encodeUrlComponent,
  decodeUrlComponent,
  textToHex,
  hexToText,
  calculateUtf8ByteLength,
} from '../../utils/codecUtils';
import { Binary, Copy, Check, Trash2, RefreshCw, ArrowRightLeft, AlertCircle } from 'lucide-react';

type CodecType = 'base64' | 'url' | 'hex';
type CodecMode = 'encode' | 'decode';

const SAMPLES: Record<CodecType, { encode: string; decode: string }> = {
  base64: {
    encode: 'DevKit Forge: Fast, private, client-side developer toolkit! 🚀',
    decode: 'RGV2S2l0IEZvcmdlOiBGYXN0LCBwcml2YXRlLCBjbGllbnQtc2lkZSBkZXZlbG9wZXIgdG9vbGtpdCEg8J+agA==',
  },
  url: {
    encode: 'https://example.com/api/v1/search?query=react+typescript&filter=dev kit&sort=desc#results',
    decode: 'https%3A%2F%2Fexample.com%2Fapi%2Fv1%2Fsearch%3Fquery%3Dreact%2Btypescript%26filter%3Ddev%20kit%26sort%3Ddesc%23results',
  },
  hex: {
    encode: 'Hello DevKit',
    decode: '48656c6c6f204465764b6974',
  },
};

export const Base64UrlCodec: React.FC = () => {
  const [codecType, setCodecType] = useState<CodecType>('base64');
  const [mode, setMode] = useState<CodecMode>('encode');
  const [input, setInput] = useState<string>(SAMPLES.base64.encode);
  const [copied, setCopied] = useState<boolean>(false);

  // Compute transformation
  let output = '';
  let error: string | null = null;

  if (input.length > 0) {
    if (codecType === 'base64') {
      const res = mode === 'encode' ? encodeBase64(input) : decodeBase64(input);
      if (res.error) {
        error = res.error;
      } else {
        output = res.output;
      }
    } else if (codecType === 'url') {
      const res = mode === 'encode' ? encodeUrlComponent(input) : decodeUrlComponent(input);
      if (res.error) {
        error = res.error;
      } else {
        output = res.output;
      }
    } else {
      const res = mode === 'encode' ? textToHex(input) : hexToText(input);
      if (res.error) {
        error = res.error;
      } else {
        output = res.output;
      }
    }
  }

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

  const handleSwap = () => {
    if (output) {
      setInput(output);
      setMode(mode === 'encode' ? 'decode' : 'encode');
    }
  };

  const handleLoadSample = () => {
    setInput(SAMPLES[codecType][mode]);
  };

  const handleClear = () => {
    setInput('');
  };

  const inputBytes = calculateUtf8ByteLength(input);
  const outputBytes = calculateUtf8ByteLength(output);

  return (
    <div className="space-y-4">
      {/* Header & Controls Toolbar */}
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-ide-border-light dark:border-ide-border pb-3">
        <div className="flex items-center gap-2">
          <Binary className="w-5 h-5 text-sky-500" />
          <h2 className="text-base font-semibold text-ide-text-light dark:text-ide-text">
            Base64, URL & Hex Encoders
          </h2>
          <span className="text-xs px-2 py-0.5 rounded bg-sky-500/10 text-sky-600 dark:text-sky-400 font-mono">
            UTF-8 Safe
          </span>
        </div>

        {/* Toolbar Buttons */}
        <div className="flex flex-wrap items-center gap-2 text-xs">
          {/* Swap Input & Output */}
          <button
            type="button"
            onClick={handleSwap}
            disabled={!output || !!error}
            className="flex items-center gap-1 px-2.5 py-1 rounded border border-ide-border-light dark:border-ide-border bg-ide-panel-light dark:bg-ide-panel text-ide-text-mutedLight dark:text-ide-text-muted hover:text-ide-text-light dark:hover:text-ide-text disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
            title="Swap input and output values"
          >
            <ArrowRightLeft className="w-3.5 h-3.5" />
            <span>Swap</span>
          </button>

          {/* Sample Button */}
          <button
            type="button"
            onClick={handleLoadSample}
            className="flex items-center gap-1 px-2.5 py-1 rounded border border-ide-border-light dark:border-ide-border bg-ide-panel-light dark:bg-ide-panel text-ide-text-mutedLight dark:text-ide-text-muted hover:text-ide-text-light dark:hover:text-ide-text transition-colors"
            title="Load sample content"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            <span>Sample</span>
          </button>

          {/* Clear Button */}
          <button
            type="button"
            onClick={handleClear}
            className="flex items-center gap-1 px-2.5 py-1 rounded border border-ide-border-light dark:border-ide-border bg-ide-panel-light dark:bg-ide-panel text-ide-text-mutedLight dark:text-ide-text-muted hover:text-rose-500 transition-colors"
            title="Clear input"
          >
            <Trash2 className="w-3.5 h-3.5" />
            <span>Clear</span>
          </button>

          {/* Copy Button */}
          <button
            type="button"
            onClick={handleCopy}
            disabled={!output || !!error}
            className="flex items-center gap-1 px-3 py-1 rounded bg-sky-600 hover:bg-sky-500 text-white font-medium disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
            title="Copy transformed output"
          >
            {copied ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
            <span>{copied ? 'Copied' : 'Copy Output'}</span>
          </button>
        </div>
      </div>

      {/* Codec Selection & Mode Switches */}
      <div className="flex flex-wrap items-center justify-between gap-3 p-2.5 rounded border border-ide-border-light dark:border-ide-border bg-ide-panel-light dark:bg-ide-panel text-xs">
        {/* Codec Tabs */}
        <div className="flex items-center gap-1">
          <span className="text-ide-text-muted mr-1 font-medium">Codec:</span>
          {(['base64', 'url', 'hex'] as CodecType[]).map((type) => (
            <button
              key={type}
              type="button"
              onClick={() => {
                setCodecType(type);
                setInput(SAMPLES[type][mode]);
              }}
              className={`px-3 py-1 rounded font-medium transition-colors ${
                codecType === type
                  ? 'bg-sky-500 text-white shadow-xs'
                  : 'bg-ide-surface-light dark:bg-ide-surface text-ide-text-muted hover:text-ide-text-light dark:hover:text-ide-text border border-ide-border-light dark:border-ide-border'
              }`}
            >
              {type === 'base64' ? 'Base64' : type === 'url' ? 'URL Component' : 'Hexadecimal'}
            </button>
          ))}
        </div>

        {/* Mode Toggle */}
        <div className="flex items-center gap-1">
          <span className="text-ide-text-muted mr-1 font-medium">Mode:</span>
          {(['encode', 'decode'] as CodecMode[]).map((m) => (
            <button
              key={m}
              type="button"
              onClick={() => setMode(m)}
              className={`px-3 py-1 rounded font-medium capitalize transition-colors ${
                mode === m
                  ? 'bg-sky-500 text-white shadow-xs'
                  : 'bg-ide-surface-light dark:bg-ide-surface text-ide-text-muted hover:text-ide-text-light dark:hover:text-ide-text border border-ide-border-light dark:border-ide-border'
              }`}
            >
              {m}
            </button>
          ))}
        </div>
      </div>

      {/* Error Callout */}
      {error && (
        <div className="flex items-start gap-2.5 p-3 rounded bg-rose-500/10 border border-rose-500/30 text-rose-600 dark:text-rose-400 text-xs font-mono">
          <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
          <div className="flex-1">
            <span className="font-semibold">Decoding Error:</span> {error}
          </div>
        </div>
      )}

      {/* Split Views */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Input Column */}
        <div className="flex flex-col h-[360px] sm:h-[440px] rounded border border-ide-border-light dark:border-ide-border bg-ide-surface-light dark:bg-ide-surface overflow-hidden">
          <div className="flex items-center justify-between px-3 py-2 bg-ide-panel-light dark:bg-ide-panel border-b border-ide-border-light dark:border-ide-border text-xs text-ide-text-mutedLight dark:text-ide-text-muted">
            <span className="font-medium">
              {mode === 'encode' ? 'Raw Input' : `${codecType.toUpperCase()} Encoded Input`}
            </span>
            <span className="font-mono text-[11px]">
              {input.length} chars ({inputBytes} bytes)
            </span>
          </div>
          <textarea
            aria-label="Input content to encode or decode"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder={`Enter text to ${mode}...`}
            className="flex-1 p-3 bg-transparent font-mono text-xs text-ide-text-light dark:text-ide-text focus:outline-none resize-none leading-relaxed overflow-auto"
            spellCheck={false}
          />
        </div>

        {/* Output Column */}
        <div className="flex flex-col h-[360px] sm:h-[440px] rounded border border-ide-border-light dark:border-ide-border bg-ide-surface-light dark:bg-ide-surface overflow-hidden">
          <div className="flex items-center justify-between px-3 py-2 bg-ide-panel-light dark:bg-ide-panel border-b border-ide-border-light dark:border-ide-border text-xs text-ide-text-mutedLight dark:text-ide-text-muted">
            <span className="font-medium">
              {mode === 'encode' ? `${codecType.toUpperCase()} Output` : 'Decoded Plaintext'}
            </span>
            <span className="font-mono text-[11px]">
              {output.length} chars ({outputBytes} bytes)
            </span>
          </div>
          <div className="flex-1 p-3 overflow-auto bg-ide-surface-light dark:bg-ide-surface/50">
            {output ? (
              <pre className="font-mono text-xs text-ide-text-light dark:text-ide-text break-all whitespace-pre-wrap selection:bg-sky-500/20">
                {output}
              </pre>
            ) : (
              <div className="h-full flex items-center justify-center text-xs text-ide-text-muted font-mono">
                {error ? 'Fix invalid input to view output' : 'Output will appear here'}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
