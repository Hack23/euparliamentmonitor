// SPDX-FileCopyrightText: 2024-2026 Hack23 AB
// SPDX-License-Identifier: Apache-2.0

/**
 * Unit tests for src/aggregator/clean-artifact — front-matter strip,
 * banner strip, heading demotion, link rewrite, and mermaid dedup.
 */

import { describe, it, expect } from 'vitest';
import {
  cleanArtifact,
  dedupMermaid,
  demoteHeadings,
  githubBlobUrl,
  resolveLink,
  rewriteLinks,
  stripBanners,
  stripFrontMatter,
  stripSpdxTags,
} from '../../scripts/aggregator/clean-artifact.js';

describe('stripFrontMatter', () => {
  it('removes a leading YAML block', () => {
    const md = '---\ntitle: x\nowner: y\n---\n# Heading\nbody';
    expect(stripFrontMatter(md)).toBe('# Heading\nbody');
  });

  it('ignores a document with no front-matter', () => {
    const md = '# Heading\nbody';
    expect(stripFrontMatter(md)).toBe(md);
  });

  it('only strips the leading block, not later separators', () => {
    const md = '---\ntitle: x\n---\n# H\nsection\n\n---\n\nmore';
    const out = stripFrontMatter(md);
    expect(out).toContain('---');
    expect(out.startsWith('---')).toBe(false);
  });
});

