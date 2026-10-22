import React from 'react';
import { ShieldCheck, Cpu } from 'lucide-react';
import { getToolById } from '../registry/tools';

interface StatusBarProps {
  activeToolId: string | null;
  onOpenCommandPalette: () => void;
}

export const StatusBar: React.FC<StatusBarProps> = ({
  activeToolId,
  onOpenCommandPalette,
}) => {
  const activeTool = activeToolId ? getToolById(activeToolId) : null;

  return (
    <footer className="h-6 border-t border-ide-border-light dark:border-ide-border bg-ide-panel-light dark:bg-ide-panel px-3 flex items-center justify-between text-[11px] text-ide-text-mutedLight dark:text-ide-text-muted select-none font-mono z-20">
      {/* Left side: Active Tool status */}
      <div className="flex items-center gap-3">
        <div className="flex items-center gap-1 text-sky-600 dark:text-sky-400 font-medium">
          <Cpu className="w-3 h-3 text-sky-500" />
          <span>{activeTool ? activeTool.title : 'Workspace Overview'}</span>
        </div>
        <span className="hidden sm:inline text-ide-border dark:text-ide-border">|</span>
        <div className="hidden sm:flex items-center gap-1 text-emerald-600 dark:text-emerald-400">
          <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
          <span>Local Engine Active</span>
        </div>
      </div>

      {/* Center: Quick action hint */}
      <div className="hidden md:flex items-center gap-2">
        <button
          type="button"
          onClick={onOpenCommandPalette}
          className="hover:text-ide-text-light dark:hover:text-ide-text transition-colors"
        >
          Press <kbd className="px-1 py-0.2 rounded bg-ide-surface-light dark:bg-ide-surface border border-ide-border-light dark:border-ide-border text-[10px]">Ctrl+K</kbd> for quick launcher
        </button>
      </div>

      {/* Right side: Security Guarantee & Version */}
      <div className="flex items-center gap-2">
        <div className="flex items-center gap-1 text-emerald-600 dark:text-emerald-400" title="All processing occurs locally in browser memory">
          <ShieldCheck className="w-3 h-3 text-emerald-500" />
          <span className="hidden sm:inline">Zero Telemetry</span>
        </div>
        <span className="text-ide-border dark:text-ide-border">|</span>
        <span>UTF-8</span>
      </div>
    </footer>
  );
};
