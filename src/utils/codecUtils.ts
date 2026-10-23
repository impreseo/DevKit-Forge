/**
 * Pure client-side codec utilities for Base64, URL encoding, and Hex conversion.
 * Fully UTF-8 compliant (safely handles emojis, non-Latin characters, and multi-byte code points).
 */

/**
 * UTF-8 safe Base64 encoding.
 * Standard window.btoa fails on Unicode characters > 0xFF.
 */
export function encodeBase64(input: string): { output: string; error?: string } {
  if (!input) return { output: '' };
  try {
    const bytes = new TextEncoder().encode(input);
    let binary = '';
    const len = bytes.byteLength;
    for (let i = 0; i < len; i++) {
      binary += String.fromCharCode(bytes[i]);
    }
    return { output: btoa(binary) };
  } catch (err) {
    return {
      output: '',
      error: `Base64 encode failed: ${err instanceof Error ? err.message : String(err)}`,
    };
  }
}

/**
 * UTF-8 safe Base64 decoding.
 * Standard window.atob fails to produce correct Unicode characters > 0xFF.
 */
export function decodeBase64(input: string): { output: string; error?: string } {
  if (!input || !input.trim()) return { output: '' };
  const cleanInput = input.trim().replace(/\s+/g, '');
  try {
    const binary = atob(cleanInput);
    const bytes = new Uint8Array(binary.length);
    for (let i = 0; i < binary.length; i++) {
      bytes[i] = binary.charCodeAt(i);
    }
    const decoded = new TextDecoder().decode(bytes);
    return { output: decoded };
  } catch (err) {
    return {
      output: '',
      error: `Invalid Base64 string: ${err instanceof Error ? err.message : String(err)}`,
    };
  }
}

/**
 * URL Component encoding (encodes all special characters including /, ?, =, &, #).
 */
export function encodeUrl(input: string): { output: string; error?: string } {
  if (!input) return { output: '' };
  try {
    return { output: encodeURIComponent(input) };
  } catch (err) {
    return {
      output: '',
      error: `URL encode failed: ${err instanceof Error ? err.message : String(err)}`,
    };
  }
}

/**
 * URL Component decoding.
 */
export function decodeUrl(input: string): { output: string; error?: string } {
  if (!input) return { output: '' };
  try {
    return { output: decodeURIComponent(input) };
  } catch (err) {
    return {
      output: '',
      error: `Malformed URL sequence: ${err instanceof Error ? err.message : String(err)}`,
    };
  }
}

/**
 * Text to Hexadecimal string representation.
 */
export function textToHex(input: string): { output: string; error?: string } {
  if (!input) return { output: '' };
  try {
    const bytes = new TextEncoder().encode(input);
    const hex = Array.from(bytes)
      .map((b) => b.toString(16).padStart(2, '0'))
      .join(' ');
    return { output: hex };
  } catch (err) {
    return {
      output: '',
      error: `Hex conversion failed: ${err instanceof Error ? err.message : String(err)}`,
    };
  }
}

/**
 * Hexadecimal string representation to Text.
 */
export function hexToText(input: string): { output: string; error?: string } {
  if (!input || !input.trim()) return { output: '' };
  try {
    const cleanHex = input.replace(/[\s,:-]/g, '');
    if (!cleanHex) return { output: '' };
    if (cleanHex.length % 2 !== 0) {
      return { output: '', error: 'Hex string must contain an even number of characters.' };
    }
    if (!/^[0-9a-fA-F]+$/.test(cleanHex)) {
      return { output: '', error: 'Hex string contains invalid non-hexadecimal characters.' };
    }
    const bytes = new Uint8Array(cleanHex.length / 2);
    for (let i = 0; i < cleanHex.length; i += 2) {
      const byteVal = parseInt(cleanHex.substring(i, i + 2), 16);
      bytes[i / 2] = byteVal;
    }
    return { output: new TextDecoder().decode(bytes) };
  } catch (err) {
    return {
      output: '',
      error: `Hex decode failed: ${err instanceof Error ? err.message : String(err)}`,
    };
  }
}

/**
 * Calculate the UTF-8 byte length of a string.
 */
export function calculateUtf8ByteLength(input: string): number {
  if (!input) return 0;
  return new TextEncoder().encode(input).length;
}

export const encodeUrlComponent = encodeUrl;
export const decodeUrlComponent = decodeUrl;
