// SPDX-FileCopyrightText: 2024-2026 Hack23 AB
// SPDX-License-Identifier: Apache-2.0

/**
 * Unit tests for `replaceExecutiveBriefSection` — the localized brief
 * splicer used in `render-one.ts` to swap the English aggregated brief
 * for a translated `executive-brief_<lang>.md` body on non-English HTML
 * variants.
 */

import { describe, it, expect } from 'vitest';
import { replaceExecutiveBriefSection } from '../../scripts/aggregator/html/localize-body.js';

const SAMPLE = [
  '<h2 id="section-executive-brief">Executive Brief</h2>',
  '<p>Original English summary.</p>',
  '<p>More English content.</p>',
  '<h2 id="section-synthesis">Synthesis Summary</h2>',
  '<p>Synthesis body.</p>',
  '<h2 id="section-risk">Risk Assessment</h2>',
  '<p>Risk body.</p>',
].join('\n');

describe('replaceExecutiveBriefSection', () => {
  it('replaces the executive brief heading text with the localized heading', () => {
    const out = replaceExecutiveBriefSection(SAMPLE, 'Sammanfattning', '<p>Svensk text.</p>');
    expect(out).toContain('<h2 id="section-executive-brief">Sammanfattning</h2>');
    expect(out).not.toContain('Executive Brief</h2>');
  });

  it('swaps the body content between the brief heading and the next H2', () => {
    const out = replaceExecutiveBriefSection(SAMPLE, 'Sammanfattning', '<p>Svensk text.</p>');
    expect(out).toContain('<p>Svensk text.</p>');
    expect(out).not.toContain('Original English summary');
    expect(out).not.toContain('More English content');
  });

  it('preserves later sections (Synthesis, Risk) unchanged', () => {
    const out = replaceExecutiveBriefSection(SAMPLE, 'Sammanfattning', '<p>X</p>');
    expect(out).toContain('<h2 id="section-synthesis">Synthesis Summary</h2>');
    expect(out).toContain('<p>Synthesis body.</p>');
    expect(out).toContain('<h2 id="section-risk">Risk Assessment</h2>');
    expect(out).toContain('<p>Risk body.</p>');
  });

  it('HTML-escapes the localized heading text', () => {
    const out = replaceExecutiveBriefSection(SAMPLE, 'Brief <hax>', '<p>x</p>');
    expect(out).toContain('Brief &lt;hax&gt;');
    expect(out).not.toContain('Brief <hax>');
  });

  it('returns input unchanged when section-executive-brief is missing', () => {
    const html = '<h2 id="section-synthesis">Synthesis Summary</h2>\n<p>body</p>';
    expect(replaceExecutiveBriefSection(html, 'Sammanfattning', '<p>x</p>')).toBe(html);
  });

  it('replaces through end-of-body when the brief is the last block', () => {
    const html = '<h2 id="section-executive-brief">Executive Brief</h2>\n<p>only section</p>';
    const out = replaceExecutiveBriefSection(html, 'Sammanfattning', '<p>Svensk text.</p>');
    expect(out).toContain('<h2 id="section-executive-brief">Sammanfattning</h2>');
    expect(out).toContain('<p>Svensk text.</p>');
    expect(out).not.toContain('only section');
  });

  it('splices the localized brief even when only appendix sections follow (sparse run)', () => {
    // Reproduces a sparse run: the Executive Brief is the last *canonical*
    // `section-` heading and is followed only by the Reader Guide and the
    // Tradecraft / Analysis-Index appendices (whose ids do NOT use the
    // `section-` prefix). The previous implementation bailed here and
    // stranded non-English readers on the English brief.
    const sparse = [
      '<h2 id="section-executive-brief">Executive Brief</h2>',
      '<p>English BLUF.</p>',
      '<h2 id="reader-intelligence-guide">Reader Intelligence Guide</h2>',
      '<p>guide</p>',
      '<h2 id="aggregator-tradecraft-references">Tradecraft References</h2>',
      '<p>tradecraft</p>',
    ].join('\n');
    const out = replaceExecutiveBriefSection(sparse, 'Sammanfattning', '<p>Svensk BLUF.</p>');
    expect(out).toContain('<h2 id="section-executive-brief">Sammanfattning</h2>');
    expect(out).toContain('<p>Svensk BLUF.</p>');
    expect(out).not.toContain('English BLUF');
    // Appendices must survive the splice untouched.
    expect(out).toContain('<h2 id="reader-intelligence-guide">Reader Intelligence Guide</h2>');
    expect(out).toContain('<p>guide</p>');
    expect(out).toContain('<h2 id="aggregator-tradecraft-references">Tradecraft References</h2>');
    expect(out).toContain('<p>tradecraft</p>');
  });

  it('does not treat the brief’s own internal H2 sub-headings as a boundary', () => {
    // The translated brief renders `## BLUF` etc. as `<h2 id="bluf">`
    // (slugified, no `section-` prefix). Those internal sub-headings of the
    // English brief must NOT be mistaken for the next section boundary.
    const withSubheads = [
      '<h2 id="section-executive-brief">Executive Brief</h2>',
      '<h2 id="bluf">BLUF</h2>',
      '<p>English bottom line.</p>',
      '<h2 id="60-second-read">60-Second Read</h2>',
      '<p>English quick read.</p>',
      '<h2 id="section-risk">Risk Assessment</h2>',
      '<p>Risk body.</p>',
    ].join('\n');
    const out = replaceExecutiveBriefSection(withSubheads, 'Sammanfattning', '<p>Svensk text.</p>');
    expect(out).toContain('<p>Svensk text.</p>');
    expect(out).not.toContain('English bottom line');
    expect(out).not.toContain('English quick read');
    expect(out).not.toContain('id="bluf"');
    // The next canonical section is preserved.
    expect(out).toContain('<h2 id="section-risk">Risk Assessment</h2>');
    expect(out).toContain('<p>Risk body.</p>');
  });
});
