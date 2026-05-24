// SPDX-FileCopyrightText: 2024-2026 Hack23 AB
// SPDX-License-Identifier: Apache-2.0

/**
 * Unit tests for the briefing-highlight extractor — covers the
 * `## Strategic Intelligence Summary` and `## Reader Briefing`
 * structural patterns introduced by the May-2026 executive-brief
 * style guide.
 */

import { describe, it, expect } from 'vitest';
import {
  extractBriefingHighlight,
  extractReaderBriefingHighlight,
  extractStrategicSynthesisHighlight,
} from '../../scripts/aggregator/metadata/briefing-highlight.js';

const STRATEGIC_BRIEF = `# Executive Brief

Some intro prose.

## Strategic Intelligence Summary

### The Three-Coalition Paradox

EP10's governing coalition (EPP+S&D+Renew = 398/719) is simultaneously strong enough to pass legislation and internally divided enough to create unpredictable outcomes on key files. The strategic paradox: Renew Europe is the coalition's most centrist member but is also the most hostile to the Mercosur ECJ referral.

### Timeline Intelligence

A different sub-section that should not be picked.
`;

const READER_BRIEFING_BRIEF = `# Executive Brief

## Reader Briefing

1. **Immediate priority**: DMA enforcement — the Article 265 TFEU threat is a latent nuclear option that could reshape EP-Commission relations if activated.
2. **Strategic watch**: Mercosur ECJ timeline.

## Some Other Section

Tail content.
`;

const COMBINED_BRIEF = `${STRATEGIC_BRIEF}

${READER_BRIEFING_BRIEF}`;

const PROSE_READER_BRIEF = `# Executive Brief

## Reader Briefing (Plain Language)

The week ahead centres on the DMA enforcement procedure and the Mercosur ECJ referral. Both files test the strength of the governing coalition.

## Tail

end.
`;

describe('extractStrategicSynthesisHighlight', () => {
  it('lifts the first ### sub-heading and its paragraph as headline/summary', () => {
    const out = extractStrategicSynthesisHighlight(STRATEGIC_BRIEF);
    expect(out).not.toBeNull();
    expect(out?.headline).toBe('The Three-Coalition Paradox');
    expect(out?.summary).toContain("EP10's governing coalition");
    expect(out?.summary.length).toBeGreaterThan(80);
  });

  it('returns null when the section is absent', () => {
    expect(extractStrategicSynthesisHighlight('# Title\n\nNothing.\n')).toBeNull();
  });

  it('does not bleed prose from a later ## section', () => {
    const out = extractStrategicSynthesisHighlight(STRATEGIC_BRIEF);
    expect(out?.summary).not.toContain('Timeline Intelligence');
  });
});

describe('extractReaderBriefingHighlight', () => {
  it('extracts the first numbered list item with its bold label', () => {
    const out = extractReaderBriefingHighlight(READER_BRIEFING_BRIEF);
    expect(out).not.toBeNull();
    expect(out?.headline).toContain('Immediate priority');
    expect(out?.headline).toContain('DMA enforcement');
  });

  it('does not pick the second list item', () => {
    const out = extractReaderBriefingHighlight(READER_BRIEFING_BRIEF);
    expect(out?.headline).not.toContain('Strategic watch');
  });

  it('falls back to the prose paragraph when no numbered list is present', () => {
    const out = extractReaderBriefingHighlight(PROSE_READER_BRIEF);
    expect(out).not.toBeNull();
    expect(out?.summary).toContain('DMA enforcement procedure');
    expect(out?.headline).toContain('DMA enforcement procedure');
  });

  it('returns null when neither numbered list nor prose paragraph exists', () => {
    expect(extractReaderBriefingHighlight('# Title\n\nNo briefing.\n')).toBeNull();
  });
});

describe('extractBriefingHighlight (combined)', () => {
  it('prefers Strategic Intelligence Summary headline + paragraph', () => {
    const out = extractBriefingHighlight(COMBINED_BRIEF);
    expect(out?.headline).toBe('The Three-Coalition Paradox');
    expect(out?.summary).toContain("EP10's governing coalition");
  });

  it('falls back to Reader Briefing when Strategic Intelligence Summary is missing', () => {
    const out = extractBriefingHighlight(READER_BRIEFING_BRIEF);
    expect(out?.headline).toContain('Immediate priority');
  });

  it('returns null when neither section exists', () => {
    expect(extractBriefingHighlight('# Title\n\nNothing here.\n')).toBeNull();
  });

  it('tolerates emoji-decorated headings (`## 🧭 Strategic Intelligence Summary`)', () => {
    const decorated = STRATEGIC_BRIEF.replace(
      '## Strategic Intelligence Summary',
      '## 🧭 Strategic Intelligence Summary'
    );
    const out = extractBriefingHighlight(decorated);
    expect(out?.headline).toBe('The Three-Coalition Paradox');
  });
});
