// SPDX-FileCopyrightText: 2024-2026 Hack23 AB
// SPDX-License-Identifier: Apache-2.0

/**
 * Unit tests for src/aggregator/markdown-renderer.
 */

import { describe, it, expect } from 'vitest';
import {
  buildMarkdownIt,
  renderMarkdown,
  slugify,
  stripMarkdownFrontMatter,
} from '../../scripts/aggregator/markdown-renderer.js';

describe('slugify', () => {
  it('lowercases, strips punctuation, replaces spaces with dashes', () => {
    expect(slugify('Executive Brief — Test')).toBe('executive-brief-test');
  });

  it('preserves unicode letters and digits', () => {
    expect(slugify('Évaluation 2026')).toContain('2026');
    expect(slugify('Évaluation 2026')).toMatch(/2026/);
  });

  it('returns empty string for a punctuation-only input', () => {
    expect(slugify('???')).toBe('');
  });
});

describe('buildMarkdownIt', () => {
  it('returns a markdown-it instance with html enabled', () => {
    const md = buildMarkdownIt();
    expect(typeof md.render).toBe('function');
    expect(md.options.html).toBe(true);
  });
});

describe('renderMarkdown', () => {
  it('strips Jekyll YAML front matter before rendering the body', () => {
    const markdown = '---\ntitle: "Example"\nlayout: article\n---\n\n## Body\n\nText.';
    const { html } = renderMarkdown(markdown);
    expect(html).not.toContain('layout: article');
    expect(html).toContain('<h2');
    expect(html).toContain('Body');
    expect(stripMarkdownFrontMatter(markdown)).toMatch(/^## Body/);
  });

  it('renders headings with stable anchor ids', () => {
    const { html, toc } = renderMarkdown('# Title\n\n## Section One\n\n### Sub');
    expect(html).toContain('<h1>');
    expect(html).toContain('<h2');
    expect(html).toContain('id="section-one"');
    expect(html).toContain('id="sub"');
    // TOC skips H1 and captures H2/H3
    expect(toc.find((e) => e.slug === 'section-one')).toBeDefined();
    expect(toc.find((e) => e.slug === 'sub')).toBeDefined();
  });

  it('converts ```mermaid fences into <pre class="mermaid"> in a labelled figure', () => {
    const { html, mermaidCount } = renderMarkdown(
      '```mermaid\ngraph LR\n  A --> B\n```'
    );
    expect(mermaidCount).toBe(1);
    expect(html).toContain('<figure class="mermaid-figure"');
    expect(html).toContain('role="img"');
    expect(html).toContain('aria-label="Mermaid diagram 1"');
    expect(html).toContain('<pre class="mermaid">');
    expect(html).toContain('graph LR');
  });

  it('does not inject any inline <script> tags', () => {
    const { html } = renderMarkdown(
      '# x\n\n```mermaid\ngraph LR\n  A --> B\n```\n\nparagraph'
    );
    expect(html).not.toMatch(/<script/i);
  });

  it('wraps tables in a scrollable region', () => {
    const md = '| A | B |\n|---|---|\n| 1 | 2 |';
    const { html } = renderMarkdown(md);
    expect(html).toContain('<div class="table-scroll"');
    expect(html).toContain('<table>');
  });

  it('renders standard code fences without modification', () => {
    const { html } = renderMarkdown('```js\nconst x = 1;\n```');
    expect(html).toContain('<pre><code');
    expect(html).toContain('const x = 1;');
  });

  it('accepts a custom mermaidLabel callback via options', () => {
    const { html } = renderMarkdown('```mermaid\ngraph LR\nA-->B\n```', {
      mermaidLabel: (i, body) => `Graph ${i} about ${body.split(' ')[0]}`,
    });
    expect(html).toContain('Graph 0');
  });

  it('preserves footnotes', () => {
    const md = 'See [^1] note.\n\n[^1]: Source: EP.';
    const { html } = renderMarkdown(md);
    expect(html).toContain('class="footnote-ref"');
    expect(html).toContain('Source: EP.');
  });

  it('escapes uppercase placeholder pseudo-tags while preserving trusted HTML wrappers', () => {
    const md = '<section class="analysis-panel">Run <N> Validation Against Remediation</section>';
    const { html } = renderMarkdown(md);
    expect(html).toContain('<section class="analysis-panel">');
    expect(html).toContain('Run &lt;N&gt; Validation Against Remediation');
  });
});
