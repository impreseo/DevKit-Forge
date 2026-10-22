import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { TOOL_REGISTRY, searchTools, getToolById } from '../registry/tools';
import { LandingView } from '../components/LandingView';
import { JsonFormatter } from '../components/tools/JsonFormatter';
import { JsonValidator } from '../components/tools/JsonValidator';
import { JsonMinifier } from '../components/tools/JsonMinifier';
import { JsonDiff } from '../components/tools/JsonDiff';
import { RegexTester } from '../components/tools/RegexTester';
import { GitignoreGenerator } from '../components/tools/GitignoreGenerator';
import { MarkdownPreview } from '../components/tools/MarkdownPreview';
import { CommandPalette } from '../components/CommandPalette';
import { App } from '../App';
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

  it('displays large document warning when input exceeds 5 MB', () => {
    render(<JsonFormatter />);
    const inputArea = screen.getByRole('textbox', { name: /raw input json/i });
    fireEvent.change(inputArea, { target: { value: '{"a":"' + 'x'.repeat(5 * 1024 * 1024) + '"}' } });
    expect(screen.getByText(/Large document detected/i)).toBeInTheDocument();
  });

  it('displays precision notice when JSON numbers exceed safe integer range', () => {
    render(<JsonFormatter />);
    const inputArea = screen.getByRole('textbox', { name: /raw input json/i });
    fireEvent.change(inputArea, { target: { value: '{"id": 9007199254740995}' } });
    expect(screen.getByText(/safe integer limit/i)).toBeInTheDocument();
  });
});

describe('JsonValidator Component', () => {
  it('detects syntax errors and displays informative message', () => {
    render(<JsonValidator />);

    const brokenBtn = screen.getByTitle(/broken sample/i);
    fireEvent.click(brokenBtn);

    expect(screen.getByText(/Invalid JSON Syntax Detected/i)).toBeInTheDocument();
  });

  it('displays precision notice when valid JSON contains unsafe integers', () => {
    render(<JsonValidator />);
    const inputArea = screen.getByRole('textbox', { name: /json source code/i });
    fireEvent.change(inputArea, { target: { value: '{"id": 9007199254740995}' } });
    expect(screen.getByText(/safe integer limit/i)).toBeInTheDocument();
  });
});

describe('JsonMinifier Component', () => {
  it('calculates compression and minifies JSON', () => {
    render(<JsonMinifier />);
    expect(screen.getByText(/Reduction Ratio/i)).toBeInTheDocument();
    expect(screen.getByText(/Original Size/i)).toBeInTheDocument();
  });

  it('displays large document warning when input exceeds 5 MB', () => {
    render(<JsonMinifier />);
    const inputArea = screen.getByRole('textbox', { name: /formatted json input/i });
    fireEvent.change(inputArea, { target: { value: '{"a":"' + 'x'.repeat(5 * 1024 * 1024) + '"}' } });
    expect(screen.getByText(/Large document detected/i)).toBeInTheDocument();
  });

  it('displays precision warning when JSON contains numbers exceeding safe integer range', () => {
    render(<JsonMinifier />);
    const inputArea = screen.getByRole('textbox', { name: /formatted json input/i });
    fireEvent.change(inputArea, { target: { value: '{"id": 9007199254740995}' } });
    expect(screen.getByText(/Precision Warning:/i)).toBeInTheDocument();
  });
});

