import React from 'react';

export type ToolCategory = 'all' | 'json' | 'regex' | 'encoding' | 'security' | 'git' | 'documentation';

export interface ToolMetadata {
  id: string;
  title: string;
  shortDescription: string;
  category: ToolCategory;
  tags: string[];
  icon: React.ComponentType<{ className?: string }>;
  component: React.ComponentType;
  featured?: boolean;
}

export interface JsonValidationResult {
  isValid: boolean;
  error?: string;
  line?: number;
  column?: number;
  snippet?: string;
  stats?: {
    type: 'object' | 'array' | 'primitive';
    sizeBytes: number;
    keyCount: number;
    depth: number;
  };
}

export interface JsonDiffEntry {
  path: string;
  type: 'added' | 'removed' | 'modified' | 'unchanged';
  oldValue?: unknown;
  newValue?: unknown;
}

export interface RegexMatchGroup {
  name?: string;
  value: string;
  start: number;
  end: number;
}

export interface RegexMatchResult {
  fullMatch: string;
  index: number;
  length: number;
  groups: RegexMatchGroup[];
}

export interface GitignoreTemplate {
  id: string;
  name: string;
  category: 'Languages' | 'Frameworks' | 'Operating Systems' | 'Editors & IDEs';
  description: string;
  content: string;
}