describe('stripBanners', () => {
  it('removes document-owner and shields.io banners with trailing HR', () => {
    const md = [
      '<p align="center">',
      '  <img src="https://hack23.com/icon-192.png" alt="">',
      '</p>',
      '',
      '<p align="center">',
      '  <a href="#"><img src="https://img.shields.io/badge/x-y-z" alt=""></a>',
      '</p>',
      '',
      '**📋 Document Owner:** CEO | **🔄 Review Cycle:** Quarterly',
      '',
      '---',
      '',
      '# Real heading',
      'prose line',
    ].join('\n');
    const { md: cleaned, lines } = stripBanners(md);
    expect(cleaned).toMatch(/^# Real heading/);
    expect(cleaned).toContain('prose line');
    expect(lines).toBeGreaterThan(0);
  });

  it('leaves content-only documents untouched', () => {
    const md = '# Heading\n\nbody\n';
    const { md: cleaned, lines } = stripBanners(md);
    expect(cleaned).toBe(md);
    expect(lines).toBe(0);
  });
});

describe('demoteHeadings', () => {
  it('removes H1 and demotes H2 to H3, H3 to H4', () => {
    const md = '# Title\n\n## Section\n\n### Sub\n\n#### Deep';
    const { md: out, h1Count } = demoteHeadings(md);
    expect(h1Count).toBe(1);
    expect(out).not.toMatch(/^# /m);
    expect(out).toMatch(/^### Section/m);
    expect(out).toMatch(/^#### Sub/m);
    expect(out).toMatch(/^##### Deep/m);
  });

  it('preserves headings inside fenced code blocks', () => {
    const md = '# Title\n\n```\n# Not a heading\n## Still not\n```\n\n## Real';
    const { md: out } = demoteHeadings(md);
    expect(out).toContain('# Not a heading');
    expect(out).toContain('## Still not');
    expect(out).toMatch(/^### Real$/m);
  });

  it('handles H6 by clamping at H6 (no H7)', () => {
    const md = '###### Already deep';
    const { md: out } = demoteHeadings(md);
    expect(out).toMatch(/^###### Already deep/);
  });

  it('drops setext H1 (underline form)', () => {
    const md = 'Title\n=====\n\n## Section';
    const { md: out, h1Count } = demoteHeadings(md);
    expect(h1Count).toBe(1);
    expect(out).not.toContain('=====');
    expect(out).toMatch(/^### Section/m);
  });
});

describe('resolveLink + rewriteLinks', () => {
  it('converts relative .md targets to GitHub blob URLs', () => {
    const artifactPath =
      'analysis/daily/2026-01-15/breaking/intelligence/synthesis-summary.md';
    const url = resolveLink('../classification/actor-mapping.md', artifactPath, false);
    expect(url).toBe(
      githubBlobUrl(
        'analysis/daily/2026-01-15/breaking/classification/actor-mapping.md'
      )
    );
  });

  it('preserves absolute URLs', () => {
    expect(resolveLink('https://example.com/a', 'x.md', false)).toBe(
      'https://example.com/a'
    );
  });

  it('preserves anchors', () => {
    expect(resolveLink('#section', 'x.md', false)).toBe('#section');
  });

  it('preserves mailto and tel', () => {
    expect(resolveLink('mailto:info@example.com', 'x.md', false)).toBe(
      'mailto:info@example.com'
    );
    expect(resolveLink('tel:+1234', 'x.md', false)).toBe('tel:+1234');
  });

  it('rewrites inline link in prose line', () => {
    const md = 'See [coalition dynamics](../intelligence/coalition-dynamics.md) for more.';
    const out = rewriteLinks(
      md,
      'analysis/daily/2026-01-15/breaking/risk-scoring/risk-matrix.md'
    );
    expect(out).toContain(
      'https://github.com/Hack23/euparliamentmonitor/blob/main/analysis/daily/2026-01-15/breaking/intelligence/coalition-dynamics.md'
    );
  });

  it('leaves links inside fenced code blocks alone', () => {
    const md = '```\n[foo](./relative.md)\n```\n\n[bar](./other.md)';
    const out = rewriteLinks(md, 'analysis/daily/x/y/a.md');
    expect(out).toContain('[foo](./relative.md)');
    expect(out).toContain('other.md');
  });

  it('preserves link title attribute', () => {
    const md = '[x](./y.md "A title")';
    const out = rewriteLinks(md, 'analysis/daily/x/y/a.md');
    expect(out).toContain('"A title"');
  });
});

describe('dedupMermaid', () => {
  it('replaces duplicate mermaid blocks with a cross-reference comment', () => {
    const md = [
      '```mermaid',
      'graph LR',
      '  A --> B',
      '```',
      '',
      'prose',
      '',
      '```mermaid',
      'graph LR',
      '  A --> B',
      '```',
    ].join('\n');
    const seen = new Set();
    const { md: out, deduped } = dedupMermaid(md, seen);
    expect(deduped).toBe(1);
    expect(out).toMatch(/mermaid block deduplicated/);
    const occurrences = out.match(/```mermaid/g) ?? [];
    expect(occurrences.length).toBe(1);
  });

  it('keeps distinct mermaid blocks', () => {
    const md =
      '```mermaid\ngraph LR\n  A --> B\n```\n\n```mermaid\ngraph TB\n  X --> Y\n```';
    const seen = new Set();
    const { md: out, deduped } = dedupMermaid(md, seen);
    expect(deduped).toBe(0);
    expect(out.match(/```mermaid/g)?.length).toBe(2);
  });
});

describe('stripSpdxTags', () => {
  it('removes italicised SPDX footer lines (markdown-it would otherwise emit <em>…</em></p> and break REUSE)', () => {
    // REUSE-IgnoreStart
    const md = [
      '# Heading',
      '',
      'Body.',
      '',
      '---',
      '',
      '*Generated: 2 April 2026 | Classification: PUBLIC*',
      '*SPDX-License-Identifier: Apache-2.0*',
    ].join('\n');
    // REUSE-IgnoreEnd
    const { md: out, lines } = stripSpdxTags(md);
    expect(lines).toBe(1);
    expect(out).not.toContain('SPDX-License-Identifier');
    expect(out).toContain('# Heading');
    expect(out).toContain('Classification: PUBLIC');
  });

  it('strips HTML-comment SPDX headers and FileCopyrightText lines', () => {
    // REUSE-IgnoreStart
    const md = [
      '<!-- SPDX-FileCopyrightText: 2024-2026 Hack23 AB -->',
      '<!-- SPDX-License-Identifier: Apache-2.0 -->',
      '',
      '# Heading',
    ].join('\n');
    // REUSE-IgnoreEnd
    const { md: out, lines } = stripSpdxTags(md);
    expect(lines).toBe(2);
    expect(out).not.toMatch(/SPDX-/);
    expect(out).toContain('# Heading');
  });

  it('is a no-op when no SPDX tag is present', () => {
    const md = '# Heading\n\nBody.\n';
    const { md: out, lines } = stripSpdxTags(md);
    expect(lines).toBe(0);
    expect(out).toBe(md);
  });
});

describe('cleanArtifact end-to-end', () => {
  it('applies every pass and returns deterministic output', () => {
    const md = [
      '---',
      'title: x',
      '---',
      '',
      '<p align="center"><img src="https://hack23.com/icon.png" alt=""></p>',
      '',
      '**📋 Document Owner:** CEO',
      '',
      '---',
      '',
      '# Original H1',
      '',
      '## Section',
      '',
      'See [other](./other.md).',
      '',
      '```mermaid',
      'graph LR\nA-->B',
      '```',
    ].join('\n');
    const result = cleanArtifact(md, {
      artifactRelPath: 'analysis/daily/2026-01-15/breaking/intelligence/x.md',
    });
    expect(result.strippedH1s).toBeGreaterThanOrEqual(1);
    expect(result.strippedBannerLines).toBeGreaterThan(0);
    expect(result.markdown.startsWith('---')).toBe(false);
    expect(result.markdown).not.toContain('Document Owner');
    expect(result.markdown).not.toMatch(/^# Original H1/m);
    expect(result.markdown).toMatch(/^### Section/m);
    expect(result.markdown).toContain(
      'https://github.com/Hack23/euparliamentmonitor/blob/main/analysis/daily/2026-01-15/breaking/intelligence/other.md'
    );
    expect(result.markdown).toContain('```mermaid');
  });

  it('also strips SPDX footer lines via the cleanArtifact pipeline', () => {
    // REUSE-IgnoreStart
    const md = [
      '# Heading',
      '',
      'Body.',
      '',
      '*SPDX-License-Identifier: Apache-2.0*',
    ].join('\n');
    // REUSE-IgnoreEnd
    const result = cleanArtifact(md, {
      artifactRelPath: 'analysis/daily/2026-01-15/breaking/intelligence/x.md',
    });
    expect(result.markdown).not.toContain('SPDX-License-Identifier');
  });

  it('shares mermaid dedup state across two invocations', () => {
    const md = '```mermaid\ngraph LR\nA-->B\n```';
    const seen = new Set();
    const first = cleanArtifact(md, {
      artifactRelPath: 'analysis/daily/x/y/first.md',
      seenMermaidHashes: seen,
    });
    const second = cleanArtifact(md, {
      artifactRelPath: 'analysis/daily/x/y/second.md',
      seenMermaidHashes: seen,
    });
    expect(first.dedupedMermaidBlocks).toBe(0);
    expect(second.dedupedMermaidBlocks).toBe(1);
  });
});
