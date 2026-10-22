import { RegexMatchResult, RegexMatchGroup } from '../types';

export interface RegexTestResult {
  isValid: boolean;
  error?: string;
  matches: RegexMatchResult[];
  executionTimeMs: number;
}

export interface RegexPreset {
  name: string;
  pattern: string;
  flags: string;
  sample: string;
  description: string;
}

export const COMMON_REGEX_PRESETS: RegexPreset[] = [
  {
    name: 'Email Address',
    pattern: '[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\\.[a-zA-Z]{2,}',
    flags: 'g',
    sample: 'Contact support@example.com or admin.team+ops@sub.domain.co.uk for inquiries.',
    description: 'Matches standard RFC-compliant email addresses.',
  },
  {
    name: 'URL (HTTP / HTTPS)',
    pattern: 'https?:\\/\\/(www\\.)?[-a-zA-Z0-9@:%._\\+~#=]{1,256}\\.[a-zA-Z0-9()]{1,6}\\b([-a-zA-Z0-9()@:%_\\+.~#?&//=]*)',
    flags: 'gi',
    sample: 'Visit https://github.com/developer/project or http://localhost:3000/docs?query=test#section',
    description: 'Matches web URLs with optional query parameters and fragments.',
  },
  {
    name: 'Semantic Versioning (SemVer)',
    pattern: '^v?(0|[1-9]\\d*)\\.(0|[1-9]\\d*)\\.(0|[1-9]\\d*)(?:-((?:0|[1-9]\\d*|\\d*[a-zA-Z-][0-9a-zA-Z-]*)(?:\\.(?:0|[1-9]\\d*|\\d*[a-zA-Z-][0-9a-zA-Z-]*))*))?(?:\\+([0-9a-zA-Z-]+(?:\\.[0-9a-zA-Z-]+)*))?$',
    flags: 'gm',
    sample: 'v1.0.0\n2.14.3-alpha.1\n0.0.1+20130313144700\ninvalid-version-here',
    description: 'Validates official SemVer specifications with pre-release tags.',
  },
  {
    name: 'IPv4 Address',
    pattern: '\\b(?:(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\\.){3}(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\\b',
    flags: 'g',
    sample: 'Gateway: 192.168.1.1, DNS: 8.8.8.8, Subnet broadcast: 255.255.255.0, Invalid: 999.12.3.4',
    description: 'Validates standard 0.0.0.0 to 255.255.255.255 IPv4 addresses.',
  },
  {
    name: 'ISO 8601 Date & Time',
    pattern: '\\d{4}-\\d{2}-\\d{2}(?:T\\d{2}:\\d{2}:\\d{2}(?:\\.\\d+)?(?:Z|[+-]\\d{2}:\\d{2})?)?',
    flags: 'g',
    sample: 'Created at 2026-10-22T18:00:00.000Z and modified on 2026-11-05',
    description: 'Matches standard ISO date and datetime timestamps.',
  },
  {
    name: 'Hex Color',
    pattern: '#(?:[0-9a-fA-F]{3,4}){1,2}\\b',
    flags: 'g',
    sample: 'Colors: #38bdf8, #0ea5e9, #fff, #112233aa, and not a #hashtag.',
    description: 'Matches 3, 4, 6, and 8-digit hexadecimal CSS color codes.',
  },
  {
    name: 'UUID v4',
    pattern: '[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-4[0-9a-fA-F]{3}-[89abAB][0-9a-fA-F]{3}-[0-9a-fA-F]{12}',
    flags: 'gi',
    sample: 'ID: 123e4567-e89b-12d3-a456-426614174000 (v1) vs e2a65971-8bc6-4e56-9cf8-662f5f190e21 (v4)',
    description: 'Matches UUID Version 4 tokens.',
  },
];

/**
 * Friendly syntax error diagnostics for broken regular expressions.
 */
