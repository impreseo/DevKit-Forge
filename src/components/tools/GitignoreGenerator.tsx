import React, { useState, useMemo } from 'react';
import { GITIGNORE_TEMPLATES, generateCombinedGitignore } from '../../utils/gitignoreTemplates';
import { GitBranch, Search, Copy, Check, Download, Trash2, Plus, Tag, CheckSquare, Square } from 'lucide-react';

const CATEGORIES = ['All', 'Languages', 'Frameworks', 'Operating Systems', 'Editors & IDEs'] as const;

export const GitignoreGenerator: React.FC = () => {
  const [selectedIds, setSelectedIds] = useState<string[]>(['node', 'vscode', 'macos']);
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [customRules, setCustomRules] = useState<string>('# Local secrets\n.env.local\n*.pem\nsecrets/');
  const [copied, setCopied] = useState<boolean>(false);

  const filteredTemplates = useMemo(() => {
    return GITIGNORE_TEMPLATES.filter((template) => {
      const matchesSearch =
        template.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        template.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
        template.id.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesCategory =
        selectedCategory === 'All' || template.category === selectedCategory;
      return matchesSearch && matchesCategory;
    });
  }, [searchQuery, selectedCategory]);

  const combinedContent = useMemo(() => {
    return generateCombinedGitignore(selectedIds, customRules);
  }, [selectedIds, customRules]);

  const toggleTemplate = (id: string) => {
    if (selectedIds.includes(id)) {
      setSelectedIds(selectedIds.filter((item) => item !== id));
    } else {
      setSelectedIds([...selectedIds, id]);
    }
  };

  const handleSelectAllFiltered = () => {
    const newIds = new Set([...selectedIds, ...filteredTemplates.map((t) => t.id)]);
    setSelectedIds(Array.from(newIds));
  };

  const handleDeselectAll = () => {
    setSelectedIds([]);
  };

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(combinedContent);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // Fallback
    }
  };

  const handleDownload = () => {
    const blob = new Blob([combinedContent], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = '.gitignore';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-4">
      {/* Header & Controls Toolbar */}
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-ide-border-light dark:border-ide-border pb-3">
        <div className="flex items-center gap-2">
          <GitBranch className="w-5 h-5 text-sky-500" />
          <h2 className="text-base font-semibold text-ide-text-light dark:text-ide-text">
            .gitignore Generator
          </h2>
          <span className="text-xs px-2 py-0.5 rounded bg-sky-500/10 text-sky-600 dark:text-sky-400 font-mono">
            Client-Side
          </span>
        </div>

        {/* Toolbar Buttons */}
        <div className="flex flex-wrap items-center gap-2 text-xs">
          <button
            type="button"
            onClick={handleDeselectAll}
            className="flex items-center gap-1 px-2.5 py-1 rounded border border-ide-border-light dark:border-ide-border bg-ide-panel-light dark:bg-ide-panel text-ide-text-mutedLight dark:text-ide-text-muted hover:text-rose-500 transition-colors"
            title="Deselect all templates"
          >
            <Trash2 className="w-3.5 h-3.5" />
            <span>Reset All</span>
          </button>

          <button
            type="button"
            onClick={handleCopy}
            disabled={!combinedContent}
            className="flex items-center gap-1 px-3 py-1 rounded border border-ide-border-light dark:border-ide-border bg-ide-panel-light dark:bg-ide-panel text-ide-text-light dark:text-ide-text hover:border-sky-500 font-medium transition-colors"
            title="Copy combined .gitignore"
          >
            {copied ? <Check className="w-3.5 h-3.5 text-emerald-500" /> : <Copy className="w-3.5 h-3.5" />}
            <span>{copied ? 'Copied' : 'Copy'}</span>
          </button>

          <button
            type="button"
            onClick={handleDownload}
            disabled={!combinedContent}
            className="flex items-center gap-1 px-3 py-1 rounded bg-sky-600 hover:bg-sky-500 text-white font-medium transition-colors"
            title="Download .gitignore file"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Download .gitignore</span>
          </button>
        </div>
      </div>

      {/* Selected Templates Tag Row */}
      <div className="p-2.5 rounded border border-ide-border-light dark:border-ide-border bg-ide-panel-light dark:bg-ide-panel space-y-2">
        <div className="flex items-center justify-between text-xs">
          <div className="flex items-center gap-1.5 font-medium text-ide-text-light dark:text-ide-text">
            <Tag className="w-3.5 h-3.5 text-sky-500" />
            <span>Selected Templates ({selectedIds.length}):</span>
          </div>
          {selectedIds.length > 0 && (
            <button
              type="button"
              onClick={handleDeselectAll}
              className="text-[11px] text-rose-500 hover:underline"
            >
              Clear selections
            </button>
          )}
        </div>

        <div className="flex flex-wrap gap-1.5 min-h-6">
          {selectedIds.length === 0 ? (
            <span className="text-xs text-ide-text-muted italic">
              No templates selected. Choose from the curated list below.
            </span>
          ) : (
            selectedIds.map((id) => {
              const t = GITIGNORE_TEMPLATES.find((item) => item.id === id);
              return (
                <span
                  key={id}
                  className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded text-xs bg-sky-500/15 text-sky-700 dark:text-sky-300 border border-sky-500/30"
                >
                  <span>{t?.name || id}</span>
                  <button
                    type="button"
                    onClick={() => toggleTemplate(id)}
                    className="hover:text-rose-500 font-bold ml-0.5"
                    title={`Remove ${t?.name}`}
                  >
                    ×
                  </button>
                </span>
              );
            })
          )}
        </div>
      </div>

      {/* Main Grid: Template Selector vs Combined Live Output */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
        {/* Left Column: Template Selection (5 cols) */}
        <div className="lg:col-span-5 space-y-3">
          {/* Search & Category Filter */}
          <div className="space-y-2">
            <div className="flex items-center gap-2 px-3 py-1.5 rounded border border-ide-border-light dark:border-ide-border bg-ide-surface-light dark:bg-ide-surface text-xs focus-within:border-sky-500">
              <Search className="w-3.5 h-3.5 text-ide-text-muted shrink-0" />
              <input
                aria-label="Filter templates"
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search templates (e.g. Node, Python, macOS)..."
                className="bg-transparent flex-1 text-ide-text-light dark:text-ide-text focus:outline-none"
              />
            </div>

            <div className="flex flex-wrap gap-1">
              {CATEGORIES.map((cat) => (
                <button
                  key={cat}
                  type="button"
                  onClick={() => setSelectedCategory(cat)}
                  className={`px-2 py-0.5 rounded text-[11px] font-medium transition-colors ${
                    selectedCategory === cat
                      ? 'bg-sky-500 text-white'
                      : 'bg-ide-panel-light dark:bg-ide-panel text-ide-text-muted hover:text-ide-text-light dark:hover:text-ide-text border border-ide-border-light dark:border-ide-border'
                  }`}
                >
                  {cat}
                </button>
              ))}
            </div>
          </div>

          {/* Template Cards List */}
          <div className="h-[360px] overflow-y-auto rounded border border-ide-border-light dark:border-ide-border bg-ide-surface-light dark:bg-ide-surface divide-y divide-ide-border-light dark:divide-ide-border">
            {filteredTemplates.length === 0 ? (
              <div className="p-6 text-center text-xs text-ide-text-muted">
                No templates matching &quot;{searchQuery}&quot;
              </div>
            ) : (
              filteredTemplates.map((template) => {
                const isSelected = selectedIds.includes(template.id);
                return (
                  <div
                    key={template.id}
                    onClick={() => toggleTemplate(template.id)}
                    className={`p-2.5 cursor-pointer flex items-start gap-2.5 transition-colors ${
                      isSelected
                        ? 'bg-sky-500/10'
                        : 'hover:bg-slate-500/5'
                    }`}
                  >
                    <div className="mt-0.5 shrink-0 text-sky-500">
                      {isSelected ? (
                        <CheckSquare className="w-4 h-4 text-sky-500" />
                      ) : (
                        <Square className="w-4 h-4 text-ide-text-muted" />
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between gap-1">
                        <span className="font-semibold text-xs text-ide-text-light dark:text-ide-text truncate">
                          {template.name}
                        </span>
                        <span className="text-[10px] px-1.5 py-0.2 rounded bg-ide-panel-light dark:bg-ide-panel text-ide-text-muted border border-ide-border-light dark:border-ide-border">
                          {template.category}
                        </span>
                      </div>
                      <p className="text-[11px] text-ide-text-muted truncate mt-0.5">
                        {template.description}
                      </p>
                    </div>
                  </div>
                );
              })
            )}
          </div>

          {/* Quick Action: Select All Filtered */}
          {filteredTemplates.length > 0 && (
            <button
              type="button"
              onClick={handleSelectAllFiltered}
              className="text-[11px] text-sky-500 hover:underline block"
            >
              + Select all {filteredTemplates.length} visible templates
            </button>
          )}

          {/* Custom Project Rules Box */}
          <div className="rounded border border-ide-border-light dark:border-ide-border bg-ide-surface-light dark:bg-ide-surface overflow-hidden">
            <div className="px-3 py-1.5 bg-ide-panel-light dark:bg-ide-panel border-b border-ide-border-light dark:border-ide-border text-xs font-medium text-ide-text-mutedLight dark:text-ide-text-muted flex items-center gap-1.5">
              <Plus className="w-3.5 h-3.5 text-sky-500" />
              <span>Custom Project Rules (appended)</span>
            </div>
            <textarea
              aria-label="Custom Project Rules"
              value={customRules}
              onChange={(e) => setCustomRules(e.target.value)}
              placeholder="# Add any custom patterns here..."
              rows={3}
              className="w-full p-2.5 bg-transparent font-mono text-xs text-ide-text-light dark:text-ide-text focus:outline-none resize-none leading-relaxed"
              spellCheck={false}
            />
          </div>
        </div>

        {/* Right Column: Combined .gitignore File Preview (7 cols) */}
        <div className="lg:col-span-7 flex flex-col h-[520px] rounded border border-ide-border-light dark:border-ide-border bg-ide-surface-light dark:bg-ide-surface overflow-hidden">
          <div className="flex items-center justify-between px-3 py-2 bg-ide-panel-light dark:bg-ide-panel border-b border-ide-border-light dark:border-ide-border text-xs text-ide-text-mutedLight dark:text-ide-text-muted">
            <div className="flex items-center gap-2">
              <span className="font-mono font-semibold text-ide-text-light dark:text-ide-text">
                .gitignore
              </span>
              <span className="text-[11px]">Preview</span>
            </div>
            <span className="font-mono text-[11px]">
              {combinedContent ? `${combinedContent.split('\n').length} lines` : '0 lines'}
            </span>
          </div>

          <div className="flex-1 p-3 overflow-auto bg-ide-surface-light dark:bg-ide-surface/60 font-mono text-xs leading-relaxed">
            {combinedContent ? (
              <pre className="whitespace-pre text-ide-text-light dark:text-ide-text selection:bg-sky-500/20">
                {combinedContent}
              </pre>
            ) : (
              <div className="h-full flex items-center justify-center text-xs text-ide-text-muted font-mono">
                Select templates on the left to generate your .gitignore
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
