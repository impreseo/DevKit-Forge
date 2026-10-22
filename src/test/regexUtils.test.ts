import { describe, it, expect } from 'vitest';
import {
  executeRegex,
  diagnoseRegexError,
  buildHighlightSegments,
  COMMON_REGEX_PRESETS,
} from '../utils/regexUtils';

describe('Regex Utilities', () => {
  describe('executeRegex', () => {
    it('finds global matches with capture groups', () => {
      const pattern = '(\\w+)@(\\w+\\.\\w+)';
      const flags = 'g';
      const sample = 'Send to dev@team.io and ops@infra.net please';

      const result = executeRegex(pattern, flags, sample);
      expect(result.isValid).toBe(true);
      expect(result.matches.length).toBe(2);

      const first = result.matches[0];
      expect(first.fullMatch).toBe('dev@team.io');
      expect(first.groups.length).toBe(2);
      expect(first.groups[0].value).toBe('dev');
      expect(first.groups[1].value).toBe('team.io');
    });

    it('reports exact offsets for numbered and named capture groups', () => {
      const result = executeRegex('(?<word>cat)-(\\w+)', 'g', 'a cat-dog');
      expect(result.isValid).toBe(true);
      expect(result.matches).toHaveLength(1);
      expect(result.matches[0].groups).toEqual([
        { name: 'word', value: 'cat', start: 2, end: 5 },
        { name: 'Group #1', value: 'cat', start: 2, end: 5 },
        { name: 'Group #2', value: 'dog', start: 6, end: 9 },
      ]);
    });

    it('rejects oversized regex inputs before execution', () => {
      expect(executeRegex('a'.repeat(2_001), 'g', 'test').isValid).toBe(false);
      expect(executeRegex('a', 'g', 'x'.repeat(200_001)).isValid).toBe(false);
    });

    it('does not duplicate zero-width global matches', () => {
      const startAnchor = executeRegex('^', 'g', 'abc');
      expect(startAnchor.isValid).toBe(true);
      expect(startAnchor.matches.map((match) => match.index)).toEqual([0]);

      const lookahead = executeRegex('(?=a)', 'g', 'aba');
      expect(lookahead.isValid).toBe(true);
      expect(lookahead.matches.map((match) => match.index)).toEqual([0, 2]);
    });

    it('advances zero-width Unicode matches by code point', () => {
      const result = executeRegex('(?=.)', 'gu', '😀a');
      expect(result.isValid).toBe(true);
      expect(result.matches.map((match) => match.index)).toEqual([0, 2]);
    });

    it('handles non-global single match mode', () => {
      const pattern = '\\d+';
      const flags = '';
      const sample = 'Code 1024 and 2048';

      const result = executeRegex(pattern, flags, sample);
      expect(result.isValid).toBe(true);
      expect(result.matches.length).toBe(1);
      expect(result.matches[0].fullMatch).toBe('1024');
    });

    it('executes patterns using modern v (UnicodeSets) flag', () => {
      // Intersection notation supported only under v flag
      const result = executeRegex('[\\p{ASCII}&&\\p{Letter}]+', 'v', 'hello 123 WORLD');
      expect(result.isValid).toBe(true);
      expect(result.matches.length).toBe(1); // non-global
      expect(result.matches[0].fullMatch).toBe('hello');
    });

    it('rejects conflicting u and v flag combinations with clear diagnosis', () => {
      const result = executeRegex('abc', 'uv', 'abc');
      expect(result.isValid).toBe(false);
      expect(result.error).toContain('mutually exclusive');
    });

    it('safely catches syntax errors and provides friendly diagnostic', () => {
      const brokenPattern = '(unclosed group';
      const result = executeRegex(brokenPattern, 'g', 'sample text');
      expect(result.isValid).toBe(false);
      expect(result.error).toBeDefined();
      expect(result.matches.length).toBe(0);
    });

    it('safely handles empty pattern without throwing', () => {
      const result = executeRegex('', 'g', 'test string');
      expect(result.isValid).toBe(true);
      expect(result.matches.length).toBe(0);
    });
  });

  describe('diagnoseRegexError', () => {
    it('provides clear explanation for unmatched parenthesis', () => {
      const diagnosis = diagnoseRegexError('(foo', 'Unterminated group');
      expect(diagnosis).toContain('missing closing parenthesis');
    });

    it('provides clear explanation for unclosed bracket', () => {
      const diagnosis = diagnoseRegexError('[a-z', 'Unterminated character class');
      expect(diagnosis).toContain('character class');
    });

    it('explains mutual exclusivity when u and v flags are both passed', () => {
      const diagnosis = diagnoseRegexError('abc', 'Invalid flags supplied to RegExp constructor', 'uv');
      expect(diagnosis).toContain('mutually exclusive');
    });
  });

  describe('buildHighlightSegments', () => {
    it('does not duplicate text when highlighting zero-width matches', () => {
      const text = 'aba';
      const matches = [
        { fullMatch: '', index: 0, length: 0, groups: [] },
        { fullMatch: '', index: 2, length: 0, groups: [] },
      ];

      const segments = buildHighlightSegments(text, matches);
      expect(segments.map((segment) => segment.text).join('')).toBe(text);
    });

    it('splits text into alternating matching and non-matching segments', () => {
      const text = 'foo 123 bar';
      const matches = [
        {
          fullMatch: '123',
          index: 4,
          length: 3,
          groups: [],
        },
      ];

      const segments = buildHighlightSegments(text, matches);
      expect(segments.length).toBe(3);
      expect(segments[0]).toEqual({ text: 'foo ', isMatch: false });
      expect(segments[1]).toEqual({ text: '123', isMatch: true, matchIndex: 1 });
      expect(segments[2]).toEqual({ text: ' bar', isMatch: false });
    });
  });

  describe('COMMON_REGEX_PRESETS', () => {
    it('contains valid and functional regex presets', () => {
      expect(COMMON_REGEX_PRESETS.length).toBeGreaterThanOrEqual(5);

      for (const preset of COMMON_REGEX_PRESETS) {
        const test = executeRegex(preset.pattern, preset.flags, preset.sample);
        expect(test.isValid).toBe(true);
        expect(test.matches.length).toBeGreaterThan(0);
      }
    });
  });
});
