import React, { useState } from 'react';
import { searchTools } from '../registry/tools';
import { ToolCategory } from '../types';
import { Search, Star, ArrowRight, ShieldCheck, Cpu, Lock, Github, PlusCircle } from 'lucide-react';

interface LandingViewProps {
  onSelectTool: (id: string) => void;
  favorites: string[];
  onToggleFavorite: (id: string) => void;
  selectedCategory: ToolCategory;
  onSelectCategory: (category: ToolCategory) => void;
}

export const LandingView: React.FC<LandingViewProps> = ({
  onSelectTool,
  favorites,
  onToggleFavorite,
  selectedCategory,
  onSelectCategory,
}) => {
  const [searchQuery, setSearchQuery] = useState<string>('');

  const tools = searchTools(searchQuery, selectedCategory);

  const categories: { id: ToolCategory; label: string }[] = [
    { id: 'all', label: 'All Utilities' },
    { id: 'json', label: 'JSON Suite' },
    { id: 'regex', label: 'Regex Tester' },
    { id: 'git', label: 'Git & Config' },
    { id: 'documentation', label: 'Documentation' },
  ];

  return (
    <div className="max-w-6xl mx-auto space-y-8 pb-12">
      {/* Hero / Intro Header */}
      <div className="border-b border-ide-border-light dark:border-ide-border pb-6 pt-2">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <span className="text-xs font-mono font-medium px-2 py-0.5 rounded bg-sky-500/10 text-sky-600 dark:text-sky-400 border border-sky-500/20">
                Open Source Developer Toolkit
              </span>
              <span className="text-xs font-mono text-ide-text-muted">MIT Licensed</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-ide-text-light dark:text-ide-text">
              DevKit Forge
            </h1>
            <p className="text-xs sm:text-sm text-ide-text-mutedLight dark:text-ide-text-muted mt-1 max-w-2xl">
              High-performance, private, client-side developer utilities designed with a native desktop IDE aesthetic. Zero server transfers, zero telemetry.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <a
              href="https://github.com/impreseo/devkit-forge"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded border border-ide-border-light dark:border-ide-border bg-ide-panel-light dark:bg-ide-panel text-ide-text-light dark:text-ide-text hover:border-sky-500 text-xs font-medium transition-colors"
            >
              <Github className="w-3.5 h-3.5" />
              <span>Contribute on GitHub</span>
            </a>
          </div>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="space-y-3">
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
          {/* Search Input */}
          <div className="flex-1 flex items-center gap-2 px-3 py-2 rounded border border-ide-border-light dark:border-ide-border bg-ide-surface-light dark:bg-ide-surface focus-within:border-sky-500 text-xs">
            <Search className="w-4 h-4 text-ide-text-muted shrink-0" />
            <input
              aria-label="Filter developer tools"
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search tools by title, function, or keywords (e.g., json, diff, regex, gitignore, markdown)..."
              className="flex-1 bg-transparent text-ide-text-light dark:text-ide-text focus:outline-none placeholder-ide-text-muted"
            />
            {searchQuery && (
              <button
                type="button"
                onClick={() => setSearchQuery('')}
                className="text-ide-text-muted hover:text-ide-text-light dark:hover:text-ide-text text-xs"
              >
                Clear
              </button>
            )}
          </div>

          {/* Category Tabs */}
          <div className="flex flex-wrap items-center gap-1">
            {categories.map((cat) => (
              <button
                key={cat.id}
                type="button"
                onClick={() => onSelectCategory(cat.id)}
                className={`px-3 py-1.5 rounded text-xs font-medium transition-colors ${
                  selectedCategory === cat.id
                    ? 'bg-sky-500 text-white shadow-xs'
                    : 'bg-ide-panel-light dark:bg-ide-panel border border-ide-border-light dark:border-ide-border text-ide-text-muted hover:text-ide-text-light dark:hover:text-ide-text'
                }`}
              >
                {cat.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Tool Cards Grid */}
      <div>
        <div className="flex items-center justify-between mb-3 text-xs text-ide-text-muted">
          <span className="font-medium text-ide-text-light dark:text-ide-text">
            Available Tools ({tools.length})
          </span>
          <span>Click any card to launch workspace</span>
        </div>

        {tools.length === 0 ? (
          <div className="p-12 text-center rounded border border-ide-border-light dark:border-ide-border bg-ide-surface-light dark:bg-ide-surface space-y-2">
            <p className="text-sm font-semibold text-ide-text-light dark:text-ide-text">
              No tools matching &quot;{searchQuery}&quot;
            </p>
            <p className="text-xs text-ide-text-muted">
              Try adjusting your search terms or selecting another category above.
            </p>
            <button
              type="button"
              onClick={() => {
                setSearchQuery('');
                onSelectCategory('all');
              }}
              className="mt-3 px-3 py-1.5 rounded bg-sky-600 hover:bg-sky-500 text-white text-xs font-medium"
            >
              Reset Filters
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
            {tools.map((tool) => {
              const Icon = tool.icon;
              const isFav = favorites.includes(tool.id);

              return (
                <div
                  key={tool.id}
                  onClick={() => onSelectTool(tool.id)}
                  className="group relative rounded border border-ide-border-light dark:border-ide-border bg-ide-surface-light dark:bg-ide-surface p-4 hover:border-sky-500/70 transition-all cursor-pointer flex flex-col justify-between"
                >
                  <div>
                    {/* Top row: Icon, Category Pill, Favorite Star */}
                    <div className="flex items-start justify-between gap-2 mb-3">
                      <div className="w-8 h-8 rounded bg-ide-panel-light dark:bg-ide-panel border border-ide-border-light dark:border-ide-border flex items-center justify-center text-sky-500 group-hover:scale-105 transition-transform">
                        <Icon className="w-4 h-4" />
                      </div>

                      <div className="flex items-center gap-1.5">
                        <span className="text-[10px] font-mono uppercase px-1.5 py-0.5 rounded bg-ide-panel-light dark:bg-ide-panel text-ide-text-muted border border-ide-border-light dark:border-ide-border">
                          {tool.category}
                        </span>
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            onToggleFavorite(tool.id);
                          }}
                          className={`p-1 rounded hover:bg-ide-panel-light dark:hover:bg-ide-panel text-ide-text-muted transition-colors ${
                            isFav ? 'text-amber-500 fill-amber-500' : 'hover:text-amber-500'
                          }`}
                          title={isFav ? 'Remove from favorites' : 'Add to favorites'}
                        >
                          <Star className={`w-3.5 h-3.5 ${isFav ? 'fill-amber-500' : ''}`} />
                        </button>
                      </div>
                    </div>

                    {/* Title & Description */}
                    <h3 className="text-sm font-semibold text-ide-text-light dark:text-ide-text group-hover:text-sky-500 transition-colors">
                      {tool.title}
                    </h3>
                    <p className="text-xs text-ide-text-mutedLight dark:text-ide-text-muted mt-1 leading-relaxed">
                      {tool.shortDescription}
                    </p>
                  </div>

                  {/* Bottom: Tags & Open prompt */}
                  <div className="mt-4 pt-3 border-t border-ide-border-light/50 dark:border-ide-border/50 flex items-center justify-between text-[11px]">
                    <div className="flex flex-wrap gap-1 max-w-[70%]">
                      {tool.tags.slice(0, 3).map((tag) => (
                        <span
                          key={tag}
                          className="font-mono text-[10px] px-1.5 py-0.2 rounded bg-ide-panel-light dark:bg-ide-panel text-ide-text-muted"
                        >
                          #{tag}
                        </span>
                      ))}
                    </div>

                    <span className="flex items-center gap-1 font-medium text-sky-600 dark:text-sky-400 group-hover:translate-x-0.5 transition-transform">
                      <span>Launch</span>
                      <ArrowRight className="w-3 h-3" />
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Architecture & Privacy Core Guarantees */}
      <div className="pt-6 border-t border-ide-border-light dark:border-ide-border">
        <h2 className="text-sm font-semibold text-ide-text-light dark:text-ide-text mb-3">
          Architecture & Privacy Principles
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <div className="p-3.5 rounded border border-ide-border-light dark:border-ide-border bg-ide-surface-light dark:bg-ide-surface space-y-1.5">
            <div className="flex items-center gap-2 text-sky-500 text-xs font-semibold">
              <ShieldCheck className="w-4 h-4" />
              <span>100% In-Browser Execution</span>
            </div>
            <p className="text-xs text-ide-text-muted leading-relaxed">
              Every JSON parse, regex match, template compilation, and markdown render runs directly inside the client JavaScript runtime. No cloud API or server-side relay exists.
            </p>
          </div>

          <div className="p-3.5 rounded border border-ide-border-light dark:border-ide-border bg-ide-surface-light dark:bg-ide-surface space-y-1.5">
            <div className="flex items-center gap-2 text-emerald-500 text-xs font-semibold">
              <Lock className="w-4 h-4" />
              <span>Zero Tracking & Storage Safety</span>
            </div>
            <p className="text-xs text-ide-text-muted leading-relaxed">
              No cookies, analytics tokens, or third-party pixels. User preferences (favorites and theme) persist exclusively within your browser’s localStorage.
            </p>
          </div>

          <div className="p-3.5 rounded border border-ide-border-light dark:border-ide-border bg-ide-surface-light dark:bg-ide-surface space-y-1.5">
            <div className="flex items-center gap-2 text-amber-500 text-xs font-semibold">
              <Cpu className="w-4 h-4" />
              <span>Modular Contributor Registry</span>
            </div>
            <p className="text-xs text-ide-text-muted leading-relaxed">
              Adding a new utility requires only creating a React component and registering it with stable metadata in the tool registry. Automated tests ensure zero regressions.
            </p>
          </div>
        </div>
      </div>

      {/* Contributor Quickstart Banner */}
      <div className="p-4 rounded border border-ide-border-light dark:border-ide-border bg-ide-panel-light dark:bg-ide-panel flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-xs">
        <div className="flex items-start gap-3">
          <div className="p-2 rounded bg-sky-500/10 text-sky-500 shrink-0">
            <PlusCircle className="w-4 h-4" />
          </div>
          <div>
            <span className="font-semibold text-ide-text-light dark:text-ide-text block">
              Want to contribute a new utility?
            </span>
            <span className="text-ide-text-muted">
              Check out <code className="font-mono text-[11px] bg-ide-surface-light dark:bg-ide-surface px-1 py-0.5 rounded border border-ide-border-light dark:border-ide-border">CONTRIBUTING.md</code> and register your tool in <code className="font-mono text-[11px] bg-ide-surface-light dark:bg-ide-surface px-1 py-0.5 rounded border border-ide-border-light dark:border-ide-border">src/registry/tools.ts</code>.
            </span>
          </div>
        </div>
        <a
          href="https://github.com/impreseo/devkit-forge/blob/main/CONTRIBUTING.md"
          target="_blank"
          rel="noopener noreferrer"
          className="px-3 py-1.5 rounded bg-sky-600 hover:bg-sky-500 text-white font-medium shrink-0 transition-colors"
        >
          View Guide
        </a>
      </div>
    </div>
  );
};