export function diagnoseRegexError(pattern: string, rawError: string): string {
  if (rawError.includes('Unterminated group') || rawError.includes('unmatched') || rawError.includes('parenthesis')) {
    const openParens = (pattern.match(/\(/g) || []).length;
    const closeParens = (pattern.match(/\)/g) || []).length;
    if (openParens > closeParens) {
      return `${rawError} — You opened ${openParens} group '(' but only closed ${closeParens} ')'. Check for missing closing parenthesis.`;
    }
  }
  if (rawError.includes('Unterminated character class') || rawError.includes('bracket')) {
    return `${rawError} — A character class '[' was opened without a closing ']'.`;
  }
  if (rawError.includes('nothing to repeat') || rawError.includes('Invalid quantifier')) {
    return `${rawError} — A quantifier like '*', '+', or '?' has no preceding character or token to repeat. Escape it with '\\' if you intended a literal character.`;
  }
  if (rawError.includes('Invalid escape')) {
    return `${rawError} — An invalid escape sequence was used. In standard RegExp, ensure backslashes precede valid escape characters.`;
  }
  return rawError;
}

/**
 * Execute regex safely with safety safeguards against infinite loops and capture groups extraction.
 */
export function executeRegex(
  pattern: string,
  flags: string,
  testString: string,
  maxMatches = 2000
): RegexTestResult {
  if (!pattern) {
    return {
      isValid: true,
      matches: [],
      executionTimeMs: 0,
    };
  }

  const startTime = performance.now();

  // Keep pathological inputs bounded. The UI additionally executes in a terminable Worker.
  if (pattern.length > 2_000) {
    return { isValid: false, error: 'Pattern is too long (maximum 2,000 characters).', matches: [], executionTimeMs: 0 };
  }
  if (testString.length > 200_000) {
    return { isValid: false, error: 'Test text is too long (maximum 200,000 characters).', matches: [], executionTimeMs: 0 };
  }

  let regex: RegExp;
  try {
    // The `d` flag exposes exact capture-group offsets instead of guessing from text values.
    regex = new RegExp(pattern, flags.includes('d') ? flags : `${flags}d`);
  } catch (err) {
    const rawMsg = err instanceof Error ? err.message : String(err);
    return {
      isValid: false,
      error: diagnoseRegexError(pattern, rawMsg),
      matches: [],
      executionTimeMs: performance.now() - startTime,
    };
  }

  const matches: RegexMatchResult[] = [];

  try {
    if (!flags.includes('g')) {
      const match = regex.exec(testString);
      if (match) {
        const groups: RegexMatchGroup[] = [];
        if (match.groups) {
          for (const [name, val] of Object.entries(match.groups)) {
            groups.push({
              name,
              value: val ?? '',
              start: (match as RegExpExecArray & { indices?: Array<[number, number] | undefined> & { groups?: Record<string, [number, number] | undefined> } }).indices?.groups?.[name]?.[0] ?? match.index,
              end: (match as RegExpExecArray & { indices?: Array<[number, number] | undefined> & { groups?: Record<string, [number, number] | undefined> } }).indices?.groups?.[name]?.[1] ?? (match.index + (val?.length || 0)),
            });
          }
        }
        for (let i = 1; i < match.length; i++) {
          if (!match.groups || !Object.values(match.groups).includes(match[i])) {
            groups.push({
              name: `Group #${i}`,
              value: match[i] ?? '',
              start: (match as RegExpExecArray & { indices?: Array<[number, number] | undefined> }).indices?.[i]?.[0] ?? match.index,
              end: (match as RegExpExecArray & { indices?: Array<[number, number] | undefined> }).indices?.[i]?.[1] ?? (match.index + (match[i]?.length || 0)),
            });
          }
        }
        matches.push({
          fullMatch: match[0],
          index: match.index,
          length: match[0].length,
          groups,
        });
      }
    } else {
      let match: RegExpExecArray | null;
      let count = 0;

      while ((match = regex.exec(testString)) !== null) {
        count++;
        if (count > maxMatches) {
          break;
        }

        const groups: RegexMatchGroup[] = [];
        if (match.groups) {
          for (const [name, val] of Object.entries(match.groups)) {
            groups.push({
              name,
              value: val ?? '',
              start: (match as RegExpExecArray & { indices?: Array<[number, number] | undefined> & { groups?: Record<string, [number, number] | undefined> } }).indices?.groups?.[name]?.[0] ?? match.index,
              end: (match as RegExpExecArray & { indices?: Array<[number, number] | undefined> & { groups?: Record<string, [number, number] | undefined> } }).indices?.groups?.[name]?.[1] ?? (match.index + (val?.length || 0)),
            });
          }
        }
        for (let i = 1; i < match.length; i++) {
          groups.push({
            name: `Group #${i}`,
            value: match[i] ?? '',
            start: (match as RegExpExecArray & { indices?: Array<[number, number] | undefined> }).indices?.[i]?.[0] ?? match.index,
            end: (match as RegExpExecArray & { indices?: Array<[number, number] | undefined> }).indices?.[i]?.[1] ?? (match.index + (match[i]?.length || 0)),
          });
        }

        matches.push({
          fullMatch: match[0],
          index: match.index,
          length: match[0].length,
          groups,
        });

        // JavaScript's RegExp.exec does not advance lastIndex for zero-length
        // global matches. Advance explicitly after recording the match so the
        // same empty match is not emitted twice. Preserve Unicode code points.
        if (match[0].length === 0) {
          const current = match.index;
          const first = testString.charCodeAt(current);
          const second = testString.charCodeAt(current + 1);
          const isUnicodePair = (flags.includes('u') || flags.includes('v'))
            && first >= 0xD800 && first <= 0xDBFF
            && second >= 0xDC00 && second <= 0xDFFF;
          regex.lastIndex = current + (isUnicodePair ? 2 : 1);
        }

        if (regex.lastIndex > testString.length) {
          break;
        }
      }
    }

    return {
      isValid: true,
      matches,
      executionTimeMs: Math.round((performance.now() - startTime) * 100) / 100,
    };
  } catch (runtimeErr) {
    return {
      isValid: false,
      error: `Runtime error while evaluating regular expression: ${
        runtimeErr instanceof Error ? runtimeErr.message : String(runtimeErr)
      }`,
      matches: [],
      executionTimeMs: performance.now() - startTime,
    };
  }
}

