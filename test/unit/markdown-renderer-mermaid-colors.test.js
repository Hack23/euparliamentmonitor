// SPDX-FileCopyrightText: 2024-2026 Hack23 AB
// SPDX-License-Identifier: Apache-2.0

/**
 * Unit tests for color-coded Mermaid handling across the aggregator
 * pipeline.
 *
 * Verifies that:
 *  - The `%%{init …themeVariables…}%%` block is preserved as text
 *    inside `<pre class="mermaid">` after `renderMarkdown` — its
 *    contents are HTML-escaped by markdown-it (e.g. `"` → `&quot;`)
 *    but the init keyword, every theme key, and every hex token remain
 *    intact so the client-side Mermaid initialiser can un-escape and
 *    re-parse the block before rendering.
 *  - `classDef`, `class`, and per-node `style` lines survive rendering
 *    (preserved as text; HTML-special characters escaped, hex tokens
 *    intact).
 *  - `dedupMermaid` deduplicates only by full-body hash, so two blocks
 *    that share a diagram body but differ only in `themeVariables` /
 *    color tokens are treated as distinct.
 *  - Two blocks that share an *identical* color-coded body are
 *    deduplicated to a single render and a cross-reference comment.
 *  - The label callback receives the body text so callers can derive
 *    a per-diagram aria-label from the color theme.
 */

import { describe, it, expect } from 'vitest';
import { renderMarkdown } from '../../scripts/aggregator/markdown-renderer.js';
import { dedupMermaid } from '../../scripts/aggregator/clean-artifact.js';

const INIT_BLOCK_BLUE =
  '%%{init: {"theme":"dark","themeVariables":{"primaryColor":"#1565C0","primaryTextColor":"#ffffff"}}}%%';
const INIT_BLOCK_GREEN =
  '%%{init: {"theme":"dark","themeVariables":{"primaryColor":"#2E7D32","primaryTextColor":"#ffffff"}}}%%';

const CLASSDEF_BLOCK = [
  '```mermaid',
  INIT_BLOCK_BLUE,
  'flowchart LR',
  '    A["📥 Input"] --> B["🔬 Analysis"]',
  '    B --> C{"✅ Gate"}',
  '    C -->|Pass| D["🟢 Approve"]',
  '    C -->|Fail| E["🔴 Reject"]',
  '    classDef approve fill:#2E7D32,color:#ffffff,stroke:#0F3F00,stroke-width:3px',
  '    classDef reject fill:#D32F2F,color:#ffffff,stroke:#7F0000,stroke-width:3px',
  '    class D approve',
  '    class E reject',
  '    style A fill:#1565C0,color:#ffffff,stroke:#0A3F7F,stroke-width:2px',
  '    style B fill:#7B1FA2,color:#ffffff,stroke:#4A148C,stroke-width:2px',
  '    style C fill:#FFC107,color:#000000,stroke:#7F6000,stroke-width:2px',
  '```',
].join('\n');

describe('renderMarkdown — mermaid color tokens', () => {
  it('preserves the %%{init …themeVariables…}%% block inside <pre class="mermaid">', () => {
    const { html, mermaidCount } = renderMarkdown(CLASSDEF_BLOCK);
    expect(mermaidCount).toBe(1);
    expect(html).toContain('<pre class="mermaid">');
    // The init block survives — its quotes are HTML-escaped to &quot; but
    // the body and tokens are otherwise intact (mermaid client-side
    // initialiser un-escapes the <pre> body before parsing).
    expect(html).toContain('%%{init:');
    expect(html).toContain('&quot;primaryColor&quot;:&quot;#1565C0&quot;');
    expect(html).toContain('&quot;themeVariables&quot;');
  });

  it('preserves classDef, class, and per-node style lines (color tokens visible as text)', () => {
    const { html } = renderMarkdown(CLASSDEF_BLOCK);
    expect(html).toContain('classDef approve fill:#2E7D32');
    expect(html).toContain('classDef reject fill:#D32F2F');
    expect(html).toContain('class D approve');
    expect(html).toContain('class E reject');
    expect(html).toContain('style A fill:#1565C0');
    expect(html).toContain('style B fill:#7B1FA2');
    expect(html).toContain('style C fill:#FFC107');
  });

  it('escapes HTML-special characters in the body but keeps every hex color token intact', () => {
    const { html } = renderMarkdown(CLASSDEF_BLOCK);
    // Mermaid arrow `-->` contains `>` which is HTML-escaped to `&gt;`
    expect(html).toContain('--&gt;');
    // Every canonical palette hex used in CLASSDEF_BLOCK survives. We
    // upper-case for case-insensitive matching because hex tokens may
    // appear with either case in the source.
    const upper = html.toUpperCase();
    for (const hex of [
      '#1565C0',
      '#2E7D32',
      '#D32F2F',
      '#FFC107',
      '#7B1FA2',
      '#0A3F7F',
      '#0F3F00',
      '#7F0000',
      '#7F6000',
      '#4A148C',
    ]) {
      expect(upper).toContain(hex);
    }
  });

  it('renders multiple distinct color-coded mermaid blocks side by side', () => {
    const md = [
      CLASSDEF_BLOCK,
      '',
      '```mermaid',
      INIT_BLOCK_GREEN,
      'flowchart TB',
      '    X["⚖️ Quadrant"] --> Y["🟢 Outcome"]',
      '    style X fill:#7B1FA2,color:#ffffff',
      '    style Y fill:#2E7D32,color:#ffffff',
      '```',
    ].join('\n');
    const { html, mermaidCount } = renderMarkdown(md);
    expect(mermaidCount).toBe(2);
    // Both figures are emitted
    const figures = html.match(/<figure class="mermaid-figure"/g) ?? [];
    expect(figures.length).toBe(2);
    // Both init themes survive (quotes HTML-escaped in <pre>)
    expect(html).toContain('&quot;primaryColor&quot;:&quot;#1565C0&quot;');
    expect(html).toContain('&quot;primaryColor&quot;:&quot;#2E7D32&quot;');
    // Aria labels are sequential
    expect(html).toContain('aria-label="Mermaid diagram 1"');
    expect(html).toContain('aria-label="Mermaid diagram 2"');
  });
});

