const FAVORITES_KEY = 'devkit_forge_favorites';
const RECENT_KEY = 'devkit_forge_recents';
const THEME_KEY = 'devkit_forge_theme';

export function getStoredFavorites(): string[] {
  try {
    const raw = localStorage.getItem(FAVORITES_KEY);
    if (!raw) return ['json-formatter', 'regex-tester'];
    const parsed: unknown = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed.filter((id): id is string => typeof id === 'string') : ['json-formatter', 'regex-tester'];
  } catch {
    return ['json-formatter', 'regex-tester'];
  }
}

export function saveStoredFavorites(ids: string[]): void {
  try {
    localStorage.setItem(FAVORITES_KEY, JSON.stringify(ids));
  } catch {
    // Graceful fallback for restricted storage environments
  }
}

export function getStoredRecentTools(): string[] {
  try {
    const raw = localStorage.getItem(RECENT_KEY);
    if (!raw) return ['json-formatter'];
    const parsed: unknown = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed.filter((id): id is string => typeof id === 'string').slice(0, 8) : ['json-formatter'];
  } catch {
    return ['json-formatter'];
  }
}

export function recordRecentTool(id: string): string[] {
  try {
    const recents = getStoredRecentTools().filter((item) => item !== id);
    const updated = [id, ...recents].slice(0, 8);
    localStorage.setItem(RECENT_KEY, JSON.stringify(updated));
    return updated;
  } catch {
    return [id];
  }
}

export type ThemeMode = 'dark' | 'light' | 'system';

export function getStoredTheme(): ThemeMode {
  try {
    const saved = localStorage.getItem(THEME_KEY) as ThemeMode | null;
    if (saved === 'dark' || saved === 'light' || saved === 'system') {
      return saved;
    }
    return 'dark'; // Default to sleek IDE dark theme
  } catch {
    return 'dark';
  }
}

export function saveStoredTheme(theme: ThemeMode): void {
  try {
    localStorage.setItem(THEME_KEY, theme);
  } catch {
    // Ignore
  }
}
