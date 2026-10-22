import { JsonValidationResult, JsonDiffEntry } from '../types';

/**
 * Recursively sort keys in an object alphabetically.
 */
export function sortObjectKeys(value: unknown): unknown {
  if (value === null || typeof value !== 'object') {
    return value;
  }
  if (Array.isArray(value)) {
    return value.map(sortObjectKeys);
  }
  const obj = value as Record<string, unknown>;
  // A null-prototype object preserves JSON keys such as __proto__ as data.
  const sorted: Record<string, unknown> = Object.create(null) as Record<string, unknown>;
  const keys = Object.keys(obj).sort((a, b) => a.localeCompare(b));
  for (const key of keys) {
    Object.defineProperty(sorted, key, {
      value: sortObjectKeys(obj[key]),
      enumerable: true,
      configurable: true,
      writable: true,
    });
  }
  return sorted;
}

/**
 * Format JSON with custom indentation and optional key sorting.
 */
export function formatJson(
  input: string,
  indent: number | string = 2,
  sortKeys: boolean = false
): { output: string; error?: string } {
  if (!input || !input.trim()) {
    return { output: '', error: 'Input cannot be empty' };
  }
  try {
    let parsed = JSON.parse(input);
    if (sortKeys) {
      parsed = sortObjectKeys(parsed);
    }
    const indentation = typeof indent === 'number' ? indent : '\t';
    return { output: JSON.stringify(parsed, null, indentation) };
  } catch (err: unknown) {
    const errorMsg = err instanceof Error ? err.message : String(err);
    return { output: '', error: errorMsg };
  }
}

/**
 * Minify JSON and compute compression metrics.
 */
export function minifyJson(input: string): {
  output: string;
  originalBytes: number;
  minifiedBytes: number;
  savedBytes: number;
  compressionPercent: number;
  error?: string;
} {
  if (!input || !input.trim()) {
    return {
      output: '',
      originalBytes: 0,
      minifiedBytes: 0,
      savedBytes: 0,
      compressionPercent: 0,
      error: 'Input cannot be empty',
    };
  }

  const originalBytes = new TextEncoder().encode(input).length;

  try {
    const parsed = JSON.parse(input);
    const output = JSON.stringify(parsed);
    const minifiedBytes = new TextEncoder().encode(output).length;
    const savedBytes = Math.max(0, originalBytes - minifiedBytes);
    const compressionPercent = originalBytes > 0
      ? Math.round(((originalBytes - minifiedBytes) / originalBytes) * 1000) / 10
      : 0;

    return {
      output,
      originalBytes,
      minifiedBytes,
      savedBytes,
      compressionPercent,
    };
  } catch (err: unknown) {
    const errorMsg = err instanceof Error ? err.message : String(err);
    return {
      output: '',
      originalBytes,
      minifiedBytes: 0,
      savedBytes: 0,
      compressionPercent: 0,
      error: errorMsg,
    };
  }
}

/**
 * Calculate structural depth of JSON value.
 */
function getJsonDepth(val: unknown): number {
  if (val === null || typeof val !== 'object') return 0;
  let maxDepth = 1;
  const stack: Array<{ value: unknown; depth: number }> = [{ value: val, depth: 1 }];
  while (stack.length) {
    const current = stack.pop()!;
    if (current.value === null || typeof current.value !== 'object') continue;
    const children = Array.isArray(current.value)
      ? current.value
      : Object.values(current.value as Record<string, unknown>);
    for (const child of children) {
      if (child !== null && typeof child === 'object') {
        const depth = current.depth + 1;
        if (depth > maxDepth) maxDepth = depth;
        stack.push({ value: child, depth });
      }
    }
  }
  return maxDepth;
}

/**
 * Count total keys in JSON structure recursively.
 */
function countJsonKeys(val: unknown): number {
  let count = 0;
  const stack: unknown[] = [val];
  while (stack.length) {
    const current = stack.pop();
    if (current === null || typeof current !== 'object') continue;
    if (Array.isArray(current)) {
      for (const item of current) stack.push(item);
      continue;
    }
    const object = current as Record<string, unknown>;
    const keys = Object.keys(object);
    count += keys.length;
    for (const key of keys) stack.push(object[key]);
  }
  return count;
}

/**
 * Parse syntax error details and locate line, column, and create visual snippet.
 */
function parseJsonErrorPosition(
  input: string,
  errorMessage: string
): { line?: number; column?: number; snippet?: string } {
  // Typical messages:
  // "Unexpected token 'x', ... is not valid JSON" or "Unexpected token 'x' at position 42"
  // or "JSON.parse: unexpected character at line 3 column 5 of the JSON data"
  const lineColMatch = errorMessage.match(/line (\d+) column (\d+)/i);
  if (lineColMatch) {
    const line = parseInt(lineColMatch[1], 10);
    const column = parseInt(lineColMatch[2], 10);
    return { line, column, snippet: createSnippet(input, line, column) };
  }

  const posMatch = errorMessage.match(/position (\d+)/i);
  if (posMatch) {
    const pos = parseInt(posMatch[1], 10);
    let currentPos = 0;
    const lines = input.split('\n');
    for (let i = 0; i < lines.length; i++) {
      const lineLen = lines[i].length + 1; // including newline
      if (currentPos + lineLen > pos) {
        const line = i + 1;
        const column = Math.max(1, pos - currentPos + 1);
        return { line, column, snippet: createSnippet(input, line, column) };
      }
      currentPos += lineLen;
    }
  }

  return {};
}

