import { executeRegex } from '../utils/regexUtils';
import type { RegexTestResult } from '../utils/regexUtils';

interface RegexWorkerRequest {
  pattern: string;
  flags: string;
  testString: string;
  replacement?: string;
}

self.onmessage = (event: MessageEvent<RegexWorkerRequest>) => {
  const { pattern, flags, testString, replacement } = event.data;
  const result: RegexTestResult = executeRegex(pattern, flags, testString, 2000, replacement);
  self.postMessage(result);
};

export {};
