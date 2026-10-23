/**
 * Browser-native Cryptographic Hashing and UUID Generation.
 * Powered by standard Web Crypto APIs (crypto.subtle and crypto.randomUUID).
 * 100% Client-side with zero external packages.
 */

export type HashAlgorithm = 'SHA-256' | 'SHA-512' | 'SHA-384' | 'SHA-1';

export const HASH_ALGORITHMS: Record<HashAlgorithm, { bitLength: number; byteLength: number }> = {
  'SHA-256': { bitLength: 256, byteLength: 32 },
  'SHA-512': { bitLength: 512, byteLength: 64 },
  'SHA-384': { bitLength: 384, byteLength: 48 },
  'SHA-1': { bitLength: 160, byteLength: 20 },
};

export interface UuidOptions {
  count?: number;
  uppercase?: boolean;
  hyphens?: boolean;
}

/**
 * Generate cryptographically secure UUID v4 strings.
 */
export function generateUuids(
  countOrOptions: number | UuidOptions = {},
  maybeOptions: UuidOptions = {}
): string[] {
  let count: number;
  let uppercase: boolean;
  let hyphens: boolean;

  if (typeof countOrOptions === 'number') {
    count = Math.min(Math.max(1, countOrOptions), 100);
    uppercase = maybeOptions.uppercase ?? false;
    hyphens = maybeOptions.hyphens ?? true;
  } else {
    count = Math.min(Math.max(1, countOrOptions.count ?? 1), 100);
    uppercase = countOrOptions.uppercase ?? false;
    hyphens = countOrOptions.hyphens ?? true;
  }

  const results: string[] = [];
  for (let i = 0; i < count; i++) {
    let id: string;
    if (typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function') {
      id = crypto.randomUUID();
    } else {
      // RFC4122 v4 fallback
      id = 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c) => {
        const r = (Math.random() * 16) | 0;
        const v = c === 'x' ? r : (r & 0x3) | 0x8;
        return v.toString(16);
      });
    }

    if (!hyphens) {
      id = id.replace(/-/g, '');
    }
    if (uppercase) {
      id = id.toUpperCase();
    }
    results.push(id);
  }
  return results;
}

/**
 * Compute cryptographic hash digest of input text using Web Crypto subtle.digest.
 */
export async function computeHash(
  arg1: string,
  arg2: HashAlgorithm | string = 'SHA-256'
): Promise<{ hash: string; error?: string }> {
  // Support both computeHash(text, algorithm) and computeHash(algorithm, text)
  const isArg1Algo = ['SHA-256', 'SHA-512', 'SHA-384', 'SHA-1'].includes(arg1);
  const algorithm = (isArg1Algo ? arg1 : arg2) as HashAlgorithm;
  const text = isArg1Algo ? String(arg2) : arg1;

  if (!text) {
    return { hash: '' };
  }

  try {
    if (typeof crypto === 'undefined' || !crypto.subtle) {
      return { hash: '', error: 'Web Crypto API (crypto.subtle) is not available in this browser.' };
    }

    const data = new TextEncoder().encode(text);
    const hashBuffer = await crypto.subtle.digest(algorithm, data);
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    const hashHex = hashArray.map((b) => b.toString(16).padStart(2, '0')).join('');
    return { hash: hashHex };
  } catch (err) {
    return {
      hash: '',
      error: `Hash calculation failed: ${err instanceof Error ? err.message : String(err)}`,
    };
  }
}
