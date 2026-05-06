// SPDX-FileCopyrightText: 2024-2026 Hack23 AB
// SPDX-License-Identifier: Apache-2.0

/**
 * Unit tests for the bounded context public APIs. Validates that each
 * bounded context's index.ts correctly re-exports the expected symbols.
 */

import { describe, it, expect } from 'vitest';

// Artifacts bounded context
import {
  ARTIFACT_SECTIONS,
  MANIFEST_SECTION_ID,
  MANIFEST_SECTION_TITLE,
  SUPPLEMENTARY_SECTION_ID,
  SUPPLEMENTARY_SECTION_TITLE,
  TRADECRAFT_SECTION_ID,
  TRADECRAFT_SECTION_TITLE,
  cleanArtifact,
  dedupMermaid,
  demoteHeadings,
  githubBlobUrl,
  githubRawUrl,
  resolveLink,
  rewriteLinks,
  stripArtifactMetadataPreamble,
  stripBanners,
  stripFrontMatter,
  stripSpdxTags,
} from '../../scripts/aggregator/artifacts/index.js';

// Content bounded context
import {
  extractExecutiveLead,
  extractLeadParagraph,
  trimToLeadSentence,
  MAX_LEAD_CHARS,
  buildKeyTakeaways,
  MIN_TAKEAWAYS,
  MAX_TAKEAWAYS,
  KEY_TAKEAWAYS_SECTION_ID,
  KEY_TAKEAWAYS_SECTION_TITLE,
  buildReaderIntelligenceGuideHtml,
  READER_GUIDE_SECTION_ID,
  READER_GUIDE_SECTION_IDS,
  READER_GUIDE_SECTION_TITLE,
} from '../../scripts/aggregator/content/index.js';

// Markdown bounded context
import {
  buildMarkdownIt,
  renderMarkdown,
} from '../../scripts/aggregator/markdown/index.js';

// Metadata bounded context
import {
  buildArticleMeta,
  resolveArticleMetadata,
  stripInlineMarkdown,
} from '../../scripts/aggregator/metadata/index.js';

describe('artifacts bounded context', () => {
  it('exports ARTIFACT_SECTIONS as a non-empty readonly array', () => {
    expect(Array.isArray(ARTIFACT_SECTIONS)).toBe(true);
    expect(ARTIFACT_SECTIONS.length).toBeGreaterThan(0);
  });

  it('exports section id constants', () => {
    expect(MANIFEST_SECTION_ID).toBeTruthy();
    expect(MANIFEST_SECTION_TITLE).toBeTruthy();
    expect(SUPPLEMENTARY_SECTION_ID).toBeTruthy();
    expect(SUPPLEMENTARY_SECTION_TITLE).toBeTruthy();
    expect(TRADECRAFT_SECTION_ID).toBeTruthy();
    expect(TRADECRAFT_SECTION_TITLE).toBeTruthy();
  });

  it('cleanArtifact sanitizes markdown input', () => {
    const result = cleanArtifact('---\ntitle: test\n---\n# Heading\n\nBody text\n', {
      artifactRelPath: 'analysis/daily/2026-01-15/breaking/test.md',
    });
    expect(result.markdown).not.toContain('---');
    expect(result.markdown).toContain('Body text');
    expect(result.strippedH1s).toBe(1);
  });

  it('stripFrontMatter removes YAML front-matter', () => {
    const input = '---\ntitle: x\n---\n# Hello\n';
    expect(stripFrontMatter(input)).toBe('# Hello\n');
  });

  it('demoteHeadings removes H1 and shifts H2+ down by one level', () => {
    const { md, h1Count } = demoteHeadings('# H1\n## H2\n### H3');
    expect(md).toContain('### H2');
    expect(md).toContain('#### H3');
    expect(h1Count).toBe(1);
  });

  it('githubBlobUrl builds correct URL', () => {
    const url = githubBlobUrl('src/aggregator/index.ts');
    expect(url).toContain('github.com');
    expect(url).toContain('src/aggregator/index.ts');
  });

  it('githubRawUrl builds correct raw URL', () => {
    const url = githubRawUrl('README.md');
    expect(url).toContain('raw.githubusercontent.com');
    expect(url).toContain('README.md');
  });

  it('dedupMermaid deduplicates identical mermaid blocks', () => {
    const seen = new Set();
    const block = '```mermaid\ngraph TD\n  A-->B\n```\n';
    const doubled = block + '\n' + block;
    const { md, deduped } = dedupMermaid(doubled, seen);
    expect(deduped).toBe(1);
    expect(md).toContain('graph TD');
  });

  it('stripBanners removes banner lines', () => {
    const input = '<p align="center">\n  <img src="https://hack23.com/icon-192.png" alt="">\n</p>\n\n# Title\nBody';
    const { md, lines } = stripBanners(input);
    expect(lines).toBeGreaterThan(0);
    expect(md).toContain('Body');
  });

  it('stripSpdxTags removes SPDX comment lines', () => {
    const input = '// SPDX-FileCopyrightText: 2024 Hack23\n// SPDX-License-Identifier: Apache-2.0\n\n# Content';
    const { md } = stripSpdxTags(input);
    expect(md).not.toContain('SPDX');
    expect(md).toContain('# Content');
  });

  it('resolveLink returns correct URL for relative paths', () => {
    const url = resolveLink('./img.png', 'analysis/daily/2026-01-15/run/test.md', false);
    expect(url).toContain('github.com');
  });

  it('rewriteLinks rewrites relative links to absolute', () => {
    const input = '[link](./other.md)';
    const result = rewriteLinks(input, 'analysis/daily/2026-01-15/run/test.md');
    expect(result).toContain('github.com');
  });

  it('stripArtifactMetadataPreamble removes operational metadata', () => {
    const input = '**Run:** something\n**Window:** 2026-01-15\n\n# Real content';
    const { md, lines } = stripArtifactMetadataPreamble(input);
    expect(lines).toBeGreaterThan(0);
    expect(md).toContain('# Real content');
  });
});

