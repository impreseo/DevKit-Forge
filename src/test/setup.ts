import '@testing-library/jest-dom';

// Mock matchMedia for tests
Object.defineProperty(window, 'matchMedia', {
  writable: true,
  value: (query: string) => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: () => {},
    removeListener: () => {},
    addEventListener: () => {},
    removeEventListener: () => {},
    dispatchEvent: () => false,
  }),
});

// Mock clipboard API
if (!navigator.clipboard) {
  Object.defineProperty(navigator, 'clipboard', {
    value: {
      writeText: async () => {},
      readText: async () => '',
    },
    writable: true,
  });
}

// Mock URL object methods for download tests
if (typeof URL.createObjectURL !== 'function') {
  URL.createObjectURL = () => 'blob:mock-url';
}
if (typeof URL.revokeObjectURL !== 'function') {
  URL.revokeObjectURL = () => {};
}

// Mock Worker for JSDOM environment
import { executeRegex } from '../utils/regexUtils';

if (typeof window.Worker === 'undefined') {
  class MockWorker {
    onmessage: ((event: MessageEvent) => void) | null = null;
    onerror: (() => void) | null = null;
    terminated = false;

    postMessage(request: { pattern: string; flags: string; testString: string; replacement?: string }) {
      window.setTimeout(() => {
        if (this.terminated) return;
        this.onmessage?.({
          data: executeRegex(request.pattern, request.flags, request.testString, 2000, request.replacement),
        } as MessageEvent);
      }, 0);
    }

    terminate() {
      this.terminated = true;
    }
  }

  // @ts-expect-error Mocking Worker for JSDOM
  window.Worker = MockWorker;
}