function createSnippet(input: string, line: number, column: number): string {
  const lines = input.split('\n');
  const targetLineIdx = line - 1;
  if (targetLineIdx < 0 || targetLineIdx >= lines.length) return '';

  const rawLine = lines[targetLineIdx];
  const pointer = ' '.repeat(Math.max(0, column - 1)) + '^';
  return `Line ${line}:\n${rawLine}\n${pointer}`;
}

/**
 * Deeply validate JSON and extract useful metadata and error insights.
 */
export function validateJson(input: string): JsonValidationResult {
  if (!input || !input.trim()) {
    return {
      isValid: false,
      error: 'Input string is empty. Please provide JSON text to validate.',
    };
  }

  const sizeBytes = new TextEncoder().encode(input).length;

  try {
    const parsed = JSON.parse(input);
    const type: 'object' | 'array' | 'primitive' =
      parsed === null || typeof parsed !== 'object'
        ? 'primitive'
        : Array.isArray(parsed)
        ? 'array'
        : 'object';

    return {
      isValid: true,
      stats: {
        type,
        sizeBytes,
        keyCount: countJsonKeys(parsed),
        depth: getJsonDepth(parsed),
      },
    };
  } catch (err: unknown) {
    const rawError = err instanceof Error ? err.message : String(err);
    const { line, column, snippet } = parseJsonErrorPosition(input, rawError);

    let friendlyError = rawError;
    if (rawError.includes('Unexpected token')) {
      friendlyError = `${rawError}. Check for trailing commas, unquoted keys, single quotes, or invalid characters.`;
    } else if (rawError.includes('Unexpected end of JSON')) {
      friendlyError = `${rawError}. The JSON string was cut short; check for unclosed braces or brackets.`;
    }

    return {
      isValid: false,
      error: friendlyError,
      line,
      column,
      snippet,
    };
  }
}

/**
 * Compare two JSON inputs and generate detailed path-based diffs.
 */
export function compareJson(
  leftStr: string,
  rightStr: string
): {
  diffs: JsonDiffEntry[];
  leftError?: string;
  rightError?: string;
  hasDiffs: boolean;
} {
  let leftParsed: unknown;
  let rightParsed: unknown;

  try {
    leftParsed = JSON.parse(leftStr);
  } catch (err) {
    return {
      diffs: [],
      leftError: `Left JSON is invalid: ${err instanceof Error ? err.message : String(err)}`,
      hasDiffs: false,
    };
  }

  try {
    rightParsed = JSON.parse(rightStr);
  } catch (err) {
    return {
      diffs: [],
      rightError: `Right JSON is invalid: ${err instanceof Error ? err.message : String(err)}`,
      hasDiffs: false,
    };
  }

  const diffs: JsonDiffEntry[] = [];
  type DiffWork =
    | { kind: 'compare'; left: unknown; right: unknown; path: string }
    | { kind: 'entry'; entry: JsonDiffEntry };
  const stack: DiffWork[] = [
    { kind: 'compare', left: leftParsed, right: rightParsed, path: '' },
  ];

  while (stack.length) {
    const work = stack.pop()!;
    if (work.kind === 'entry') {
      diffs.push(work.entry);
      continue;
    }
    const { left, right, path } = work;
    if (left === right) {
      diffs.push({ path: path || '$', type: 'unchanged', oldValue: left, newValue: right });
      continue;
    }

    if (
      left === null ||
      right === null ||
      typeof left !== typeof right ||
      Array.isArray(left) !== Array.isArray(right)
    ) {
      diffs.push({ path: path || '$', type: 'modified', oldValue: left, newValue: right });
      continue;
    }

    if (Array.isArray(left) && Array.isArray(right)) {
      const maxLen = Math.max(left.length, right.length);
      for (let i = maxLen - 1; i >= 0; i--) {
        const itemPath = `${path}[${i}]`;
        if (i >= left.length) {
          stack.push({ kind: 'entry', entry: { path: itemPath, type: 'added', newValue: right[i] } });
        } else if (i >= right.length) {
          stack.push({ kind: 'entry', entry: { path: itemPath, type: 'removed', oldValue: left[i] } });
        } else {
          stack.push({ kind: 'compare', left: left[i], right: right[i], path: itemPath });
        }
      }
      continue;
    }

    if (typeof left === 'object' && typeof right === 'object') {
      const leftObj = left as Record<string, unknown>;
      const rightObj = right as Record<string, unknown>;
      const allKeys = Array.from(new Set([...Object.keys(leftObj), ...Object.keys(rightObj)])).sort();

      for (let i = allKeys.length - 1; i >= 0; i--) {
        const key = allKeys[i];
        const keyPath = path ? `${path}.${key}` : key;
        const hasLeft = Object.prototype.hasOwnProperty.call(leftObj, key);
        const hasRight = Object.prototype.hasOwnProperty.call(rightObj, key);
        if (!hasLeft) {
          stack.push({ kind: 'entry', entry: { path: keyPath, type: 'added', newValue: rightObj[key] } });
        } else if (!hasRight) {
          stack.push({ kind: 'entry', entry: { path: keyPath, type: 'removed', oldValue: leftObj[key] } });
        } else {
          stack.push({ kind: 'compare', left: leftObj[key], right: rightObj[key], path: keyPath });
        }
      }
      continue;
    }

    diffs.push({ path: path || '$', type: 'modified', oldValue: left, newValue: right });
  }

  const hasDiffs = diffs.some((d) => d.type !== 'unchanged');

  return { diffs, hasDiffs };
}

