/**
 * Pure client-side JWT (JSON Web Token) parser and inspector.
 * Decodes Header and Payload safely in memory without sending tokens to any server.
 */

import { decodeBase64 } from './codecUtils';

export interface JwtInspectionResult {
  isValid: boolean;
  error?: string;
  header?: Record<string, unknown>;
  payload?: Record<string, unknown>;
  signature?: string;
  headerFormatted?: string;
  payloadFormatted?: string;
  expirationStatus?: {
    isExpired: boolean;
    expiresAt?: Date;
    issuedAt?: Date;
    notBefore?: Date;
    humanDiff?: string;
  };
}

/**
 * Decode Base64URL string to standard string using UTF-8 safe decoding.
 */
export function base64UrlDecode(str: string): { output: string; error?: string } {
  let base64 = str.replace(/-/g, '+').replace(/_/g, '/');
  while (base64.length % 4 !== 0) {
    base64 += '=';
  }
  return decodeBase64(base64);
}

/**
 * Inspect and decode a JWT token string.
 */
export function inspectJwt(token: string): JwtInspectionResult {
  if (!token || !token.trim()) {
    return { isValid: false, error: 'Token string is empty. Paste a JWT to inspect.' };
  }

  // Safely strip leading "Bearer " authorization prefix (case-insensitive) if present
  let cleanToken = token.trim();
  if (/^bearer(\s+|$)/i.test(cleanToken)) {
    cleanToken = cleanToken.replace(/^bearer(\s+|$)/i, '').trim();
  }

  if (!cleanToken) {
    return { isValid: false, error: 'Token string is empty. Paste a JWT to inspect.' };
  }

  const parts = cleanToken.split('.');
  if (parts.length !== 3) {
    return {
      isValid: false,
      error: `Invalid JWT format. Expected 3 dot-separated segments (header.payload.signature), but found ${parts.length}.`,
    };
  }

  const [rawHeader, rawPayload, signature] = parts;

  // Decode Header
  const headerDecoded = base64UrlDecode(rawHeader);
  if (headerDecoded.error) {
    return { isValid: false, error: `Invalid JWT header: ${headerDecoded.error}` };
  }

  let header: Record<string, unknown>;
  try {
    header = JSON.parse(headerDecoded.output);
  } catch (err) {
    return {
      isValid: false,
      error: `JWT header is not valid JSON: ${err instanceof Error ? err.message : String(err)}`,
    };
  }

  // Decode Payload
  const payloadDecoded = base64UrlDecode(rawPayload);
  if (payloadDecoded.error) {
    return { isValid: false, error: `Invalid JWT payload: ${payloadDecoded.error}` };
  }

  let payload: Record<string, unknown>;
  try {
    payload = JSON.parse(payloadDecoded.output);
  } catch (err) {
    return {
      isValid: false,
      error: `JWT payload is not valid JSON: ${err instanceof Error ? err.message : String(err)}`,
    };
  }

  // Calculate Expiration & Claims
  let expirationStatus: JwtInspectionResult['expirationStatus'];
  const nowSec = Math.floor(Date.now() / 1000);

  if (typeof payload.exp === 'number') {
    const expSec = payload.exp;
    const isExpired = nowSec >= expSec;
    const diffSec = Math.abs(expSec - nowSec);
    const diffMin = Math.floor(diffSec / 60);
    const diffHours = Math.floor(diffMin / 60);
    const diffDays = Math.floor(diffHours / 24);

    let humanDiff = '';
    if (diffDays > 0) {
      humanDiff = `${diffDays}d ${diffHours % 24}h`;
    } else if (diffHours > 0) {
      humanDiff = `${diffHours}h ${diffMin % 60}m`;
    } else {
      humanDiff = `${diffMin}m ${diffSec % 60}s`;
    }

    expirationStatus = {
      isExpired,
      expiresAt: new Date(expSec * 1000),
      humanDiff: isExpired ? `Expired ${humanDiff} ago` : `Expires in ${humanDiff}`,
    };
  }

  if (typeof payload.iat === 'number' && expirationStatus) {
    expirationStatus.issuedAt = new Date(payload.iat * 1000);
  }
  if (typeof payload.nbf === 'number' && expirationStatus) {
    expirationStatus.notBefore = new Date(payload.nbf * 1000);
  }

  return {
    isValid: true,
    header,
    payload,
    signature,
    headerFormatted: JSON.stringify(header, null, 2),
    payloadFormatted: JSON.stringify(payload, null, 2),
    expirationStatus,
  };
}

export function parseJwt(token: string) {
  const res = inspectJwt(token);
  return {
    success: res.isValid,
    error: res.error,
    data: res.isValid
      ? {
          header: res.header ?? {},
          payload: res.payload ?? {},
          signature: res.signature ?? '',
          headerJson: res.headerFormatted ?? '',
          payloadJson: res.payloadFormatted ?? '',
        }
      : undefined,
  };
}

export function formatUnixTimestamp(timestamp?: unknown): string {
  if (typeof timestamp !== 'number') return 'None';
  try {
    return new Date(timestamp * 1000).toUTCString();
  } catch {
    return String(timestamp);
  }
}

export function getExpirationStatus(exp?: unknown): { isExpired: boolean; message: string } | null {
  if (typeof exp !== 'number') return null;
  const now = Math.floor(Date.now() / 1000);
  const isExpired = now >= exp;
  const diff = Math.abs(exp - now);
  const minutes = Math.floor(diff / 60);
  const hours = Math.floor(minutes / 60);
  const days = Math.floor(hours / 24);

  let msg = '';
  if (days > 0) msg = `${days}d ${hours % 24}h`;
  else if (hours > 0) msg = `${hours}h ${minutes % 60}m`;
  else msg = `${minutes}m`;

  return {
    isExpired,
    message: isExpired ? `Expired ${msg} ago` : `Expires in ${msg}`,
  };
}
