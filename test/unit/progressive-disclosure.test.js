// SPDX-FileCopyrightText: 2024-2026 Hack23 AB
// SPDX-License-Identifier: Apache-2.0

import { describe, it, expect } from 'vitest';
import {
  buildLayerReadingTimes,
  estimateReadingMinutes,
  splitBodyIntoDisclosureLayers,
} from '../../scripts/aggregator/article-generator.js';

describe('progressive disclosure reading-time helpers', () => {
  it('computes reading-time minutes using Math.ceil(words / 238)', () => {
    expect(estimateReadingMinutes(1)).toBe(1);
    expect(estimateReadingMinutes(238)).toBe(1);
    expect(estimateReadingMinutes(239)).toBe(2);
    expect(estimateReadingMinutes(476)).toBe(2);
  });

  it('builds cumulative reading-times for quick, full analysis, and complete intelligence', () => {
    const times = buildLayerReadingTimes({ quick: 476, analysis: 238, intelligence: 476 });
    expect(times).toEqual({
      quickRead: 2,
      fullAnalysis: 3,
      completeIntelligence: 5,
    });
  });

  it('assigns sections into the expected disclosure layers', () => {
    const body = [
      '<h2 id="section-executive-brief">Executive Brief</h2><p>quick</p>',
      '<h2 id="section-synthesis">Synthesis</h2><p>analysis</p>',
      '<h2 id="section-threat">Threat</h2><p>intel</p>',
    ].join('\n');
    const result = splitBodyIntoDisclosureLayers(body);
    expect(result.quickHtml).toContain('section-executive-brief');
    expect(result.analysisHtml).toContain('section-synthesis');
    expect(result.intelligenceHtml).toContain('section-threat');
  });
});
