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

  it('returns input unchanged when there is no following section heading', () => {
    const html = '<h2 id="section-executive-brief">Executive Brief</h2>\n<p>only section</p>';
    expect(replaceExecutiveBriefSection(html, 'Sammanfattning', '<p>x</p>')).toBe(html);
  });
});
