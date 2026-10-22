import { describe, it, expect } from 'vitest';
import {
  formatJson,
  minifyJson,
  validateJson,
  compareJson,
  sortObjectKeys,
  isLargeJson,
  hasUnsafeInteger,
  LARGE_JSON_SIZE_THRESHOLD_BYTES,
} from '../utils/jsonUtils';

describe('JSON Utilities', () => {
  describe('formatJson', () => {
    it('formats JSON with 2-space indentation by default', () => {
      const input = '{"b":2,"a":1}';
      const result = formatJson(input, 2);
      expect(result.error).toBeUndefined();
      expect(result.output).toBe('{\n  "b": 2,\n  "a": 1\n}');
    });

    it('formats JSON with 4-space indentation', () => {
      const input = '{"key":"val"}';
      const result = formatJson(input, 4);
      expect(result.output).toBe('{\n    "key": "val"\n}');
    });

    it('formats JSON with tab indentation', () => {
      const input = '{"key":"val"}';
      const result = formatJson(input, 'tab');
      expect(result.output).toBe('{\n\t"key": "val"\n}');
    });

    it('sorts keys alphabetically when requested', () => {
      const input = '{"z": 1, "a": 2, "m": {"y": 10, "b": 20}}';
      const result = formatJson(input, 2, true);
      expect(result.error).toBeUndefined();
      expect(result.output).toBe(
        '{\n  "a": 2,\n  "m": {\n    "b": 20,\n    "y": 10\n  },\n  "z": 1\n}'
      );
    });

    it('returns error on broken JSON input', () => {
      const broken = '{"a": 1,}';
      const result = formatJson(broken);
      expect(result.error).toBeDefined();
      expect(result.output).toBe('');
    });

    it('handles empty input gracefully', () => {
      const result = formatJson('');
      expect(result.error).toBe('Input cannot be empty');
      expect(result.output).toBe('');
    });
  });

  describe('minifyJson', () => {
    it('removes whitespace and returns single-line minified JSON', () => {
      const verbose = '{\n  "name": "DevKit",\n  "tools": [1, 2, 3]\n}';
      const result = minifyJson(verbose);
      expect(result.error).toBeUndefined();
      expect(result.output).toBe('{"name":"DevKit","tools":[1,2,3]}');
      expect(result.minifiedBytes).toBeLessThan(result.originalBytes);
      expect(result.savedBytes).toBeGreaterThan(0);
      expect(result.compressionPercent).toBeGreaterThan(0);
    });

    it('handles syntax errors during minification', () => {
      const broken = '{invalid}';
      const result = minifyJson(broken);
      expect(result.error).toBeDefined();
      expect(result.output).toBe('');
    });
  });

  describe('validateJson', () => {
    it('successfully validates standard JSON and returns stats', () => {
      const sample = '{"title":"DevKit","meta":{"stars":100},"items":["a","b"]}';
      const result = validateJson(sample);
      expect(result.isValid).toBe(true);
      expect(result.error).toBeUndefined();
      expect(result.stats).toBeDefined();
      expect(result.stats?.type).toBe('object');
      expect(result.stats?.depth).toBe(2);
      expect(result.stats?.keyCount).toBe(4);
    });

    it('detects syntax error and constructs line and pointer snippet', () => {
      const invalid = '{\n  "key": 123,\n  "bad":\n}';
      const result = validateJson(invalid);
      expect(result.isValid).toBe(false);
      expect(result.error).toBeDefined();
    });

    it('rejects empty input', () => {
      const result = validateJson('   ');
      expect(result.isValid).toBe(false);
      expect(result.error).toContain('empty');
    });

    it('handles large flat arrays without argument-stack overflow', () => {
      const result = validateJson(`[${Array.from({ length: 30_000 }, () => '1').join(',')}]`);
      expect(result.isValid).toBe(true);
      expect(result.stats?.depth).toBe(1);
    });
  });

  describe('compareJson', () => {
    it('identifies identical structures as unchanged', () => {
      const a = '{"a": 1, "b": [1, 2]}';
      const b = '{"a": 1, "b": [1, 2]}';
      const result = compareJson(a, b);
      expect(result.hasDiffs).toBe(false);
      expect(result.leftError).toBeUndefined();
      expect(result.rightError).toBeUndefined();
    });

    it('captures added, removed, and modified paths', () => {
      const left = '{"shared": 1, "oldKey": "gone", "modified": 100}';
      const right = '{"shared": 1, "newKey": "here", "modified": 200}';
      const result = compareJson(left, right);
      expect(result.hasDiffs).toBe(true);

      const added = result.diffs.find((d) => d.type === 'added');
      const removed = result.diffs.find((d) => d.type === 'removed');
      const modified = result.diffs.find((d) => d.type === 'modified');

      expect(added?.path).toBe('newKey');
      expect(added?.newValue).toBe('here');

      expect(removed?.path).toBe('oldKey');
      expect(removed?.oldValue).toBe('gone');

      expect(modified?.path).toBe('modified');
      expect(modified?.oldValue).toBe(100);
      expect(modified?.newValue).toBe(200);
    });

    it('returns error if either input has syntax error', () => {
      const result = compareJson('{broken', '{"ok": true}');
      expect(result.leftError).toBeDefined();
      expect(result.hasDiffs).toBe(false);
    });

    it('compares prototype-named JSON keys as own data properties', () => {
      const result = compareJson('{"constructor":1,"toString":2}', '{"constructor":3,"toString":2}');
      expect(result.hasDiffs).toBe(true);
      expect(result.diffs.some((diff) => diff.path === 'constructor' && diff.type === 'modified')).toBe(true);
    });

    it('compares deeply nested objects without recursive call-stack overflow', () => {
      const depth = 1_500;
      const left = `${'{"a":'.repeat(depth)}0${'}'.repeat(depth)}`;
      const right = `${'{"a":'.repeat(depth)}1${'}'.repeat(depth)}`;
      const result = compareJson(left, right);
      expect(result.hasDiffs).toBe(true);
      expect(result.diffs.some((diff) => diff.type === 'modified')).toBe(true);
    });
  });

  describe('sortObjectKeys', () => {
    it('sorts nested objects and array of objects', () => {
      const input = {
        z: 1,
        a: [{ y: 2, x: 1 }],
      };
      const sorted = sortObjectKeys(input) as Record<string, unknown>;
      expect(Object.keys(sorted)).toEqual(['a', 'z']);
      const nestedArr = sorted.a as Array<Record<string, unknown>>;
      expect(Object.keys(nestedArr[0])).toEqual(['x', 'y']);
    });

    it('preserves __proto__ as an ordinary JSON key', () => {
      const input = JSON.parse('{"z":1,"__proto__":{"safe":true}}');
      const sorted = sortObjectKeys(input) as Record<string, unknown>;
      expect(Object.prototype.hasOwnProperty.call(sorted, '__proto__')).toBe(true);
      expect(JSON.stringify(sorted)).toBe('{"__proto__":{"safe":true},"z":1}');
    });
  });

  describe('isLargeJson', () => {
    it('returns false for payloads under 5 MB threshold', () => {
      expect(isLargeJson('{"small": true}')).toBe(false);
      const under5Mb = 'a'.repeat(LARGE_JSON_SIZE_THRESHOLD_BYTES);
      expect(isLargeJson(under5Mb)).toBe(false);
    });

    it('returns true for payloads exceeding 5 MB threshold', () => {
      const over5Mb = 'a'.repeat(LARGE_JSON_SIZE_THRESHOLD_BYTES + 1);
      expect(isLargeJson(over5Mb)).toBe(true);
    });

    it('accurately measures multi-byte non-ASCII payloads in UTF-8 bytes', () => {
      // '€' is 3 bytes in UTF-8, but only 1 UTF-16 code unit (character)
      // 1,800,000 characters of '€' is ~1.8M chars, but 5.4M UTF-8 bytes (>5 MB)
      const multiByteOver5Mb = '€'.repeat(1_800_000);
      expect(multiByteOver5Mb.length).toBeLessThan(LARGE_JSON_SIZE_THRESHOLD_BYTES);
      expect(isLargeJson(multiByteOver5Mb)).toBe(true);

      // 1,000,000 characters of '€' is 3 MB UTF-8 bytes (<5 MB)
      const multiByteUnder5Mb = '€'.repeat(1_000_000);
      expect(isLargeJson(multiByteUnder5Mb)).toBe(false);
    });
  });

  describe('hasUnsafeInteger', () => {
    it('returns false for safe integers within JS precision limits', () => {
      expect(hasUnsafeInteger('{"id": 123456789, "count": 42}')).toBe(false);
      expect(hasUnsafeInteger(`{"maxSafe": ${Number.MAX_SAFE_INTEGER}}`)).toBe(false);
      expect(hasUnsafeInteger(`{"minSafe": ${Number.MIN_SAFE_INTEGER}}`)).toBe(false);
    });

    it('returns true for integers exceeding MAX_SAFE_INTEGER', () => {
      // 9007199254740992 is MAX_SAFE_INTEGER + 1 (16 digits)
      expect(hasUnsafeInteger('{"id": 9007199254740992}')).toBe(true);
      expect(hasUnsafeInteger('{"id": 9007199254740995}')).toBe(true);
      expect(hasUnsafeInteger('[9007199254740993, 100]')).toBe(true);
      expect(hasUnsafeInteger('[9007199254740991, 9007199254740995]')).toBe(true);
    });

    it('returns true for negative integers beyond MIN_SAFE_INTEGER', () => {
      // -9007199254740992 is MIN_SAFE_INTEGER - 1
      expect(hasUnsafeInteger('{"id": -9007199254740992}')).toBe(true);
      expect(hasUnsafeInteger('{"id": -9007199254740995}')).toBe(true);
      expect(hasUnsafeInteger('[-9007199254740995, -100]')).toBe(true);
    });

    it('ignores large numeric values that are inside string literals', () => {
      expect(hasUnsafeInteger('{"snowflake": "9007199254740995"}')).toBe(false);
      expect(hasUnsafeInteger('{"creditCard": "1234567890123456"}')).toBe(false);
      // Handles escaped quotes inside string literals
      expect(hasUnsafeInteger('{"text": "Escaped \\"9007199254740995\\" in string"}')).toBe(false);
      // Handles escaped backslashes before closing quote
      expect(hasUnsafeInteger('{"path": "C:\\\\folder\\\\", "id": 123}')).toBe(false);
    });

    it('does not flag floating point fractions or exponential numbers as unsafe integers', () => {
      // Fractional part should not match as an integer
      expect(hasUnsafeInteger('{"float": 1.9007199254740995}')).toBe(false);
      expect(hasUnsafeInteger('{"float": -0.9007199254740995}')).toBe(false);
      expect(hasUnsafeInteger('{"float": 9007199254740995.123}')).toBe(false);
      // Exponents should not be flagged as unsafe integer literals
      expect(hasUnsafeInteger('{"exp": 9007199254740995e2}')).toBe(false);
      expect(hasUnsafeInteger('{"exp": 1e9007199254740995}')).toBe(false);
      expect(hasUnsafeInteger('{"exp": 1e+9007199254740995}')).toBe(false);
      expect(hasUnsafeInteger('{"exp": 1e-9007199254740995}')).toBe(false);
    });
  });
});
