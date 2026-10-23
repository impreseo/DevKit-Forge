import React, { useState } from 'react';
import { parseJwt, formatUnixTimestamp, getExpirationStatus } from '../../utils/jwtUtils';
import { KeyRound, ShieldAlert, Copy, Check, Trash2, RefreshCw, AlertCircle, Clock, CheckCircle2 } from 'lucide-react';

const SAMPLE_JWT =
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.' +
  'eyJzdWIiOiIxMjM0NTY3ODkwIiwibmFtZSI6IkFsZXggRGV2Iiwicm9sZXMiOlsic3R1ZGVudCIsImVuZ2luZWVyIl0sImlhdCI6MTUxNjIzOTAyMiwiZXhwIjoyNTI0NjA4MDAwfQ.' +
  'dBjftJeZ4CVP-mB92K27uhbUJU1p1r_wW1gFWFOEjXk';

export const JwtInspector: React.FC = () => {
  const [tokenInput, setTokenInput] = useState<string>(SAMPLE_JWT);
  const [copiedType, setCopiedType] = useState<string | null>(null);

  const result = parseJwt(tokenInput);

  const handleCopy = async (text: string, type: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopiedType(type);
      setTimeout(() => setCopiedType(null), 2000);
    } catch {
      // Fallback
    }
  };

  const expStatus = result.success && result.data?.payload
    ? getExpirationStatus(result.data.payload.exp)
    : null;

  return (
    <div className="space-y-4">
      {/* Header & Controls Toolbar */}
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-ide-border-light dark:border-ide-border pb-3">
        <div className="flex items-center gap-2">
          <KeyRound className="w-5 h-5 text-sky-500" />
          <h2 className="text-base font-semibold text-ide-text-light dark:text-ide-text">
            JSON Web Token (JWT) Inspector
          </h2>
          <span className="text-xs px-2 py-0.5 rounded bg-sky-500/10 text-sky-600 dark:text-sky-400 font-mono">
            Client-Side Debugger
          </span>
        </div>

        {/* Toolbar Buttons */}
        <div className="flex flex-wrap items-center gap-2 text-xs">
          <button
            type="button"
            onClick={() => setTokenInput(SAMPLE_JWT)}
            className="flex items-center gap-1 px-2.5 py-1 rounded border border-ide-border-light dark:border-ide-border bg-ide-panel-light dark:bg-ide-panel text-ide-text-mutedLight dark:text-ide-text-muted hover:text-ide-text-light dark:hover:text-ide-text transition-colors"
            title="Load sample JWT token"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            <span>Sample</span>
          </button>

          <button
            type="button"
            onClick={() => setTokenInput('')}
            className="flex items-center gap-1 px-2.5 py-1 rounded border border-ide-border-light dark:border-ide-border bg-ide-panel-light dark:bg-ide-panel text-ide-text-mutedLight dark:text-ide-text-muted hover:text-rose-500 transition-colors"
            title="Clear token input"
          >
            <Trash2 className="w-3.5 h-3.5" />
            <span>Clear</span>
          </button>
        </div>
      </div>

      {/* Security Advisory Callout */}
      <div className="flex items-start gap-2.5 p-3 rounded bg-amber-500/10 border border-amber-500/30 text-amber-700 dark:text-amber-300 text-xs">
        <ShieldAlert className="w-4 h-4 shrink-0 mt-0.5 text-amber-500" />
        <div className="leading-relaxed">
          <span className="font-semibold">Security Advisory:</span> This tool decodes JWT claims locally in your browser memory for debugging. Decoding does <strong>NOT</strong> verify the cryptographic signature or validate issuer authenticity. Never treat decoded unverified tokens as proof of authorization.
        </div>
      </div>

      {/* Token Input Section */}
      <div className="flex flex-col rounded border border-ide-border-light dark:border-ide-border bg-ide-surface-light dark:bg-ide-surface overflow-hidden">
        <div className="flex items-center justify-between px-3 py-2 bg-ide-panel-light dark:bg-ide-panel border-b border-ide-border-light dark:border-ide-border text-xs text-ide-text-muted">
          <span className="font-medium">Encoded Token (Header.Payload.Signature)</span>
          <span className="font-mono text-[11px]">{tokenInput.length} chars</span>
        </div>
        <textarea
          aria-label="Encoded JWT Token"
          value={tokenInput}
          onChange={(e) => setTokenInput(e.target.value.trim())}
          placeholder="Paste JWT string (eyJhbGciOi...)"
          className="p-3 bg-transparent font-mono text-xs text-ide-text-light dark:text-ide-text focus:outline-none resize-none leading-relaxed h-24 overflow-auto break-all"
          spellCheck={false}
        />
      </div>

      {/* Parse Error Callout */}
      {!result.success && tokenInput.length > 0 && (
        <div className="flex items-start gap-2.5 p-3 rounded bg-rose-500/10 border border-rose-500/30 text-rose-600 dark:text-rose-400 text-xs font-mono">
          <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
          <div className="flex-1">
            <span className="font-semibold">Invalid JWT:</span> {result.error}
          </div>
        </div>
      )}

      {/* Decoded Inspection Panes */}
      {result.success && result.data && (
        <div className="space-y-4">
          {/* Token Metadata & Expiration Status Row */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
            {/* Algorithm info */}
            <div className="p-3 rounded border border-ide-border-light dark:border-ide-border bg-ide-panel-light dark:bg-ide-panel flex flex-col justify-between">
              <span className="text-ide-text-muted text-[11px]">Signing Algorithm</span>
              <span className="font-mono font-semibold text-ide-text-light dark:text-ide-text text-sm mt-1">
                {(result.data.header.alg as string) || 'none'}
              </span>
            </div>

            {/* Expiration badge */}
            <div className="p-3 rounded border border-ide-border-light dark:border-ide-border bg-ide-panel-light dark:bg-ide-panel flex flex-col justify-between">
              <span className="text-ide-text-muted text-[11px] flex items-center gap-1">
                <Clock className="w-3 h-3" />
                <span>Expiration Claim (exp)</span>
              </span>
              <div className="mt-1">
                {expStatus ? (
                  <span
                    className={`inline-flex items-center gap-1 px-2 py-0.5 rounded text-xs font-semibold ${
                      expStatus.isExpired
                        ? 'bg-rose-500/15 text-rose-600 dark:text-rose-400'
                        : 'bg-emerald-500/15 text-emerald-600 dark:text-emerald-400'
                    }`}
                  >
                    {expStatus.isExpired ? <AlertCircle className="w-3 h-3" /> : <CheckCircle2 className="w-3 h-3" />}
                    <span>{expStatus.message}</span>
                  </span>
                ) : (
                  <span className="text-ide-text-muted font-mono">No exp claim</span>
                )}
              </div>
            </div>

            {/* Issued At */}
            <div className="p-3 rounded border border-ide-border-light dark:border-ide-border bg-ide-panel-light dark:bg-ide-panel flex flex-col justify-between">
              <span className="text-ide-text-muted text-[11px]">Issued At (iat)</span>
              <span className="font-mono text-xs text-ide-text-light dark:text-ide-text mt-1 truncate">
                {formatUnixTimestamp(result.data.payload.iat)}
              </span>
            </div>
          </div>

          {/* Decoded Header and Payload Split */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            {/* Header Column */}
            <div className="flex flex-col h-[340px] rounded border border-ide-border-light dark:border-ide-border bg-ide-surface-light dark:bg-ide-surface overflow-hidden">
              <div className="flex items-center justify-between px-3 py-2 bg-ide-panel-light dark:bg-ide-panel border-b border-ide-border-light dark:border-ide-border text-xs text-ide-text-muted">
                <span className="font-medium text-rose-500 font-mono">HEADER (Algorithm & Type)</span>
                <button
                  type="button"
                  onClick={() => handleCopy(result.data!.headerJson, 'header')}
                  className="flex items-center gap-1 px-2 py-0.5 rounded border border-ide-border-light dark:border-ide-border bg-ide-surface-light dark:bg-ide-surface text-[11px] hover:text-sky-500 transition-colors"
                >
                  {copiedType === 'header' ? <Check className="w-3 h-3" /> : <Copy className="w-3 h-3" />}
                  <span>{copiedType === 'header' ? 'Copied' : 'Copy'}</span>
                </button>
              </div>
              <div className="flex-1 p-3 overflow-auto bg-ide-surface-light dark:bg-ide-surface/50">
                <pre className="font-mono text-xs text-ide-text-light dark:text-ide-text leading-relaxed whitespace-pre">
                  {result.data.headerJson}
                </pre>
              </div>
            </div>

            {/* Payload Column */}
            <div className="flex flex-col h-[340px] rounded border border-ide-border-light dark:border-ide-border bg-ide-surface-light dark:bg-ide-surface overflow-hidden">
              <div className="flex items-center justify-between px-3 py-2 bg-ide-panel-light dark:bg-ide-panel border-b border-ide-border-light dark:border-ide-border text-xs text-ide-text-muted">
                <span className="font-medium text-purple-500 font-mono">PAYLOAD (Data Claims)</span>
                <button
                  type="button"
                  onClick={() => handleCopy(result.data!.payloadJson, 'payload')}
                  className="flex items-center gap-1 px-2 py-0.5 rounded border border-ide-border-light dark:border-ide-border bg-ide-surface-light dark:bg-ide-surface text-[11px] hover:text-sky-500 transition-colors"
                >
                  {copiedType === 'payload' ? <Check className="w-3 h-3" /> : <Copy className="w-3 h-3" />}
                  <span>{copiedType === 'payload' ? 'Copied' : 'Copy'}</span>
                </button>
              </div>
              <div className="flex-1 p-3 overflow-auto bg-ide-surface-light dark:bg-ide-surface/50">
                <pre className="font-mono text-xs text-ide-text-light dark:text-ide-text leading-relaxed whitespace-pre">
                  {result.data.payloadJson}
                </pre>
              </div>
            </div>
          </div>

          {/* Signature Pane */}
          <div className="p-3 rounded border border-ide-border-light dark:border-ide-border bg-ide-surface-light dark:bg-ide-surface text-xs space-y-1.5">
            <div className="flex items-center justify-between">
              <span className="font-mono font-medium text-sky-500">SIGNATURE (Raw Base64URL)</span>
              <button
                type="button"
                onClick={() => handleCopy(result.data!.signature, 'sig')}
                className="flex items-center gap-1 px-2 py-0.5 rounded border border-ide-border-light dark:border-ide-border bg-ide-panel-light dark:bg-ide-panel text-[11px] hover:text-sky-500 transition-colors"
              >
                {copiedType === 'sig' ? <Check className="w-3 h-3" /> : <Copy className="w-3 h-3" />}
                <span>{copiedType === 'sig' ? 'Copied' : 'Copy Signature'}</span>
              </button>
            </div>
            <div className="p-2 rounded bg-ide-panel-light dark:bg-ide-panel font-mono text-[11px] text-ide-text-muted break-all">
              {result.data.signature || '<empty signature>'}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
