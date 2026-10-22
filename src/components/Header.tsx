import React from 'react';
import { Terminal, Search, Sun, Moon, Laptop, ShieldCheck, Github } from 'lucide-react';
import { ThemeMode } from '../utils/storage';

interface HeaderProps {
  onOpenCommandPalette: () => void;
  theme: ThemeMode;
  onThemeChange: (mode: ThemeMode) => void;
  onNavigateLanding: () => void;
  onToggleSidebar?: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  onOpenCommandPalette,
  theme,
  onThemeChange,
  onNavigateLanding,
}) => {
  const nextTheme: ThemeMode = theme === 'dark' ? 'light' : theme === 'light' ? 'system' : 'dark';

  return (
    <header className="h-12 border-b border-ide-border-light dark:border-ide-border bg-ide-surface-light dark:bg-ide-surface px-3 sm:px-4 flex items-center justify-between select-none z-20">
      {/* Left: Brand / Title */}
      <div className="flex items-center gap-3">
        <button
          type="button"
          onClick={onNavigateLanding}
          className="flex items-center gap-2 text-left group focus:outline-none"
        >
          <div className="w-7 h-7 rounded bg-sky-500/10 border border-sky-500/30 flex items-center justify-center text-sky-500 group-hover:border-sky-500 transition-colors">
            <Terminal className="w-4 h-4" />
          </div>
          <div className="flex flex-col">
            <div className="flex items-center gap-1.5">
              <span className="font-semibold text-xs sm:text-sm tracking-tight text-ide-text-light dark:text-ide-text">
                DevKit Forge
              </span>
              <span className="text-[10px] font-mono px-1 rounded bg-ide-panel-light dark:bg-ide-panel text-ide-text-muted border border-ide-border-light dark:border-ide-border">
                v1.0
              </span>
            </div>
          </div>
        </button>

        {/* Client-side Privacy Badge */}
        <div className="hidden md:flex items-center gap-1.5 px-2 py-0.5 rounded text-[11px] font-mono bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20">
          <ShieldCheck className="w-3 h-3 text-emerald-500 shrink-0" />
          <span>100% Client-Side • Zero Server Uploads</span>
        </div>
      </div>

      {/* Center / Right: Quick Search Button & Actions */}
      <div className="flex items-center gap-2">
        {/* Command Palette Trigger */}
        <button
          type="button"
          onClick={onOpenCommandPalette}
          className="flex items-center gap-2 px-2.5 py-1 rounded border border-ide-border-light dark:border-ide-border bg-ide-panel-light dark:bg-ide-panel text-ide-text-muted hover:text-ide-text-light dark:hover:text-ide-text text-xs transition-colors w-36 sm:w-56 justify-between"
          title="Open Tool Palette (Ctrl+K or ⌘K)"
        >
          <div className="flex items-center gap-1.5 truncate">
            <Search className="w-3.5 h-3.5 shrink-0" />
            <span className="truncate">Search tools...</span>
          </div>
          <kbd className="hidden sm:inline-block font-mono text-[10px] px-1 py-0.2 rounded bg-ide-surface-light dark:bg-ide-surface border border-ide-border-light dark:border-ide-border text-ide-text-muted">
            Ctrl+K
          </kbd>
        </button>

        {/* Theme Toggle */}
        <button
          type="button"
          onClick={() => onThemeChange(nextTheme)}
          className="w-7 h-7 rounded border border-ide-border-light dark:border-ide-border bg-ide-panel-light dark:bg-ide-panel text-ide-text-muted hover:text-ide-text-light dark:hover:text-ide-text flex items-center justify-center transition-colors"
          title={`Theme: ${theme}. Click to switch.`}
          aria-label="Toggle visual theme"
        >
          {theme === 'dark' && <Moon className="w-3.5 h-3.5 text-sky-400" />}
          {theme === 'light' && <Sun className="w-3.5 h-3.5 text-amber-500" />}
          {theme === 'system' && <Laptop className="w-3.5 h-3.5 text-slate-400" />}
        </button>

        {/* GitHub Link */}
        <a
          href="https://github.com/impreseo/devkit-forge"
          target="_blank"
          rel="noopener noreferrer"
          className="w-7 h-7 rounded border border-ide-border-light dark:border-ide-border bg-ide-panel-light dark:bg-ide-panel text-ide-text-muted hover:text-ide-text-light dark:hover:text-ide-text flex items-center justify-center transition-colors"
          title="GitHub Repository"
          aria-label="GitHub Repository"
        >
          <Github className="w-3.5 h-3.5" />
        </a>
      </div>
    </header>
  );
};
