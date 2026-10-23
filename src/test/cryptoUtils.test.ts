import { describe, it, expect } from 'vitest';
import { generateUuids, computeHash } from '../utils/cryptoUtils';

describe('cryptoUtils', () => {
  describe('generateUuids', () => {
    it('generates standard UUID v4 matching RFC4122 format', () => {
      const [uuid] = generateUuids();
      expect(uuid).toMatch(
        /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i
      );
    });

    it('generates multiple unique UUIDs', () => {
      const uuids = generateUuids({ count: 5 });
      expect(uuids).toHaveLength(5);
      const unique = new Set(uuids);
      expect(unique.size).toBe(5);
    });

    it('supports uppercase formatting and removing hyphens', () => {
      const [upperWithoutHyphens] = generateUuids({ uppercase: true, hyphens: false });
      expect(upperWithoutHyphens).toHaveLength(32);
      expect(upperWithoutHyphens).toMatch(/^[0-9A-F]{32}$/);
    });
  });

  describe('computeHash', () => {
    it('computes known SHA-256 digest', async () => {
      // SHA-256 of "hello" is 2cf24dba5fb0a30e26e83b2ac5b9e29e1b161e5c1fa7425e73043362938b9824
      const result = await computeHash('hello', 'SHA-256');
      expect(result.error).toBeUndefined();
      expect(result.hash).toBe(
        '2cf24dba5fb0a30e26e83b2ac5b9e29e1b161e5c1fa7425e73043362938b9824'
      );
    });

    it('computes known SHA-1 digest', async () => {
      // SHA-1 of "hello" is aaf4c61ddcc5e8a2dabede0f3b482cd9aea9434d
      const result = await computeHash('hello', 'SHA-1');
      expect(result.error).toBeUndefined();
      expect(result.hash).toBe('aaf4c61ddcc5e8a2dabede0f3b482cd9aea9434d');
    });

    it('handles empty input gracefully', async () => {
      const result = await computeHash('', 'SHA-256');
      expect(result.hash).toBe('');
      expect(result.error).toBeUndefined();
    });
  });
});
