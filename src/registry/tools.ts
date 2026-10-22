import { ToolMetadata } from '../types';
import { JsonFormatter } from '../components/tools/JsonFormatter';
import { JsonMinifier } from '../components/tools/JsonMinifier';
import { JsonValidator } from '../components/tools/JsonValidator';
import { JsonDiff } from '../components/tools/JsonDiff';
import { RegexTester } from '../components/tools/RegexTester';
import { GitignoreGenerator } from '../components/tools/GitignoreGenerator';
import { MarkdownPreview } from '../components/tools/MarkdownPreview';
import {
  FileCode,
  Minimize2,
  ShieldCheck,
  GitCompare,
  Search,
  GitBranch,
  FileText,
} from 'lucide-react';

export const TOOL_REGISTRY: ToolMetadata[] = [
  {
    id: 'json-formatter',
    title: 'JSON Formatter',
    shortDescription: 'Prettify and format JSON with customizable indentation and sorted keys.',
    category: 'json',
    tags: ['json', 'format', 'prettify', 'beautify', 'indent', 'sort-keys'],
    icon: FileCode,
    component: JsonFormatter,
    featured: true,
  },
  {
    id: 'json-minifier',
    title: 'JSON Minifier',
    shortDescription: 'Compress JSON into a single line and inspect compression ratios.',
    category: 'json',
    tags: ['json', 'minify', 'compress', 'strip-whitespace', 'size'],
    icon: Minimize2,
    component: JsonMinifier,
    featured: true,
  },
  {
    id: 'json-validator',
    title: 'JSON Validator',
    shortDescription: 'Inspect JSON syntax with exact line/column error pointers and structure stats.',
    category: 'json',
    tags: ['json', 'validate', 'syntax', 'lint', 'schema', 'depth', 'error-checker'],
    icon: ShieldCheck,
    component: JsonValidator,
    featured: true,
  },
  {
    id: 'json-diff',
    title: 'JSON Comparison',
    shortDescription: 'Compare two JSON structures with deep key-by-key path difference detection.',
    category: 'json',
    tags: ['json', 'diff', 'compare', 'difference', 'delta', 'merge'],
    icon: GitCompare,
    component: JsonDiff,
    featured: true,
  },
  {
    id: 'regex-tester',
    title: 'Regex Tester',
    shortDescription: 'Test regular expressions with real-time match highlighting, flags, and error diagnostics.',
    category: 'regex',
    tags: ['regex', 'regexp', 'regular-expression', 'tester', 'flags', 'highlight', 'capture-groups'],
    icon: Search,
    component: RegexTester,
    featured: true,
  },
  {
    id: 'gitignore-generator',
    title: '.gitignore Generator',
    shortDescription: 'Generate customized .gitignore files using curated local templates without network requests.',
    category: 'git',
    tags: ['git', 'gitignore', 'github', 'templates', 'node', 'python', 'rust', 'go', 'vscode'],
    icon: GitBranch,
    component: GitignoreGenerator,
    featured: true,
  },
  {
    id: 'markdown-preview',
    title: 'Markdown Preview',
    shortDescription: 'Live GitHub Flavored Markdown editor with XSS sanitization and export.',
    category: 'documentation',
    tags: ['markdown', 'preview', 'gfm', 'docs', 'readme', 'editor', 'html-export', 'sanitized'],
    icon: FileText,
    component: MarkdownPreview,
    featured: true,
  },
];

export function getToolById(id: string): ToolMetadata | undefined {
  return TOOL_REGISTRY.find((tool) => tool.id === id);
}

export function searchTools(query: string, category: string = 'all'): ToolMetadata[] {
  const cleanQuery = query.toLowerCase().trim();
  return TOOL_REGISTRY.filter((tool) => {
    const matchesCategory = category === 'all' || tool.category === category;
    if (!matchesCategory) return false;
    if (!cleanQuery) return true;

    return (
      tool.title.toLowerCase().includes(cleanQuery) ||
      tool.shortDescription.toLowerCase().includes(cleanQuery) ||
      tool.tags.some((tag) => tag.toLowerCase().includes(cleanQuery))
    );
  });
}