export const LARGE_JSON_SIZE_THRESHOLD_BYTES = 5 * 1024 * 1024; // 5 MB

/**
 * Returns the UTF-8 byte length of a string.
 * Uses Blob size or TextEncoder when available, with a fast fallback.
 */
export function getUtf8ByteLength(text: string): number {
  if (typeof Blob !== 'undefined') {
    return new Blob([text]).size;
  }
  if (typeof TextEncoder !== 'undefined') {
    return new TextEncoder().encode(text).length;
  }
  let bytes = 0;
  for (let i = 0; i < text.length; i++) {
    const code = text.charCodeAt(i);
    if (code < 0x80) {
      bytes += 1;
    } else if (code < 0x800) {
      bytes += 2;
    } else if (code >= 0xd800 && code <= 0xdbff) {
      bytes += 4;
      i++; // skip low surrogate
    } else {
      bytes += 3;
    }
  }
  return bytes;
}

/**
 * Check whether a JSON string exceeds the 5 MB UTF-8 byte threshold.
 * Uses fast-path bounds checks to avoid byte calculations for inputs that are
 * definitely below (~1.74 MB code units) or definitely above (5 MB code units) the threshold.
 */
export function isLargeJson(text: string): boolean {
  if (!text) return false;
  // Fast path 1: In UTF-8, each UTF-16 code unit produces at least 1 byte.
  // Therefore, if string length exceeds 5 MB code units, UTF-8 byte size is guaranteed >= 5 MB.
  if (text.length > LARGE_JSON_SIZE_THRESHOLD_BYTES) {
    return true;
  }
  // Fast path 2: In UTF-8, each UTF-16 code unit produces at most 3 bytes
  // (surrogate pairs of 2 code units produce 4 bytes = 2 bytes/unit; BMP code units produce <= 3 bytes).
  // If text.length * 3 <= threshold, byte size cannot exceed threshold.
  if (text.length * 3 <= LARGE_JSON_SIZE_THRESHOLD_BYTES) {
    return false;
  }
  // Middle range: Calculate exact UTF-8 byte length.
  return getUtf8ByteLength(text) > LARGE_JSON_SIZE_THRESHOLD_BYTES;
}

/**
 * Detect numeric literals in a JSON string that exceed JavaScript's safe integer range
 * (Number.MIN_SAFE_INTEGER to Number.MAX_SAFE_INTEGER: ±9,007,199,254,740,991).
 * Standard JSON.parse parses numbers into IEEE 754 64-bit floats, which lose precision
 * for integers outside this range.
 */
export function hasUnsafeInteger(jsonStr: string): boolean {
  if (!jsonStr || jsonStr.length < 16) return false;
  // Strip string literals (accounting for escaped quotes and backslashes)
  // to avoid false positives inside string values.
  const withoutStrings = jsonStr.replace(/"(?:\\.|[^"\\])*"/g, '""');

  // Match standalone integer literals:
  // Must be preceded by start-of-input, whitespace, or JSON delimiters ([, :, ,)
  // and followed by whitespace, JSON delimiters (], }, ,), or end-of-input.
  // This explicitly excludes decimal fractions (e.g. 1.9007199254740995 or 9007199254740995.123)
  // and exponential notation (e.g. 9007199254740995e2 or 1e9007199254740995).
  const intRegex = /(?:^|[[:,\s])\s*(-?\d{16,})(?=[\]},\s]|$)/g;
  let match: RegExpExecArray | null;
  while ((match = intRegex.exec(withoutStrings)) !== null) {
    try {
      const val = BigInt(match[1]);
      if (val > BigInt(Number.MAX_SAFE_INTEGER) || val < BigInt(Number.MIN_SAFE_INTEGER)) {
        return true;
      }
    } catch {
      // Ignore unparseable values
    }
  }
  return false;
}
