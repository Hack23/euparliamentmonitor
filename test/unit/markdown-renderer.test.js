// SPDX-FileCopyrightText: 2024-2026 Hack23 AB
// SPDX-License-Identifier: Apache-2.0

/**
 * Unit tests for src/aggregator/markdown-renderer.
 */

import { describe, it, expect } from 'vitest';
import {
  buildMarkdownIt,
  renderMarkdown,
  sanitizeMermaidQuadrantChart,
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

  it('adds loading="lazy" and decoding="async" to images', () => {
    const md = '![Alt text](image.png)';
    const { html } = renderMarkdown(md);
    expect(html).toContain('loading="lazy"');
    expect(html).toContain('decoding="async"');
    expect(html).toContain('alt="Alt text"');
  });

  it('adds lazy loading to multiple images', () => {
    const md = '![First](a.jpg)\n\n![Second](b.jpg)';
    const { html } = renderMarkdown(md);
    const lazyMatches = html.match(/loading="lazy"/g);
    expect(lazyMatches).toHaveLength(2);
    const asyncMatches = html.match(/decoding="async"/g);
    expect(asyncMatches).toHaveLength(2);
  });
});

describe('sanitizeMermaidQuadrantChart', () => {
  it('auto-quotes unquoted x-axis / y-axis / quadrant-N / data-point labels', () => {
    const input = [
      '%%{init:{"theme":"dark"}}%%',
      'quadrantChart',
      '    title Risk Heat Map (Probability vs. Impact)',
      '    x-axis Low Probability --> High Probability',
      '    y-axis Low Impact --> High Impact',
      '    quadrant-1 Critical — Act Now',
      '    quadrant-2 Monitor Closely',
      '    quadrant-3 Low Priority',
      '    quadrant-4 Likely — Manage',
      '    R02 Far-right coalition: [0.60, 0.88]',
    ].join('\n');
    const out = sanitizeMermaidQuadrantChart(input);
    expect(out).toContain('x-axis "Low Probability" --> "High Probability"');
    expect(out).toContain('y-axis "Low Impact" --> "High Impact"');
    expect(out).toContain('quadrant-1 "Critical — Act Now"');
    expect(out).toContain('quadrant-4 "Likely — Manage"');
    expect(out).toContain('"R02 Far-right coalition": [0.60, 0.88]');
    // The %%{init}%% directive is preserved verbatim.
    expect(out).toContain('%%{init:{"theme":"dark"}}%%');
    // The title line accepts em-dashes / parens unquoted in mermaid v11
    // and so is left alone.
    expect(out).toContain('title Risk Heat Map (Probability vs. Impact)');
  });

  it('preserves already-quoted labels byte-for-byte', () => {
    const input = [
      'quadrantChart',
      '    title T',
      '    x-axis "Strongly Opposed" --> "Strongly Supportive"',
      '    y-axis "Low Power" --> "High Power"',
      '    quadrant-1 "🔵 Champions"',
      '    quadrant-2 "🟢 Defenders"',
      '    quadrant-3 "🟠 Critics"',
      '    quadrant-4 "🔴 Sceptics"',
      '    "EPP": [0.7, 0.7]',
    ].join('\n');
    expect(sanitizeMermaidQuadrantChart(input)).toBe(input);
  });

  it('handles mixed quoting (some quoted, some bare)', () => {
    const input = [
      'quadrantChart',
      '    x-axis Low --> "High End"',
      '    y-axis "Low End" --> High',
      '    quadrant-1 A',
      '    quadrant-2 "B C"',
      '    quadrant-3 C',
      '    quadrant-4 D',
      '    R1: [0.5, 0.5]',
    ].join('\n');
    const out = sanitizeMermaidQuadrantChart(input);
    expect(out).toContain('x-axis "Low" --> "High End"');
    expect(out).toContain('y-axis "Low End" --> "High"');
    expect(out).toContain('quadrant-1 "A"');
    expect(out).toContain('quadrant-2 "B C"');
    expect(out).toContain('"R1": [0.5, 0.5]');
  });

  it('returns flowchart / sequence / pie / mindmap content unchanged', () => {
    const flow = 'flowchart LR\nA[Critical — Act] --> B[End]';
    expect(sanitizeMermaidQuadrantChart(flow)).toBe(flow);
    const seq = 'sequenceDiagram\nAlice->>Bob: Crit — Act';
    expect(sanitizeMermaidQuadrantChart(seq)).toBe(seq);
    const pie = 'pie title T\n"A — B": 1\n"C": 2';
    expect(sanitizeMermaidQuadrantChart(pie)).toBe(pie);
    const mind = 'mindmap\nroot\n  Critical — Act';
    expect(sanitizeMermaidQuadrantChart(mind)).toBe(mind);
  });

  it('detects quadrantChart even when preceded by multi-line %%{init}%% directives', () => {
    const input = [
      '%%{init: {',
      '  "theme": "dark",',
      '  "themeVariables": { "quadrant1Fill": "#1565C0" }',
      '}}%%',
      'quadrantChart',
      '    quadrant-1 Critical — Act',
      '    quadrant-2 B',
      '    quadrant-3 C',
      '    quadrant-4 D',
      '    A: [0.5, 0.5]',
    ].join('\n');
    const out = sanitizeMermaidQuadrantChart(input);
    expect(out).toContain('quadrant-1 "Critical — Act"');
    expect(out).toContain('"A": [0.5, 0.5]');
  });

  it('escapes embedded double quotes in labels', () => {
    const input = [
      'quadrantChart',
      '    quadrant-1 He said "hi"',
      '    quadrant-2 B',
      '    quadrant-3 C',
      '    quadrant-4 D',
      '    A: [0.5, 0.5]',
    ].join('\n');
    const out = sanitizeMermaidQuadrantChart(input);
    expect(out).toContain('quadrant-1 "He said \\"hi\\""');
  });

  it('escapes embedded backslashes before double quotes (escape order)', () => {
    // Backslashes must be escaped first; otherwise the second pass
    // would re-process the `\` introduced by the `"` → `\"` rewrite
    // and emit malformed output. Verify both escape passes run in the
    // correct order against an input that contains both characters.
    const input = [
      'quadrantChart',
      '    quadrant-1 path C:\\Users\\file "x"',
      '    quadrant-2 B',
      '    quadrant-3 C',
      '    quadrant-4 D',
      '    A: [0.5, 0.5]',
    ].join('\n');
    const out = sanitizeMermaidQuadrantChart(input);
    // Expected: backslashes doubled to `\\` then quotes escaped to `\"`
    expect(out).toContain('quadrant-1 "path C:\\\\Users\\\\file \\"x\\""');
  });

  it('renderMarkdown emits sanitized quadrantChart bodies', () => {
    const md = [
      '```mermaid',
      'quadrantChart',
      '    title T',
      '    x-axis Low --> High',
      '    y-axis Low --> High',
      '    quadrant-1 Critical — Act Now',
      '    quadrant-2 B',
      '    quadrant-3 C',
      '    quadrant-4 D',
      '    R1 Coalition: [0.5, 0.5]',
      '```',
    ].join('\n');
    const { html, mermaidCount } = renderMarkdown(md);
    expect(mermaidCount).toBe(1);
    // The HTML-escaped body should contain the auto-quoted form.
    expect(html).toContain('x-axis &quot;Low&quot; --&gt; &quot;High&quot;');
    expect(html).toContain('quadrant-1 &quot;Critical — Act Now&quot;');
    expect(html).toContain('&quot;R1 Coalition&quot;: [0.5, 0.5]');
  });
});
