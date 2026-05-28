// SPDX-FileCopyrightText: 2024-2026 Hack23 AB
// SPDX-License-Identifier: Apache-2.0

import { describe, it, expect } from 'vitest';
import { applyReaderFriendlyTransform } from '../../scripts/aggregator/reader-friendly-transform.js';

describe('reader-friendly-transform', () => {
  it('expands Admiralty grades on first occurrence only', () => {
    const html = '<p>Admiralty A1 supports this finding. Later we still cite Admiralty A1.</p>';
    const out = applyReaderFriendlyTransform(html);
    expect(out).toContain('data-admiralty-grade="A1"');
    expect(out).toContain('Source: Official EP records (highest reliability)');
    expect(out).toContain('Later we still cite Admiralty A1.');
  });

  it('expands Admiralty ranges and normalizes implied ranges to a single grade key', () => {
    const explicit = applyReaderFriendlyTransform('<p>Admiralty B2-B3 reporting confirms.</p>');
    expect(explicit).toContain('data-admiralty-grade="B2-B3"');
    expect(explicit).toContain('Source: Multi-source reporting (moderate reliability)');

    const implied = applyReaderFriendlyTransform('<p>Admiralty B2-3 reporting confirms.</p>');
    expect(implied).toContain('data-admiralty-grade="B2-B3"');
  });

  it('adds natural-language wording for first WEP band usage', () => {
    const out = applyReaderFriendlyTransform('<p>WEP: Highly Likely (85–95%)</p>');
    expect(out).toContain('highly likely (WEP: 85–95%)');
    expect(out).toContain('data-wep-band="HIGHLYLIKELY"');
  });

  it('linkifies EP adopted-text references', () => {
    const out = applyReaderFriendlyTransform('<p>See TA-10-2026-0183 for the formal text.</p>');
    expect(out).toContain(
      'href="https://www.europarl.europa.eu/doceo/document/TA-10-2026-0183_EN.html"'
    );
    expect(out).toContain('>TA-10-2026-0183<');
  });

  it('injects <abbr> for first acronym usage', () => {
    const out = applyReaderFriendlyTransform('<p>BLUF: First sentence. BLUF appears again later.</p>');
    expect(out).toContain('<abbr title="Bottom Line Up Front">BLUF</abbr>:');
    expect(out).toContain('BLUF appears again later.');
  });

  it('contextualizes internal pipeline markers in public text', () => {
    const out = applyReaderFriendlyTransform(
      '<p>This run entered degraded-feeds mode and flagged KB-ESTIMATE.</p>'
    );
    expect(out).toContain('limited-source mode');
    expect(out).toContain('analysis estimate');
    expect(out).not.toContain('degraded-feeds');
    expect(out).not.toContain('degraded-feeds mode');
    expect(out).not.toContain('KB-ESTIMATE');
  });

  it('injects a collapsible "How to read this analysis" glossary in the reader guide section', () => {
    const html = [
      '<section id="reader-intelligence-guide">',
      '<h2 id="reader-intelligence-guide-heading">Reader Intelligence Guide</h2>',
      '<p>Guide body</p>',
      '</section>',
    ].join('');
    const out = applyReaderFriendlyTransform(html);
    expect(out).toContain('id="reader-friendly-glossary"');
    expect(out).toContain('<summary>How to read this analysis</summary>');
  });

  it('is idempotent when run multiple times', () => {
    const html =
      '<section id="reader-intelligence-guide"><h2 id="reader-intelligence-guide-heading">Reader Intelligence Guide</h2><p>BLUF and Admiralty A1 with WEP: Highly Likely (85–95%) plus TA-10-2026-0183 and degraded-feeds mode KB-ESTIMATE.</p></section>';
    const once = applyReaderFriendlyTransform(html);
    const twice = applyReaderFriendlyTransform(once);
    expect(twice).toBe(once);
  });
});