/**
 * Split text into non-matching and matching segments for highlight rendering.
 */
export interface HighlightSegment {
  text: string;
  isMatch: boolean;
  matchIndex?: number;
}

export function buildHighlightSegments(
  testString: string,
  matches: RegexMatchResult[]
): HighlightSegment[] {
  if (matches.length === 0 || !testString) {
    return [{ text: testString, isMatch: false }];
  }

  const segments: HighlightSegment[] = [];
  let cursor = 0;

  for (let i = 0; i < matches.length; i++) {
    const match = matches[i];

    // Catch any match that might be behind cursor if regex overlaps
    if (match.index < cursor) {
      continue;
    }

    if (match.index > cursor) {
      segments.push({
        text: testString.slice(cursor, match.index),
        isMatch: false,
      });
    }

    if (match.length > 0) {
      segments.push({
        text: match.fullMatch,
        isMatch: true,
        matchIndex: i + 1,
      });
      cursor = match.index + match.length;
    } else {
      // Zero-length match indicator. Advance the text cursor to this index so
      // subsequent zero-width matches do not duplicate already-rendered text.
      segments.push({
        text: '',
        isMatch: true,
        matchIndex: i + 1,
      });
      cursor = match.index;
    }
  }

  if (cursor < testString.length) {
    segments.push({
      text: testString.slice(cursor),
      isMatch: false,
    });
  }

  return segments;
}
