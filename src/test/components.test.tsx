import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { TOOL_REGISTRY, searchTools, getToolById } from '../registry/tools';
import { LandingView } from '../components/LandingView';
import { JsonFormatter } from '../components/tools/JsonFormatter';
import { JsonValidator } from '../components/tools/JsonValidator';
import { JsonMinifier } from '../components/tools/JsonMinifier';
import { RegexTester } from '../components/tools/RegexTester';
import { MarkdownPreview } from '../components/tools/MarkdownPreview';
import { executeRegex } from '../utils/regexUtils';

describe('Tool Registry', () => {
  it('registers all required developer utilities with unique IDs and metadata', () => {
    const requiredTools = [
      'json-formatter',
      'json-minifier',
      'json-validator',
      'json-diff',
      'regex-tester',
      'gitignore-generator',
      'markdown-preview',
    ];

    const registeredIds = TOOL_REGISTRY.map((t) => t.id);
    for (const toolId of requiredTools) {
      expect(registeredIds).toContain(toolId);
      const meta = getToolById(toolId);
      expect(meta).toBeDefined();
      expect(meta?.title).toBeTruthy();
      expect(meta?.shortDescription).toBeTruthy();
      expect(meta?.tags.length).toBeGreaterThan(0);
      expect(meta?.component).toBeDefined();
    }
  });

  it('filters tools correctly using searchTools', () => {
    const jsonTools = searchTools('', 'json');
    expect(jsonTools.length).toBeGreaterThanOrEqual(4);
    expect(jsonTools.every((t) => t.category === 'json')).toBe(true);

    const regexTools = searchTools('regex', 'all');
    expect(regexTools.length).toBeGreaterThanOrEqual(1);
    expect(regexTools[0].id).toBe('regex-tester');
  });
});

describe('LandingView Component', () => {
  it('renders title, tool cards, and responds to click', () => {
    const mockSelect = vi.fn();
    const mockToggleFav = vi.fn();

    render(
      <LandingView
        onSelectTool={mockSelect}
        favorites={['json-formatter']}
        onToggleFavorite={mockToggleFav}
        selectedCategory="all"
        onSelectCategory={() => {}}
      />
    );

    expect(screen.getByText('DevKit Forge')).toBeInTheDocument();
    const jsonCard = screen.getByRole('heading', { name: 'JSON Formatter' });
    expect(jsonCard).toBeInTheDocument();
    expect(screen.getByRole('heading', { name: 'Regex Tester' })).toBeInTheDocument();

    fireEvent.click(jsonCard);
    expect(mockSelect).toHaveBeenCalledWith('json-formatter');
  });
});

describe('JsonFormatter Component', () => {
  it('renders sample JSON and formats with custom indentation', () => {
    render(<JsonFormatter />);

    const inputArea = screen.getByRole('textbox', { name: /raw input json/i });
    expect(inputArea).toBeInTheDocument();

    fireEvent.change(inputArea, { target: { value: '{"a":1,"b":2}' } });
    expect(screen.getByText(/"a": 1/i)).toBeInTheDocument();

    // Test clear action
    const clearBtn = screen.getByTitle('Clear editor');
    fireEvent.click(clearBtn);
    expect(inputArea).toHaveValue('');
  });
});

describe('JsonValidator Component', () => {
  it('detects syntax errors and displays informative message', () => {
    render(<JsonValidator />);

    const brokenBtn = screen.getByTitle(/broken sample/i);
    fireEvent.click(brokenBtn);

    expect(screen.getByText(/Invalid JSON Syntax Detected/i)).toBeInTheDocument();
  });
});

describe('JsonMinifier Component', () => {
  it('calculates compression and minifies JSON', () => {
    render(<JsonMinifier />);
    expect(screen.getByText(/Reduction Ratio/i)).toBeInTheDocument();
    expect(screen.getByText(/Original Size/i)).toBeInTheDocument();
  });
});

describe('RegexTester Component', () => {
  it('runs regex matching in a worker and allows flag toggling', async () => {
    class MockWorker {
      onmessage: ((event: MessageEvent) => void) | null = null;
      onerror: (() => void) | null = null;
      terminated = false;

      postMessage(request: { pattern: string; flags: string; testString: string }) {
        window.setTimeout(() => {
          if (this.terminated) return;
          this.onmessage?.({
            data: executeRegex(request.pattern, request.flags, request.testString),
          } as MessageEvent);
        }, 0);
      }

      terminate() {
        this.terminated = true;
      }
    }

    vi.stubGlobal('Worker', MockWorker);
    try {
      render(<RegexTester />);

      const patternInput = screen.getByLabelText(/regular expression pattern/i);
      const sampleInput = screen.getByLabelText(/test string input/i);
      fireEvent.change(patternInput, { target: { value: '\\b\\w{4}\\b' } });
      fireEvent.change(sampleInput, { target: { value: 'test word' } });

      await waitFor(() => {
        expect(screen.getByText(/2 matches found/i)).toBeInTheDocument();
      });

      const globalFlag = screen.getByTitle(/Global \(g\)/i);
      fireEvent.click(globalFlag);
      await waitFor(() => {
        expect(screen.getByText(/Valid RegExp syntax/i)).toBeInTheDocument();
      });
    } finally {
      vi.unstubAllGlobals();
    }
  });
});

describe('MarkdownPreview Component', () => {
  it('sanitizes script, event-handler, and javascript URL payloads', () => {
    const { container } = render(<MarkdownPreview />);
    const markdownInput = screen.getByLabelText(/markdown source code/i);

    fireEvent.change(markdownInput, {
      target: {
        value: '<script>window.__xss = true</script>\n\n<img src="x" onerror="alert(1)">\n\n[unsafe](javascript:alert(1))',
      },
    });

    expect(container.querySelector('script')).toBeNull();
    expect(container.querySelector('img[onerror]')).toBeNull();
    expect(container.querySelector('a[href^="javascript:"]')).toBeNull();
  });
});
