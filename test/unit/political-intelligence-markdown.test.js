// SPDX-FileCopyrightText: 2024-2026 Hack23 AB
// SPDX-License-Identifier: Apache-2.0

/**
 * Unit tests for `Generators/PoliticalIntelligence/Markdown` — the
 * pure parsing helpers (`stripLeadingEmoji`, `extractH1Title`,
 * `humanize`, `parseMarkdownMeta`).
 *
 * These functions previously lived only inside `political-intelligence.ts`
 * and were tested indirectly via the page-rendering integration test;
 * this suite gives them direct unit coverage so future edits to the
 * emoji-stripping or H1 extraction don't regress silently.
 */

import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import {
  stripLeadingEmoji,
  extractH1Title,
  humanize,
  parseMarkdownMeta,
} from '../../scripts/generators/political-intelligence/markdown.js';

describe('stripLeadingEmoji', () => {
  it('returns plain text unchanged', () => {
    expect(stripLeadingEmoji('Risk Scoring')).toBe('Risk Scoring');
  });

  it('strips a single leading emoji and surrounding whitespace', () => {
    expect(stripLeadingEmoji('🚀 Launch Plan')).toBe('Launch Plan');
  });

  it('strips multiple leading emoji repeatedly', () => {
    expect(stripLeadingEmoji('🚀 ⚠️ Risk Scoring')).toBe('Risk Scoring');
  });

  it('handles ZWJ sequences (e.g. 👨‍💻)', () => {
    expect(stripLeadingEmoji('👨\u200d💻 Engineering')).toBe('Engineering');
  });

  it('does not strip emoji from the middle of the heading', () => {
    expect(stripLeadingEmoji('Roadmap 🚀 2026')).toBe('Roadmap 🚀 2026');
  });

  it('returns empty string when the input is only emoji', () => {
    expect(stripLeadingEmoji('🚀 ⚠️')).toBe('');
  });

  it('returns empty string when the input is empty', () => {
    expect(stripLeadingEmoji('')).toBe('');
  });
});

describe('extractH1Title', () => {
  it('returns the first H1 heading', () => {
    const lines = ['# Hello World', 'Some paragraph.'];
    expect(extractH1Title(lines, 'fallback')).toBe('Hello World');
  });

  it('strips a leading emoji from the H1', () => {
    const lines = ['# 🚀 Launch'];
    expect(extractH1Title(lines, 'fallback')).toBe('Launch');
  });

  it('returns the fallback when no H1 is present', () => {
    const lines = ['## Subhead', 'Body.'];
    expect(extractH1Title(lines, 'My Fallback')).toBe('My Fallback');
  });

  it('skips lines until it finds the first H1', () => {
    const lines = ['<!-- comment -->', '', '# The Title', '## Sub', '# Second H1'];
    expect(extractH1Title(lines, 'fallback')).toBe('The Title');
  });

  it('does not treat ## as an H1', () => {
    const lines = ['## Not H1', '# Real H1'];
    expect(extractH1Title(lines, 'fallback')).toBe('Real H1');
  });
});

describe('humanize', () => {
  it('replaces dashes with spaces', () => {
    expect(humanize('per-artifact-methodologies')).toBe('Per Artifact Methodologies');
  });

  it('replaces underscores with spaces', () => {
    expect(humanize('foo_bar_baz')).toBe('Foo Bar Baz');
  });

  it('handles mixed separators', () => {
    expect(humanize('foo-bar_baz')).toBe('Foo Bar Baz');
  });

  it('collapses runs of separators into a single space', () => {
    expect(humanize('foo--bar')).toBe('Foo Bar');
  });

  it('title-cases the first letter of each word', () => {
    expect(humanize('hello-world')).toBe('Hello World');
  });

  it('returns empty for empty input', () => {
    expect(humanize('')).toBe('');
  });
});

describe('parseMarkdownMeta', () => {
  let tmpDir;

  beforeAll(() => {
    tmpDir = fs.mkdtempSync(path.join(os.tmpdir(), 'parseMd-'));
    fs.writeFileSync(
      path.join(tmpDir, 'with-h1.md'),
      '# 🚀 The Big Plan\n\nSome body text.',
      'utf-8'
    );
    fs.writeFileSync(path.join(tmpDir, 'no-h1.md'), 'Body only.\n## Subhead\n', 'utf-8');
  });

  afterAll(() => {
    fs.rmSync(tmpDir, { recursive: true, force: true });
  });

  it('returns the H1 as title with leading emoji stripped', () => {
    const meta = parseMarkdownMeta(path.join(tmpDir, 'with-h1.md'), 'with-h1');
    expect(meta.title).toBe('The Big Plan');
    expect(meta.description).toBe('');
  });

  it('falls back to humanized stem when the file has no H1', () => {
    const meta = parseMarkdownMeta(path.join(tmpDir, 'no-h1.md'), 'no-h1');
    expect(meta.title).toBe('No H1');
    expect(meta.description).toBe('');
  });

  it('returns humanized fallback when the file does not exist', () => {
    const meta = parseMarkdownMeta(
      path.join(tmpDir, 'does-not-exist.md'),
      'per-artifact-methodologies'
    );
    expect(meta.title).toBe('Per Artifact Methodologies');
    expect(meta.description).toBe('');
  });

  it('always returns an empty description (curated table is the source of truth)', () => {
    // This is a contract test — political-intelligence renderer relies
    // on this never returning a scraped description, since the curated
    // per-language description table is the single source of truth.
    const meta = parseMarkdownMeta(path.join(tmpDir, 'with-h1.md'), 'with-h1');
    expect(meta.description).toBe('');
  });
});