describe('content bounded context', () => {
  it('exports MAX_LEAD_CHARS constant', () => {
    expect(MAX_LEAD_CHARS).toBe(320);
  });

  it('exports MIN_TAKEAWAYS and MAX_TAKEAWAYS constants', () => {
    expect(MIN_TAKEAWAYS).toBe(3);
    expect(MAX_TAKEAWAYS).toBe(7);
  });

  it('exports KEY_TAKEAWAYS section constants', () => {
    expect(KEY_TAKEAWAYS_SECTION_ID).toBeTruthy();
    expect(KEY_TAKEAWAYS_SECTION_TITLE).toBe('Key Takeaways');
  });

  it('exports READER_GUIDE section constants', () => {
    expect(READER_GUIDE_SECTION_ID).toBeTruthy();
    expect(READER_GUIDE_SECTION_IDS).toBeTruthy();
    expect(READER_GUIDE_SECTION_TITLE).toBeTruthy();
  });

  it('extractLeadParagraph extracts first paragraph', () => {
    const md = '# Title\n\nFirst paragraph of the article.\n\nSecond paragraph.';
    const lead = extractLeadParagraph(md);
    expect(lead).toContain('First paragraph');
  });

  it('trimToLeadSentence caps at MAX_LEAD_CHARS', () => {
    const long = 'A'.repeat(500) + '. Second sentence.';
    const result = trimToLeadSentence(long);
    expect(result.length).toBeLessThanOrEqual(MAX_LEAD_CHARS);
  });

  it('buildKeyTakeaways returns empty string when sources absent', () => {
    const tmpDir = '/tmp/nonexistent-run-dir-test';
    const result = buildKeyTakeaways({ runDir: tmpDir });
    expect(result).toBe('');
  });

  it('buildReaderIntelligenceGuideHtml is a function', () => {
    expect(typeof buildReaderIntelligenceGuideHtml).toBe('function');
  });
});

describe('markdown bounded context', () => {
  it('buildMarkdownIt returns a markdown-it instance', () => {
    const md = buildMarkdownIt();
    expect(md).toBeDefined();
    expect(typeof md.render).toBe('function');
  });

  it('renderMarkdown converts markdown to HTML', () => {
    const result = renderMarkdown('# Hello\n\nWorld\n');
    expect(result.html).toContain('<h1');
    expect(result.html).toContain('Hello');
    expect(result.html).toContain('<p>World</p>');
  });

  it('renderMarkdown extracts TOC entries from headings', () => {
    const result = renderMarkdown('## Section One\n\n### Subsection\n');
    expect(result.toc.length).toBe(2);
    expect(result.toc[0].level).toBe(2);
    expect(result.toc[0].slug).toBe('section-one');
    expect(result.toc[1].level).toBe(3);
    expect(result.toc[1].slug).toBe('subsection');
  });

  it('renderMarkdown counts mermaid blocks', () => {
    const result = renderMarkdown('```mermaid\ngraph TD\n  A-->B\n```\n');
    expect(result.mermaidCount).toBe(1);
  });
});

describe('metadata bounded context', () => {
  it('stripInlineMarkdown removes bold/italic markers', () => {
    expect(stripInlineMarkdown('**bold** and *italic*')).toBe('bold and italic');
  });

  it('stripInlineMarkdown removes inline links', () => {
    expect(stripInlineMarkdown('[text](url)')).toBe('text');
  });

  it('buildArticleMeta is a function', () => {
    expect(typeof buildArticleMeta).toBe('function');
  });

  it('resolveArticleMetadata is a function', () => {
    expect(typeof resolveArticleMetadata).toBe('function');
  });
});