describe('dedupMermaid — color-aware semantics', () => {
  it('treats two mermaid blocks with different themeVariables as distinct (no dedup)', () => {
    const block = (init) => ['```mermaid', init, 'flowchart LR', 'A --> B', '```'].join('\n');
    const md = `${block(INIT_BLOCK_BLUE)}\n\n${block(INIT_BLOCK_GREEN)}`;
    const seen = new Set();
    const { md: out, deduped } = dedupMermaid(md, seen);
    expect(deduped).toBe(0);
    expect((out.match(/```mermaid/g) ?? []).length).toBe(2);
    // Both unique color hashes registered
    expect(seen.size).toBe(2);
  });

  it('dedups two identical color-coded blocks (same init + same body) within one document', () => {
    const md = `${CLASSDEF_BLOCK}\n\nprose between\n\n${CLASSDEF_BLOCK}`;
    const seen = new Set();
    const { md: out, deduped } = dedupMermaid(md, seen);
    expect(deduped).toBe(1);
    expect((out.match(/```mermaid/g) ?? []).length).toBe(1);
    expect(out).toMatch(/mermaid block deduplicated/);
  });

  it('shares the seen-hashes set across artifacts so cross-artifact dedup also fires', () => {
    const seen = new Set();
    const first = dedupMermaid(CLASSDEF_BLOCK, seen);
    const second = dedupMermaid(CLASSDEF_BLOCK, seen);
    expect(first.deduped).toBe(0);
    expect(second.deduped).toBe(1);
    expect(seen.size).toBe(1);
  });

  it('treats two blocks that differ only in classDef colors as distinct', () => {
    const blockBlue = [
      '```mermaid',
      'flowchart LR',
      'A --> B',
      'classDef X fill:#1565C0',
      'class A X',
      '```',
    ].join('\n');
    const blockRed = [
      '```mermaid',
      'flowchart LR',
      'A --> B',
      'classDef X fill:#D32F2F',
      'class A X',
      '```',
    ].join('\n');
    const seen = new Set();
    const { md: out, deduped } = dedupMermaid(`${blockBlue}\n\n${blockRed}`, seen);
    expect(deduped).toBe(0);
    expect((out.match(/```mermaid/g) ?? []).length).toBe(2);
    // Both colors must survive — the dedup must NOT have collapsed them
    // into a single colour.
    expect(out).toContain('classDef X fill:#1565C0');
    expect(out).toContain('classDef X fill:#D32F2F');
  });
});

describe('renderMarkdown — mermaid label callback receives color-coded body', () => {
  it('passes the raw body (with init + styles) to the mermaidLabel callback', () => {
    let captured = '';
    renderMarkdown(CLASSDEF_BLOCK, {
      mermaidLabel: (_index, body) => {
        captured = body;
        return 'Color-coded flowchart';
      },
    });
    expect(captured).toContain(INIT_BLOCK_BLUE);
    expect(captured).toContain('classDef approve fill:#2E7D32');
    expect(captured).toContain('style A fill:#1565C0');
  });

  it('uses the custom aria-label on the wrapping <figure>', () => {
    const { html } = renderMarkdown(CLASSDEF_BLOCK, {
      mermaidLabel: () => 'Color-coded flowchart',
    });
    expect(html).toContain('aria-label="Color-coded flowchart"');
  });
});
