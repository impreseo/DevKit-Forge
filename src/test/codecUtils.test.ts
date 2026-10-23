import { describe, it, expect } from 'vitest';
import {
  encodeBase64,
  decodeBase64,
  encodeUrl,
  decodeUrl,
  textToHex,
  hexToText,
} from '../utils/codecUtils';

describe('codecUtils', () => {
  describe('Base64 Encoding & Decoding', () => {
    it('handles standard ASCII strings', () => {
      const text = 'DevKit Forge v1.0.0';
      const encoded = encodeBase64(text);
      expect(encoded.error).toBeUndefined();
      expect(encoded.output).toBe('RGV2S2l0IEZvcmdlIHYxLjAuMA==');

      const decoded = decodeBase64(encoded.output);
      expect(decoded.error).toBeUndefined();
      expect(decoded.output).toBe(text);
    });

    it('safely handles non-ASCII and multi-byte UTF-8 characters (emojis, CJK, accents)', () => {
      const unicodeSample = 'Hello 🚀 世界 café ñ €';
      const encoded = encodeBase64(unicodeSample);
      expect(encoded.error).toBeUndefined();
      expect(encoded.output.length).toBeGreaterThan(0);

      const decoded = decodeBase64(encoded.output);
      expect(decoded.error).toBeUndefined();
      expect(decoded.output).toBe(unicodeSample);
    });

    it('handles empty input gracefully', () => {
      expect(encodeBase64('').output).toBe('');
      expect(decodeBase64('').output).toBe('');
    });

    it('returns an error for malformed Base64 input', () => {
      const invalid = decodeBase64('ThisIsNotValidBase64!!!');
      expect(invalid.error).toBeDefined();
      expect(invalid.output).toBe('');
    });
  });

  describe('URL Encoding & Decoding', () => {
    it('encodes and decodes URL components', () => {
      const raw = 'https://example.com/search?query=hello world&filter=dev+kit#top';
      const encoded = encodeUrl(raw);
      expect(encoded.output).toBe(
        'https%3A%2F%2Fexample.com%2Fsearch%3Fquery%3Dhello%20world%26filter%3Ddev%2Bkit%23top'
      );

      const decoded = decodeUrl(encoded.output);
      expect(decoded.output).toBe(raw);
    });

    it('handles malformed URL sequences gracefully', () => {
      const malformed = decodeUrl('%E0%A4%A');
      expect(malformed.error).toBeDefined();
      expect(malformed.output).toBe('');
    });
  });

  describe('Hexadecimal Conversion', () => {
    it('converts text to hex and back', () => {
      const text = 'DevKit';
      const hex = textToHex(text);
      expect(hex.output).toBe('44 65 76 4b 69 74');

      const back = hexToText(hex.output);
      expect(back.output).toBe('DevKit');
    });

    it('handles odd-length or invalid hex inputs', () => {
      expect(hexToText('abc').error).toContain('even number');
      expect(hexToText('1g').error).toContain('invalid non-hexadecimal characters');
      expect(hexToText('4z').error).toContain('invalid non-hexadecimal characters');
      expect(hexToText('zz xx').error).toContain('invalid non-hexadecimal characters');
      expect(hexToText('   ').output).toBe('');
      expect(hexToText('').output).toBe('');
    });

    it('round-trips multi-byte unicode through hex', () => {
      const emojiText = 'DevKit 🛠️ 🚀';
      const hex = textToHex(emojiText);
      const restored = hexToText(hex.output);
      expect(restored.error).toBeUndefined();
      expect(restored.output).toBe(emojiText);
    });
  });
});