describe('JsonDiff Component', () => {
  it('renders initial sample documents and accessible input labels', () => {
    render(<JsonDiff />);

    const leftInput = screen.getByLabelText('Original Document (Left)');
    const rightInput = screen.getByLabelText('Modified Document (Right)');
    expect(leftInput).toBeInTheDocument();
    expect(rightInput).toBeInTheDocument();
    expect(screen.getByText(/Differences Found/i)).toBeInTheDocument();
  });

  it('compares valid JSON documents and displays added, removed, and modified counts', () => {
    render(<JsonDiff />);

    const leftInput = screen.getByLabelText('Original Document (Left)');
    const rightInput = screen.getByLabelText('Modified Document (Right)');

    fireEvent.change(leftInput, {
      target: { value: JSON.stringify({ id: 1, name: 'Alice', active: true }) },
    });
    fireEvent.change(rightInput, {
      target: { value: JSON.stringify({ id: 1, name: 'Alicia', role: 'admin' }) },
    });

    expect(screen.getByText(/1 added/i)).toBeInTheDocument();
    expect(screen.getByText(/1 removed/i)).toBeInTheDocument();
    expect(screen.getByText(/1 changed/i)).toBeInTheDocument();
    expect(screen.getByText('role')).toBeInTheDocument();
  });

  it('swaps the left and right input documents when Swap button is clicked', () => {
    render(<JsonDiff />);

    const leftInput = screen.getByLabelText('Original Document (Left)') as HTMLTextAreaElement;
    const rightInput = screen.getByLabelText('Modified Document (Right)') as HTMLTextAreaElement;

    fireEvent.change(leftInput, { target: { value: '{"side":"left"}' } });
    fireEvent.change(rightInput, { target: { value: '{"side":"right"}' } });

    const swapButton = screen.getByTitle('Swap Left and Right documents');
    fireEvent.click(swapButton);

    expect(leftInput.value).toBe('{"side":"right"}');
    expect(rightInput.value).toBe('{"side":"left"}');
  });

  it('loads sample comparison data when Sample button is clicked', () => {
    render(<JsonDiff />);

    const leftInput = screen.getByLabelText('Original Document (Left)');
    fireEvent.change(leftInput, { target: { value: '{}' } });

    const sampleButton = screen.getByTitle('Load sample comparison');
    fireEvent.click(sampleButton);

    expect((leftInput as HTMLTextAreaElement).value).toContain('DevKit Forge');
    expect(screen.getByText(/Differences Found/i)).toBeInTheDocument();
  });

  it('toggles the differences-only view filter', () => {
    render(<JsonDiff />);

    const checkbox = screen.getByRole('checkbox', { name: /show differences only/i });
    expect(checkbox).toBeChecked();

    fireEvent.click(checkbox);
    expect(checkbox).not.toBeChecked();
    // In full mode, unchanged properties like appName appear
    expect(screen.getByText('appName')).toBeInTheDocument();
  });

  it('displays informative error callouts when JSON syntax is invalid or inputs are empty', () => {
    render(<JsonDiff />);

    const leftInput = screen.getByLabelText('Original Document (Left)');
    fireEvent.change(leftInput, { target: { value: '{ unquoted: true }' } });
    expect(screen.getByText(/Left JSON is invalid/i)).toBeInTheDocument();

    // Empty input also surfaces a validation notice
    fireEvent.change(leftInput, { target: { value: '' } });
    expect(screen.getByText(/Left JSON is invalid/i)).toBeInTheDocument();
  });

  it('formats both left and right JSON inputs when Prettify Both is clicked', () => {
    render(<JsonDiff />);

    const leftInput = screen.getByLabelText('Original Document (Left)');
    const rightInput = screen.getByLabelText('Modified Document (Right)');

    fireEvent.change(leftInput, { target: { value: '{"compact":true}' } });
    fireEvent.change(rightInput, { target: { value: '{"compact":false}' } });

    const prettifyBtn = screen.getByTitle('Prettify both JSON panes');
    fireEvent.click(prettifyBtn);

    expect((leftInput as HTMLTextAreaElement).value).toBe('{\n  "compact": true\n}');
    expect((rightInput as HTMLTextAreaElement).value).toBe('{\n  "compact": false\n}');
  });

  it('displays identical objects notice when both documents have identical content', () => {
    render(<JsonDiff />);

    const leftInput = screen.getByLabelText('Original Document (Left)');
    const rightInput = screen.getByLabelText('Modified Document (Right)');

    fireEvent.change(leftInput, { target: { value: '{"ready":true}' } });
    fireEvent.change(rightInput, { target: { value: '{"ready":true}' } });

    expect(screen.getByText(/No Differences — Objects are identical/i)).toBeInTheDocument();
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

  it('toggles modern v flag and maintains mutual exclusivity with u flag', () => {
    render(<RegexTester />);
    const uFlagBtn = screen.getByRole('button', { name: /unicode flag \(u\)/i });
    const vFlagBtn = screen.getByRole('button', { name: /unicode sets flag \(v\)/i });

    expect(vFlagBtn).toHaveAttribute('aria-pressed', 'false');
    fireEvent.click(vFlagBtn);
    expect(vFlagBtn).toHaveAttribute('aria-pressed', 'true');

    // Clicking u flag automatically deselects v flag
    fireEvent.click(uFlagBtn);
    expect(uFlagBtn).toHaveAttribute('aria-pressed', 'true');
    expect(vFlagBtn).toHaveAttribute('aria-pressed', 'false');
  });
});

describe('GitignoreGenerator Component', () => {
  it('renders default selected templates and initial output preview', () => {
    render(<GitignoreGenerator />);

    expect(screen.getByText(/Selected Templates \(3\):/i)).toBeInTheDocument();
    expect(screen.getAllByText('Node.js / JavaScript / TypeScript').length).toBeGreaterThanOrEqual(1);
    expect(screen.getAllByText('Visual Studio Code').length).toBeGreaterThanOrEqual(1);
    expect(screen.getAllByText('macOS').length).toBeGreaterThanOrEqual(1);
  });

  it('filters template list by category', () => {
    render(<GitignoreGenerator />);

    const langCategoryBtn = screen.getByRole('button', { name: 'Languages' });
    fireEvent.click(langCategoryBtn);

    expect(screen.getByText('Python')).toBeInTheDocument();
    expect(screen.getByText(/Rust \(Cargo\)/i)).toBeInTheDocument();
    expect(screen.queryByText('Next.js')).not.toBeInTheDocument();
  });

  it('searches templates by keyword query', () => {
    render(<GitignoreGenerator />);

    const searchInput = screen.getByLabelText(/filter templates/i);
    fireEvent.change(searchInput, { target: { value: 'python' } });

    expect(screen.getByText('Python')).toBeInTheDocument();
    expect(screen.queryByText(/Rust \(Cargo\)/i)).not.toBeInTheDocument();
  });

  it('matches template content patterns like *.log or .env when searching', () => {
    render(<GitignoreGenerator />);
    const searchInput = screen.getByLabelText(/filter templates/i);
    fireEvent.change(searchInput, { target: { value: '*.log' } });

    expect(screen.getAllByText('Node.js / JavaScript / TypeScript').length).toBeGreaterThanOrEqual(1);
    expect(screen.queryByText(/Rust \(Cargo\)/i)).not.toBeInTheDocument();
  });

  it('provides accessible names for selected template removal buttons', () => {
    render(<GitignoreGenerator />);
    const removeNodeBtn = screen.getByRole('button', {
      name: /remove node\.js \/ javascript \/ typescript template/i,
    });
    expect(removeNodeBtn).toBeInTheDocument();
  });

  it('toggles template selection and updates selected count', () => {
    render(<GitignoreGenerator />);

    const pythonItem = screen.getByText('Python');
    fireEvent.click(pythonItem);
    expect(screen.getByText(/Selected Templates \(4\):/i)).toBeInTheDocument();

    fireEvent.click(pythonItem);
    expect(screen.getByText(/Selected Templates \(3\):/i)).toBeInTheDocument();
  });

  it('appends custom project rules to the combined output', () => {
    const { container } = render(<GitignoreGenerator />);

    const customRulesArea = screen.getByLabelText('Custom Project Rules');
    fireEvent.change(customRulesArea, {
      target: { value: '# Custom Secrets\n*.private-key\ncredentials.json' },
    });

    const preview = container.querySelector('pre');
    expect(preview).toHaveTextContent('# Custom Secrets');
    expect(preview).toHaveTextContent('*.private-key');
    expect(preview).toHaveTextContent('credentials.json');
  });

  it('resets all selected templates when Reset All is clicked', () => {
    render(<GitignoreGenerator />);

    const resetBtn = screen.getByTitle('Deselect all templates');
    fireEvent.click(resetBtn);

    expect(screen.getByText(/Selected Templates \(0\):/i)).toBeInTheDocument();
    expect(screen.getByText(/No templates selected/i)).toBeInTheDocument();
  });

  it('allows clicking download button without errors when content exists', () => {
    render(<GitignoreGenerator />);

    const clickSpy = vi.spyOn(HTMLAnchorElement.prototype, 'click').mockImplementation(() => {});
    const downloadBtn = screen.getByTitle('Download .gitignore file');
    expect(downloadBtn).not.toBeDisabled();
    fireEvent.click(downloadBtn);

    expect(clickSpy).toHaveBeenCalled();
    clickSpy.mockRestore();
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

  it('provides accessible roles and state attributes for view mode toggles', () => {
    render(<MarkdownPreview />);
    const splitBtn = screen.getByRole('button', { name: /split view/i });
    const editorBtn = screen.getByRole('button', { name: /editor only/i });
    const previewBtn = screen.getByRole('button', { name: /preview only/i });

    expect(splitBtn).toHaveAttribute('aria-pressed', 'true');
    expect(editorBtn).toHaveAttribute('aria-pressed', 'false');
    expect(previewBtn).toHaveAttribute('aria-pressed', 'false');

    fireEvent.click(editorBtn);
    expect(editorBtn).toHaveAttribute('aria-pressed', 'true');
    expect(splitBtn).toHaveAttribute('aria-pressed', 'false');
  });
});

describe('CommandPalette Component', () => {
  it('does not render when isOpen is false', () => {
    const { container } = render(
      <CommandPalette isOpen={false} onClose={vi.fn()} onSelectTool={vi.fn()} />
    );
    expect(container.firstChild).toBeNull();
  });

  it('renders input and focuses on open when isOpen is true', async () => {
    render(<CommandPalette isOpen={true} onClose={vi.fn()} onSelectTool={vi.fn()} />);

    const input = screen.getByRole('textbox', { name: /search tools palette/i });
    expect(input).toBeInTheDocument();

    await waitFor(() => {
      expect(document.activeElement).toBe(input);
    });
  });

  it('filters tool list based on search query', () => {
    render(<CommandPalette isOpen={true} onClose={vi.fn()} onSelectTool={vi.fn()} />);

    const input = screen.getByRole('textbox', { name: /search tools palette/i });
    fireEvent.change(input, { target: { value: 'diff' } });

    expect(screen.getByText('JSON Comparison')).toBeInTheDocument();
    expect(screen.queryByText('Markdown Preview')).not.toBeInTheDocument();
  });

  it('navigates search results with keyboard arrows and selects with Enter', () => {
    const mockSelect = vi.fn();
    const mockClose = vi.fn();

    render(
      <CommandPalette isOpen={true} onClose={mockClose} onSelectTool={mockSelect} />
    );

    // Arrow down to highlight next item
    fireEvent.keyDown(window, { key: 'ArrowDown' });
    fireEvent.keyDown(window, { key: 'Enter' });

    expect(mockSelect).toHaveBeenCalled();
    expect(mockClose).toHaveBeenCalled();
  });

  it('closes on Escape key press', () => {
    const mockClose = vi.fn();
    render(<CommandPalette isOpen={true} onClose={mockClose} onSelectTool={vi.fn()} />);

    fireEvent.keyDown(window, { key: 'Escape' });
    expect(mockClose).toHaveBeenCalledTimes(1);
  });

  it('closes when clicking the backdrop overlay', () => {
    const mockClose = vi.fn();
    const { container } = render(
      <CommandPalette isOpen={true} onClose={mockClose} onSelectTool={vi.fn()} />
    );

    const backdrop = container.firstChild as HTMLElement;
    fireEvent.click(backdrop);

    expect(mockClose).toHaveBeenCalledTimes(1);
  });
});

describe('App Integration', () => {
  it('renders workspace overview by default and lists tools', () => {
    render(<App />);

    expect(screen.getAllByText('Workspace Overview').length).toBeGreaterThanOrEqual(1);
    expect(screen.getByRole('heading', { name: 'DevKit Forge' })).toBeInTheDocument();
    expect(screen.getByRole('heading', { name: 'JSON Formatter' })).toBeInTheDocument();
  });

  it('navigates into a tool workspace when selected and returns to overview via breadcrumb', () => {
    render(<App />);

    const jsonCard = screen.getByRole('heading', { name: 'JSON Formatter' });
    fireEvent.click(jsonCard);

    // Formatter tool input is now active
    expect(screen.getByLabelText(/raw input json/i)).toBeInTheDocument();

    // Click breadcrumb to return to overview
    const workspaceBreadcrumb = screen.getByRole('button', { name: /^workspace$/i });
    fireEvent.click(workspaceBreadcrumb);

    expect(screen.getByRole('heading', { name: 'DevKit Forge' })).toBeInTheDocument();
  });

  it('switches themes and toggles document classes', () => {
    render(<App />);

    const themeToggle = screen.getByLabelText('Toggle visual theme');
    expect(themeToggle).toBeInTheDocument();

    // Initial theme is dark
    expect(document.documentElement.classList.contains('dark')).toBe(true);

    // Switch theme
    fireEvent.click(themeToggle);
    expect(document.documentElement.classList.contains('dark')).toBe(false);
  });

  it('opens and closes command palette via Ctrl+K and Escape keyboard shortcuts', () => {
    render(<App />);

    expect(screen.queryByRole('textbox', { name: /search tools palette/i })).not.toBeInTheDocument();

    // Press Ctrl+K to open
    fireEvent.keyDown(window, { key: 'k', ctrlKey: true });
    expect(screen.getByRole('textbox', { name: /search tools palette/i })).toBeInTheDocument();

    // Press Escape to close
    fireEvent.keyDown(window, { key: 'Escape' });
    expect(screen.queryByRole('textbox', { name: /search tools palette/i })).not.toBeInTheDocument();
  });

  it('opens mobile sidebar drawer on toggle', () => {
    render(<App />);

    const mobileToggle = screen.getByTitle('Toggle Sidebar Navigation');
    fireEvent.click(mobileToggle);

    const sidebar = screen.getByRole('complementary');
    expect(sidebar).toHaveClass('translate-x-0');
  });

  it('provides accessible names on mobile toggle and header actions', () => {
    render(<App />);
    expect(screen.getByRole('button', { name: /toggle sidebar navigation/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /toggle visual theme/i })).toBeInTheDocument();
  });
});
