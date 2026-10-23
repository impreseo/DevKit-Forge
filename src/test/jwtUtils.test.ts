import { describe, it, expect } from 'vitest';
import { inspectJwt, base64UrlDecode } from '../utils/jwtUtils';
import { encodeBase64 } from '../utils/codecUtils';

describe('jwtUtils', () => {
  function createSampleJwt(header: object, payload: object, sig = 'mock_signature') {
    const b64Header = encodeBase64(JSON.stringify(header)).output.replace(/=/g, '').replace(/\+/g, '-').replace(/\//g, '_');
    const b64Payload = encodeBase64(JSON.stringify(payload)).output.replace(/=/g, '').replace(/\+/g, '-').replace(/\//g, '_');
    return `${b64Header}.${b64Payload}.${sig}`;
  }

  it('correctly parses standard JWT with header and payload', () => {
    const token = createSampleJwt(
      { alg: 'HS256', typ: 'JWT' },
      { sub: 'usr_123', name: 'Alice Developer', role: 'admin' }
    );

    const result = inspectJwt(token);
    expect(result.isValid).toBe(true);
    expect(result.header?.alg).toBe('HS256');
    expect(result.payload?.sub).toBe('usr_123');
    expect(result.payload?.name).toBe('Alice Developer');
    expect(result.signature).toBe('mock_signature');
  });

  it('correctly calculates active expiration for future timestamp', () => {
    const futureSec = Math.floor(Date.now() / 1000) + 3600; // 1 hour from now
    const token = createSampleJwt(
      { alg: 'HS256' },
      { sub: '123', exp: futureSec }
    );

    const result = inspectJwt(token);
    expect(result.isValid).toBe(true);
    expect(result.expirationStatus).toBeDefined();
    expect(result.expirationStatus?.isExpired).toBe(false);
    expect(result.expirationStatus?.humanDiff).toContain('Expires in');
  });

  it('correctly identifies expired token for past timestamp', () => {
    const pastSec = Math.floor(Date.now() / 1000) - 7200; // 2 hours ago
    const token = createSampleJwt(
      { alg: 'HS256' },
      { sub: '123', exp: pastSec }
    );

    const result = inspectJwt(token);
    expect(result.isValid).toBe(true);
    expect(result.expirationStatus?.isExpired).toBe(true);
    expect(result.expirationStatus?.humanDiff).toContain('Expired');
  });

  it('handles invalid token segment count', () => {
    expect(inspectJwt('only-one-segment').isValid).toBe(false);
    expect(inspectJwt('two.segments').isValid).toBe(false);
    expect(inspectJwt('four.dot.separated.parts').isValid).toBe(false);
  });

  it('handles empty input gracefully', () => {
    const result = inspectJwt('');
    expect(result.isValid).toBe(false);
    expect(result.error).toContain('empty');
  });

  it('decodes base64url padding properly', () => {
    // "hello" in base64 is "aGVsbG8="
    const decoded = base64UrlDecode('aGVsbG8');
    expect(decoded.output).toBe('hello');
  });

  it('safely handles conventional Bearer token prefix', () => {
    const rawToken = createSampleJwt(
      { alg: 'HS256', typ: 'JWT' },
      { sub: 'usr_bearer_test', role: 'engineer' }
    );

    // Standard Bearer prefix
    const bearerResult = inspectJwt(`Bearer ${rawToken}`);
    expect(bearerResult.isValid).toBe(true);
    expect(bearerResult.payload?.sub).toBe('usr_bearer_test');

    // Case-insensitive bearer prefix with multiple whitespace
    const lowerBearerResult = inspectJwt(`bearer   ${rawToken}`);
    expect(lowerBearerResult.isValid).toBe(true);
    expect(lowerBearerResult.payload?.sub).toBe('usr_bearer_test');

    // Leading whitespace before Bearer
    const paddedBearerResult = inspectJwt(`   Bearer ${rawToken}   `);
    expect(paddedBearerResult.isValid).toBe(true);

    // Only 'Bearer' with no token returns empty error
    const onlyBearer = inspectJwt('Bearer    ');
    expect(onlyBearer.isValid).toBe(false);
    expect(onlyBearer.error).toContain('empty');
  });
});
