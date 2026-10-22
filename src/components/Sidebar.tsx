import React from 'react';
import { TOOL_REGISTRY } from '../registry/tools';
import { ToolCategory } from '../types';
import { Star, Clock, Home, Layers, Sparkles } from 'lucide-react';

interface SidebarProps {
  activeToolId: string | null;
  onSelectTool: (id: string | null) => void;
  favorites: string[];
  onToggleFavorite: (id: string) => void;
  recentToolIds: string[];
  selectedCategory: ToolCategory;
  onSelectCategory: (category: ToolCategory) => void;
  isOpenMobile: boolean;
  onCloseMobile: () => void;
}

const CATEGORIES: { id: ToolCategory; label: string }[] = [
  { id: 'all', label: 'All Utilities' },
  { id: 'json', label: 'JSON Suite' },
  { id: 'regex', label: 'Regex Tester' },
  { id: 'git', label: 'Git & Config' },
  { id: 'documentation', label: 'Documentation' },
];

export const Sidebar: React.FC<SidebarProps> = ({
  activeToolId,
  onSelectTool,
  favorites,
  onToggleFavorite,
  recentToolIds,
  selectedCategory,
  onSelectCategory,
  isOpenMobile,
  onCloseMobile,
}) => {
  const favoriteTools = TOOL_REGISTRY.filter((t) => favorites.includes(t.id));
  const recentTools = recentToolIds
    .map((id) => TOOL_REGISTRY.find((t) => t.id === id))
    .filter((t): t is typeof TOOL_REGISTRY[0] => t !== undefined);

  const filteredTools = TOOL_REGISTRY.filter((tool) => {
    if (selectedCategory === 'all') return true;
    return tool.category === selectedCategory;
  });

  return (
    <>
      {/* Mobile Backdrop */}
      {isOpenMobile && (
        <div
          className="fixed inset-0 bg-black/50 z-30 lg:hidden backdrop-blur-xs"
          onClick={onCloseMobile}
        />
      )}

      {/* Sidebar Container */}
      <aside
        className={`fixed lg:static top-12 bottom-0 left-0 z-40 w-64 border-r border-ide-border-light dark:border-ide-border bg-ide-surface-light dark:bg-ide-surface flex flex-col transition-transform duration-200 select-none ${
          isOpenMobile ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
        }`}
      >
        {/* Navigation Top: Dashboard Landing link */}
        <div className="p-2 border-b border-ide-border-light dark:border-ide-border">
          <button
            type="button"
            onClick={() => {
              onSelectTool(null);
              onCloseMobile();
            }}
            className={`w-full flex items-center gap-2 px-2.5 py-1.5 rounded text-xs transition-colors ${
              activeToolId === null
                ? 'bg-sky-500/15 text-sky-600 dark:text-sky-400 font-medium'
                : 'text-ide-text-light dark:text-ide-text hover:bg-ide-panel-light dark:hover:bg-ide-panel'
            }`}
          >
            <Home className="w-3.5 h-3.5 text-sky-500" />
            <span>Workspace Overview</span>
          </button>
        </div>

        {/* Scrollable Navigation Sections */}
        <div className="flex-1 overflow-y-auto p-2 space-y-4">
          {/* Favorites Section */}
          {favoriteTools.length > 0 && (
            <div>
              <div className="flex items-center gap-1.5 px-2 py-1 text-[11px] font-semibold text-ide-text-mutedLight dark:text-ide-text-muted tracking-wide uppercase">
                <Star className="w-3 h-3 text-amber-500 fill-amber-500" />
                <span>Pinned Favorites</span>
              </div>
              <div className="mt-1 space-y-0.5">
                {favoriteTools.map((tool) => {
                  const Icon = tool.icon;
                  const isActive = activeToolId === tool.id;
                  return (
                    <div
                      key={tool.id}
                      className={`group flex items-center justify-between px-2 py-1.5 rounded text-xs cursor-pointer transition-colors ${
                        isActive
                          ? 'bg-sky-500/15 text-sky-600 dark:text-sky-400 font-medium'
                          : 'text-ide-text-light dark:text-ide-text hover:bg-ide-panel-light dark:hover:bg-ide-panel'
                      }`}
                      onClick={() => {
                        onSelectTool(tool.id);
                        onCloseMobile();
                      }}
                    >
                      <div className="flex items-center gap-2 min-w-0">
                        <Icon className="w-3.5 h-3.5 text-sky-500 shrink-0" />
                        <span className="truncate">{tool.title}</span>
                      </div>
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          onToggleFavorite(tool.id);
                        }}
                        className="opacity-0 group-hover:opacity-100 text-amber-500 hover:text-amber-400 transition-opacity"
                        title="Unpin favorite"
                        aria-label={`Unpin ${tool.title} from favorites`}
                      >
                        <Star className="w-3 h-3 fill-amber-500" />
                      </button>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* Category Filter Section */}
          <div>
            <div className="flex items-center gap-1.5 px-2 py-1 text-[11px] font-semibold text-ide-text-mutedLight dark:text-ide-text-muted tracking-wide uppercase">
              <Layers className="w-3 h-3 text-sky-500" />
              <span>Categories</span>
            </div>
            <div className="mt-1 space-y-0.5">
              {CATEGORIES.map((cat) => (
                <button
                  key={cat.id}
                  type="button"
                  onClick={() => onSelectCategory(cat.id)}
                  className={`w-full flex items-center justify-between px-2 py-1.5 rounded text-xs transition-colors ${
                    selectedCategory === cat.id
                      ? 'bg-ide-panel-light dark:bg-ide-panel text-sky-600 dark:text-sky-400 font-medium border border-ide-border-light dark:border-ide-border'
                      : 'text-ide-text-muted hover:text-ide-text-light dark:hover:text-ide-text hover:bg-slate-500/5'
                  }`}
                >
                  <span>{cat.label}</span>
                  <span className="font-mono text-[10px] opacity-75">
                    {cat.id === 'all'
                      ? TOOL_REGISTRY.length
                      : TOOL_REGISTRY.filter((t) => t.category === cat.id).length}
                  </span>
                </button>
              ))}
            </div>
          </div>

          {/* Tools List for Selected Category */}
          <div>
            <div className="flex items-center gap-1.5 px-2 py-1 text-[11px] font-semibold text-ide-text-mutedLight dark:text-ide-text-muted tracking-wide uppercase">
              <Sparkles className="w-3 h-3 text-sky-500" />
              <span>Available Tools</span>
            </div>
            <div className="mt-1 space-y-0.5">
              {filteredTools.map((tool) => {
                const Icon = tool.icon;
                const isActive = activeToolId === tool.id;
                const isFav = favorites.includes(tool.id);
                return (
                  <div
                    key={tool.id}
                    className={`group flex items-center justify-between px-2 py-1.5 rounded text-xs cursor-pointer transition-colors ${
                      isActive
                        ? 'bg-sky-500/15 text-sky-600 dark:text-sky-400 font-medium'
                        : 'text-ide-text-light dark:text-ide-text hover:bg-ide-panel-light dark:hover:bg-ide-panel'
                    }`}
                    onClick={() => {
                      onSelectTool(tool.id);
                      onCloseMobile();
                    }}
                  >
                    <div className="flex items-center gap-2 min-w-0">
                      <Icon className="w-3.5 h-3.5 text-sky-500 shrink-0" />
                      <span className="truncate">{tool.title}</span>
                    </div>
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        onToggleFavorite(tool.id);
                      }}
                      className={`text-ide-text-muted hover:text-amber-500 transition-colors ${
                        isFav ? 'opacity-100 text-amber-500' : 'opacity-0 group-hover:opacity-100'
                      }`}
                      title={isFav ? 'Remove from favorites' : 'Pin to favorites'}
                      aria-label={isFav ? `Remove ${tool.title} from favorites` : `Pin ${tool.title} to favorites`}
                    >
                      <Star className={`w-3 h-3 ${isFav ? 'fill-amber-500' : ''}`} />
                    </button>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Recently Used Section */}
          {recentTools.length > 0 && (
            <div>
              <div className="flex items-center gap-1.5 px-2 py-1 text-[11px] font-semibold text-ide-text-mutedLight dark:text-ide-text-muted tracking-wide uppercase">
                <Clock className="w-3 h-3 text-sky-500" />
                <span>Recently Used</span>
              </div>
              <div className="mt-1 space-y-0.5">
                {recentTools.slice(0, 5).map((tool) => {
                  const Icon = tool.icon;
                  const isActive = activeToolId === tool.id;
                  return (
                    <button
                      key={tool.id}
                      type="button"
                      onClick={() => {
                        onSelectTool(tool.id);
                        onCloseMobile();
                      }}
                      className={`w-full flex items-center gap-2 px-2 py-1 rounded text-xs transition-colors truncate ${
                        isActive
                          ? 'text-sky-500 font-medium'
                          : 'text-ide-text-muted hover:text-ide-text-light dark:hover:text-ide-text hover:bg-slate-500/5'
                      }`}
                    >
                      <Icon className="w-3 h-3 shrink-0" />
                      <span className="truncate text-[11px]">{tool.title}</span>
                    </button>
                  );
                })}
              </div>
            </div>
          )}
        </div>

        {/* Sidebar Footer: Privacy Guarantee Reminder */}
        <div className="p-3 border-t border-ide-border-light dark:border-ide-border bg-ide-panel-light dark:bg-ide-panel text-[11px] text-ide-text-muted leading-tight">
          <p className="font-semibold text-ide-text-light dark:text-ide-text flex items-center gap-1">
            <span>Client-Side Sandbox</span>
          </p>
          <p className="mt-1 text-[10px] opacity-80">
            No input leaves your browser memory. Inspect network tab to verify zero telemetry.
          </p>
        </div>
      </aside>
    </>
  );
};
