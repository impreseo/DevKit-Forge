import { afterEach, describe, expect, it } from 'vitest';
import {
  getStoredFavorites,
  getStoredRecentTools,
  recordRecentTool,
} from '../utils/storage';

afterEach(() => {
  localStorage.clear();
});

describe('Local preference storage', () => {
  it('falls back safely when saved favorites are not an array', () => {
    localStorage.setItem('devkit_forge_favorites', '{"unexpected":true}');
    expect(getStoredFavorites()).toEqual(['json-formatter', 'regex-tester']);
  });

  it('filters invalid favorite entries', () => {
    localStorage.setItem('devkit_forge_favorites', '["json-formatter",null,4,"regex-tester"]');
    expect(getStoredFavorites()).toEqual(['json-formatter', 'regex-tester']);
  });

  it('limits and filters recent tool history', () => {
    localStorage.setItem('devkit_forge_recents', JSON.stringify(['a', 4, 'b', null, 'c', 'd', 'e', 'f', 'g', 'h']));
    expect(getStoredRecentTools()).toEqual(['a', 'b', 'c', 'd', 'e', 'f', 'g', 'h']);
  });

  it('records a tool once at the front of recent history', () => {
    localStorage.setItem('devkit_forge_recents', JSON.stringify(['json-formatter', 'regex-tester']));
    expect(recordRecentTool('regex-tester')).toEqual(['regex-tester', 'json-formatter']);
  });
});
