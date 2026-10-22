import React, { useState, useEffect } from 'react';
import { Header } from './components/Header';
import { Sidebar } from './components/Sidebar';
import { StatusBar } from './components/StatusBar';
import { CommandPalette } from './components/CommandPalette';
import { LandingView } from './components/LandingView';
import { getToolById } from './registry/tools';
import { ToolCategory } from './types';
import {
  getStoredFavorites,
  saveStoredFavorites,
  getStoredRecentTools,
  recordRecentTool,
  getStoredTheme,
  saveStoredTheme,
  ThemeMode,
} from './utils/storage';
import { ChevronRight, Home, Menu, Star } from 'lucide-react';

export const App: React.FC = () => {
  const [activeToolId, setActiveToolId] = useState<string | null>(null);
  const [favorites, setFavorites] = useState<string[]>(getStoredFavorites);
  const [recentToolIds, setRecentToolIds] = useState<string[]>(getStoredRecentTools);
  const [selectedCategory, setSelectedCategory] = useState<ToolCategory>('all');
  const [theme, setTheme] = useState<ThemeMode>(getStoredTheme);
  const [isCommandPaletteOpen, setIsCommandPaletteOpen] = useState<boolean>(false);
  const [isSidebarOpenMobile, setIsSidebarOpenMobile] = useState<boolean>(false);

  // Handle system vs explicit theme
  useEffect(() => {
    const root = document.documentElement;
    if (theme === 'dark') {
      root.classList.add('dark');
    } else if (theme === 'light') {
      root.classList.remove('dark');
    } else {
      // System
      const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
      if (prefersDark) {
        root.classList.add('dark');
      } else {
        root.classList.remove('dark');
      }
    }
    saveStoredTheme(theme);
  }, [theme]);

  // Global keyboard shortcuts (Ctrl+K or Cmd+K)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        setIsCommandPaletteOpen((prev) => !prev);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  const handleSelectTool = (id: string | null) => {
    setActiveToolId(id);
    if (id) {
      const updatedRecents = recordRecentTool(id);
      setRecentToolIds(updatedRecents);
    }
  };

  const handleToggleFavorite = (id: string) => {
    const updated = favorites.includes(id)
      ? favorites.filter((item) => item !== id)
      : [...favorites, id];
    setFavorites(updated);
    saveStoredFavorites(updated);
  };

  const activeTool = activeToolId ? getToolById(activeToolId) : null;
  const ActiveComponent = activeTool ? activeTool.component : null;
  const isFavorite = activeToolId ? favorites.includes(activeToolId) : false;

  return (
    <div className="min-h-screen flex flex-col bg-ide-bg-light dark:bg-ide-bg text-ide-text-light dark:text-ide-text font-sans antialiased selection:bg-sky-500/20 selection:text-sky-300">
      {/* Top Header */}
      <Header
        onOpenCommandPalette={() => setIsCommandPaletteOpen(true)}
        theme={theme}
        onThemeChange={setTheme}
        onNavigateLanding={() => setActiveToolId(null)}
        onToggleSidebar={() => setIsSidebarOpenMobile((prev) => !prev)}
      />

      {/* Main Workspace Body */}
      <div className="flex-1 flex overflow-hidden">
        {/* Left Sidebar */}
        <Sidebar
          activeToolId={activeToolId}
          onSelectTool={handleSelectTool}
          favorites={favorites}
          onToggleFavorite={handleToggleFavorite}
          recentToolIds={recentToolIds}
          selectedCategory={selectedCategory}
          onSelectCategory={setSelectedCategory}
          isOpenMobile={isSidebarOpenMobile}
          onCloseMobile={() => setIsSidebarOpenMobile(false)}
        />

        {/* Center Workspace Content Area */}
        <main className="flex-1 flex flex-col overflow-y-auto bg-ide-bg-light dark:bg-ide-bg p-3 sm:p-6">
          {/* Breadcrumbs & Mobile Menu bar */}
          <div className="flex items-center justify-between mb-4 pb-2 border-b border-ide-border-light/60 dark:border-ide-border/60 text-xs">
            <div className="flex items-center gap-1.5 text-ide-text-muted">
              {/* Mobile Sidebar Toggle Button */}
              <button
                type="button"
                onClick={() => setIsSidebarOpenMobile(true)}
                className="lg:hidden p-1 mr-1 rounded border border-ide-border-light dark:border-ide-border bg-ide-panel-light dark:bg-ide-panel text-ide-text-light dark:text-ide-text"
                title="Toggle Sidebar Navigation"
                aria-label="Toggle Sidebar Navigation"
              >
                <Menu className="w-4 h-4" />
              </button>

              <button
                type="button"
                onClick={() => setActiveToolId(null)}
                className="flex items-center gap-1 hover:text-ide-text-light dark:hover:text-ide-text transition-colors"
              >
                <Home className="w-3.5 h-3.5" />
                <span>Workspace</span>
              </button>

              {activeTool && (
                <>
                  <ChevronRight className="w-3.5 h-3.5 text-ide-border dark:text-ide-border" />
                  <span className="uppercase text-[10px] font-mono px-1.5 py-0.2 rounded bg-ide-panel-light dark:bg-ide-panel border border-ide-border-light dark:border-ide-border">
                    {activeTool.category}
                  </span>
                  <ChevronRight className="w-3.5 h-3.5 text-ide-border dark:text-ide-border" />
                  <span className="font-semibold text-ide-text-light dark:text-ide-text">
                    {activeTool.title}
                  </span>
                </>
              )}
            </div>

            {/* Favorite button if inside a tool */}
            {activeTool && (
              <button
                type="button"
                onClick={() => handleToggleFavorite(activeTool.id)}
                className={`flex items-center gap-1.5 px-2 py-0.5 rounded border text-xs transition-colors ${
                  isFavorite
                    ? 'border-amber-500/40 bg-amber-500/10 text-amber-500'
                    : 'border-ide-border-light dark:border-ide-border bg-ide-panel-light dark:bg-ide-panel text-ide-text-muted hover:text-ide-text-light dark:hover:text-ide-text'
                }`}
                title={isFavorite ? 'Unpin favorite' : 'Pin to favorites'}
              >
                <Star className={`w-3.5 h-3.5 ${isFavorite ? 'fill-amber-500' : ''}`} />
                <span>{isFavorite ? 'Pinned' : 'Pin'}</span>
              </button>
            )}
          </div>

          {/* Active View: Tool or Landing */}
          {ActiveComponent ? (
            <div className="flex-1">
              <ActiveComponent />
            </div>
          ) : (
            <LandingView
              onSelectTool={handleSelectTool}
              favorites={favorites}
              onToggleFavorite={handleToggleFavorite}
              selectedCategory={selectedCategory}
              onSelectCategory={setSelectedCategory}
            />
          )}
        </main>
      </div>

      {/* Bottom Status Bar */}
      <StatusBar
        activeToolId={activeToolId}
        onOpenCommandPalette={() => setIsCommandPaletteOpen(true)}
      />

      {/* Quick Search Command Palette Modal */}
      <CommandPalette
        isOpen={isCommandPaletteOpen}
        onClose={() => setIsCommandPaletteOpen(false)}
        onSelectTool={handleSelectTool}
      />
    </div>
  );
};
