import { executeRegex } from '../utils/regexUtils';
import type { RegexTestResult } from '../utils/regexUtils';

interface RegexWorkerRequest {
  pattern: string;
  flags: string;
  testString: string;
}

self.onmessage = (event: MessageEvent<RegexWorkerRequest>) => {
  const { pattern, flags, testString } = event.data;
  const result: RegexTestResult = executeRegex(pattern, flags, testString);
  self.postMessage(result);
};

export {};
