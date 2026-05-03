// SPDX-FileCopyrightText: 2024-2026 Hack23 AB
// SPDX-License-Identifier: Apache-2.0

/**
 * Unit tests for `src/aggregator/key-takeaways` — bullet harvesting,
 * Jaccard near-duplicate dedupe, and rendered Markdown block.
 */

import { describe, it, expect } from 'vitest';
import fs from 'fs';
import os from 'os';
import path from 'path';
import {
  buildKeyTakeaways,
  dedupeTakeaways,
  extractStrongBullets,
  harvestCandidates,
  jaccardSimilarity,
  KEY_TAKEAWAYS_SECTION_ID,
  KEY_TAKEAWAYS_SECTION_TITLE,
  MIN_TAKEAWAYS,
} from '../../scripts/aggregator/key-takeaways.js';

describe('extractStrongBullets', () => {
  it('prefers bullets under "Top Findings"', () => {
    const md = [
      '## Background',
      '- Filler bullet',
      '## Top Findings',
      '- Trade defence is operative',
      '- Banking union is complete',
      '- Digital omnibus simplifies',
    ].join('\n');
    expect(extractStrongBullets(md)).toEqual([
      'Trade defence is operative',
      'Banking union is complete',
      'Digital omnibus simplifies',
    ]);
  });

  it('falls back to the first body bullets when no preferred section exists', () => {
    const md = ['## Narrative', '- alpha', '- beta', '- gamma'].join('\n');
    expect(extractStrongBullets(md)).toEqual(['alpha', 'beta', 'gamma']);
  });

  it('matches Key Judgments / Headline Findings / BLUF as preferred', () => {
    const md = [
      '## Headline Findings',
      '- one',
      '## Key Judgments',
      '- two',
      '## BLUF',
      '- three',
    ].join('\n');
    expect(extractStrongBullets(md)).toEqual(['one', 'two', 'three']);
  });

  it('skips bullets inside fenced code blocks', () => {
    const md = ['## Top Findings', '```', '- not a bullet', '```', '- real bullet'].join('\n');
    expect(extractStrongBullets(md)).toEqual(['real bullet']);
  });

  it('skips nested bullets', () => {
    const md = ['## Top Findings', '- top', '  - nested', '- top2'].join('\n');
    expect(extractStrongBullets(md)).toEqual(['top', 'top2']);
  });
});

describe('jaccardSimilarity', () => {
  it('returns 1 for identical token sets', () => {
    expect(jaccardSimilarity('Trade defence operational', 'Operational defence trade')).toBe(1);
  });

  it('returns 0 for disjoint token sets', () => {
    expect(jaccardSimilarity('alpha beta', 'gamma delta')).toBe(0);
  });

  it('returns intermediate values for partially overlapping sentences', () => {
    const sim = jaccardSimilarity(
      'Trade defence is operative this week',
      'Trade defence remains operational this week'
    );
    expect(sim).toBeGreaterThan(0);
    expect(sim).toBeLessThan(1);
  });
});

describe('dedupeTakeaways', () => {
  it('drops near-duplicates beyond the Jaccard threshold', () => {
    const out = dedupeTakeaways([
      { body: 'Trade defence is operative', source: 'a.md' },
      { body: 'Trade defence remains operative', source: 'b.md' },
      { body: 'Banking union is complete', source: 'a.md' },
    ]);
    expect(out.map((t) => t.body)).toEqual([
      'Trade defence is operative',
      'Banking union is complete',
    ]);
  });

  it('preserves source ordering — first occurrence wins', () => {
    const out = dedupeTakeaways([
      { body: 'First finding here', source: 'a.md' },
      { body: 'Second finding here', source: 'b.md' },
    ]);
    expect(out[0].source).toBe('a.md');
    expect(out[1].source).toBe('b.md');
  });
});

describe('harvestCandidates + buildKeyTakeaways', () => {
  it('returns empty string when below MIN_TAKEAWAYS', () => {
    const tmp = fs.mkdtempSync(path.join(os.tmpdir(), 'ep-keytakeaways-'));
    try {
      // Only 2 bullets across all sources — below the floor.
      fs.mkdirSync(path.join(tmp, 'intelligence'), { recursive: true });
      fs.writeFileSync(
        path.join(tmp, 'intelligence', 'synthesis-summary.md'),
        '## Top Findings\n- only one\n- only two\n'
      );
      expect(buildKeyTakeaways({ runDir: tmp })).toBe('');
    } finally {
      fs.rmSync(tmp, { recursive: true, force: true });
    }
  });

  it('renders an H2 + bullet block when at least MIN_TAKEAWAYS bullets are available', () => {
    const tmp = fs.mkdtempSync(path.join(os.tmpdir(), 'ep-keytakeaways-'));
    try {
      fs.mkdirSync(path.join(tmp, 'intelligence'), { recursive: true });
      fs.writeFileSync(
        path.join(tmp, 'intelligence', 'synthesis-summary.md'),
        [
          '## Top Findings',
          '- Trade defence is operative this week',
          '- Banking union finalises BRRD3 SRMR3 DGSD2',
          '- Digital omnibus simplifies AI Act compliance',
          '- Energy package returns to Strasbourg',
        ].join('\n')
      );
      const out = buildKeyTakeaways({ runDir: tmp });
      expect(out).toContain(`<h2 id="${KEY_TAKEAWAYS_SECTION_ID}">${KEY_TAKEAWAYS_SECTION_TITLE}</h2>`);
      expect(out).toContain('- Trade defence is operative this week');
      expect(out).toContain('- Banking union finalises BRRD3 SRMR3 DGSD2');
    } finally {
      fs.rmSync(tmp, { recursive: true, force: true });
    }
  });

  it('produces deterministic output across two reads of the same fixture', () => {
    const tmp = fs.mkdtempSync(path.join(os.tmpdir(), 'ep-keytakeaways-'));
    try {
      fs.mkdirSync(path.join(tmp, 'intelligence'), { recursive: true });
      fs.writeFileSync(
        path.join(tmp, 'intelligence', 'synthesis-summary.md'),
        Array.from({ length: 5 }, (_, i) => `- finding number ${i}`).join('\n')
      );
      const a = buildKeyTakeaways({ runDir: tmp });
      const b = buildKeyTakeaways({ runDir: tmp });
      expect(b).toBe(a);
    } finally {
      fs.rmSync(tmp, { recursive: true, force: true });
    }
  });

  it('floors MIN_TAKEAWAYS at 3', () => {
    expect(MIN_TAKEAWAYS).toBe(3);
  });

  it('harvestCandidates returns an empty list when no source files exist', () => {
    const tmp = fs.mkdtempSync(path.join(os.tmpdir(), 'ep-keytakeaways-'));
    try {
      expect(
        harvestCandidates(tmp, ['intelligence/synthesis-summary.md'])
      ).toEqual([]);
    } finally {
      fs.rmSync(tmp, { recursive: true, force: true });
    }
  });
});
