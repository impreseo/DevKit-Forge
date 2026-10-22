import React, { useState, useEffect, useRef } from 'react';
import { TOOL_REGISTRY, searchTools } from '../registry/tools';
import { Search, CornerDownLeft, Sparkles } from 'lucide-react';

interface CommandPaletteProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectTool: (id: string) => void;
}

export const CommandPalette: React.FC<CommandPaletteProps> = ({
  isOpen,
  onClose,
  onSelectTool,
}) => {
  const [query, setQuery] = useState<string>('');
  const [selectedIndex, setSelectedIndex] = useState<number>(0);
  const inputRef = useRef<HTMLInputElement>(null);

  const results = searchTools(query, 'all');

  useEffect(() => {
    if (isOpen) {
      setQuery('');
      setSelectedIndex(0);
      setTimeout(() => inputRef.current?.focus(), 50);
    }
  }, [isOpen]);

  useEffect(() => {
    setSelectedIndex(0);
  }, [query]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!isOpen) {
        if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'k') {
          e.preventDefault();
          // Open triggered from parent or globally
        }
        return;
      }

      if (e.key === 'Escape') {
        e.preventDefault();
        onClose();
      } else if (e.key === 'ArrowDown') {
        e.preventDefault();
        setSelectedIndex((prev) => (prev + 1 < results.length ? prev + 1 : 0));
      } else if (e.key === 'ArrowUp') {
        e.preventDefault();
        setSelectedIndex((prev) => (prev - 1 >= 0 ? prev - 1 : Math.max(0, results.length - 1)));
      } else if (e.key === 'Enter') {
        e.preventDefault();
        if (results[selectedIndex]) {
          onSelectTool(results[selectedIndex].id);
          onClose();
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, results, selectedIndex, onClose, onSelectTool]);

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-start justify-center pt-20 px-4 bg-black/60 backdrop-blur-xs select-none"
      onClick={onClose}
    >
      <div
        className="w-full max-w-xl rounded-lg border border-ide-border-light dark:border-ide-border bg-ide-surface-light dark:bg-ide-surface shadow-2xl overflow-hidden flex flex-col max-h-[480px]"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Search Input Bar */}
        <div className="flex items-center gap-2.5 px-3.5 py-3 border-b border-ide-border-light dark:border-ide-border bg-ide-panel-light dark:bg-ide-panel">
          <Search className="w-4 h-4 text-sky-500 shrink-0" />
          <input
            ref={inputRef}
            aria-label="Search tools palette"
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Type tool name, category, or tag (e.g. json, regex, git)..."
            className="flex-1 bg-transparent text-sm text-ide-text-light dark:text-ide-text placeholder-ide-text-muted focus:outline-none"
          />
          <kbd className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-ide-surface-light dark:bg-ide-surface border border-ide-border-light dark:border-ide-border text-ide-text-muted">
            ESC
          </kbd>
        </div>

        {/* Results List */}
        <div className="flex-1 overflow-y-auto p-1.5 divide-y divide-ide-border-light/40 dark:divide-ide-border/40">
          {results.length === 0 ? (
            <div className="p-8 text-center text-xs text-ide-text-muted">
              No developer tools found matching &quot;{query}&quot;
            </div>
          ) : (
            results.map((tool, idx) => {
              const Icon = tool.icon;
              const isSelected = idx === selectedIndex;
              return (
                <div
                  key={tool.id}
                  onClick={() => {
                    onSelectTool(tool.id);
                    onClose();
                  }}
                  onMouseEnter={() => setSelectedIndex(idx)}
                  className={`p-2.5 rounded flex items-center justify-between cursor-pointer transition-colors ${
                    isSelected
                      ? 'bg-sky-500/15 text-sky-600 dark:text-sky-300'
                      : 'text-ide-text-light dark:text-ide-text hover:bg-slate-500/5'
                  }`}
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <div
                      className={`w-7 h-7 rounded flex items-center justify-center shrink-0 ${
                        isSelected
                          ? 'bg-sky-500/20 text-sky-500'
                          : 'bg-ide-panel-light dark:bg-ide-panel text-ide-text-muted'
                      }`}
                    >
                      <Icon className="w-4 h-4" />
                    </div>
                    <div className="min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="font-semibold text-xs truncate">{tool.title}</span>
                        <span className="text-[10px] font-mono px-1.5 py-0.2 rounded bg-ide-panel-light dark:bg-ide-panel text-ide-text-muted border border-ide-border-light dark:border-ide-border uppercase">
                          {tool.category}
                        </span>
                      </div>
                      <p className="text-[11px] text-ide-text-muted truncate mt-0.5">
                        {tool.shortDescription}
                      </p>
                    </div>
                  </div>

                  {isSelected && (
                    <CornerDownLeft className="w-3.5 h-3.5 text-sky-500 shrink-0 ml-2" />
                  )}
                </div>
              );
            })
          )}
        </div>

        {/* Palette Footer */}
        <div className="px-3 py-2 bg-ide-panel-light dark:bg-ide-panel border-t border-ide-border-light dark:border-ide-border text-[11px] text-ide-text-muted flex items-center justify-between">
          <div className="flex items-center gap-3">
            <span className="flex items-center gap-1">
              <kbd className="font-mono text-[10px] px-1 py-0.2 rounded bg-ide-surface-light dark:bg-ide-surface border border-ide-border-light dark:border-ide-border">
                ↑↓
              </kbd>
              <span>to navigate</span>
            </span>
            <span className="flex items-center gap-1">
              <kbd className="font-mono text-[10px] px-1 py-0.2 rounded bg-ide-surface-light dark:bg-ide-surface border border-ide-border-light dark:border-ide-border">
                ↵
              </kbd>
              <span>to select</span>
            </span>
          </div>
          <span className="flex items-center gap-1 text-[10px]">
            <Sparkles className="w-3 h-3 text-sky-500" />
            <span>{TOOL_REGISTRY.length} offline tools ready</span>
          </span>
        </div>
      </div>
    </div>
  );
};
