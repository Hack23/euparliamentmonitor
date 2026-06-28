// SPDX-FileCopyrightText: 2024-2026 Hack23 AB
// SPDX-License-Identifier: Apache-2.0

/**
 * @module Aggregator/Run/ReaderGuide
 * @description Renders the reader-intelligence guide that appears before
 * artifact sections. Provides a Riksdagsmonitor-style navigation layer
 * tying each canonical section to its reader need and source artifact.
 */

import type { IncludedArtifact, TocSection } from '../reader-guide-constants.js';
import {
  READER_GUIDE_SECTION_ID,
  READER_GUIDE_SECTION_IDS,
  READER_GUIDE_SECTION_TITLE,
} from '../reader-guide-constants.js';

/**
 * English-only reader-guide copy for the Markdown guide embedded in the
 * aggregated source document. Section membership is gated by
 * `READER_GUIDE_SECTION_IDS` (imported from `reader-guide-constants.ts`)
 * so both renderers stay in sync automatically.
 */
const READER_GUIDE_EN: Readonly<Record<string, { need: string; value: string }>> = {
  'section-executive-brief': {
    need: 'BLUF and editorial decisions',
    value:
      'fast answer to what happened, why it matters, who is accountable, and the next dated trigger',
  },
  'section-synthesis': {
    need: 'Integrated thesis',
    value: 'the lead political reading that connects facts, actors, risks, and confidence',
  },
  'section-significance': {
    need: 'Significance scoring',
    value: 'why this story outranks or trails other same-day European Parliament signals',
  },
  'section-actors-forces': {
    need: 'Actors and forces',
    value:
      'who is driving the story, what political forces line up behind them, and which institutional levers they can pull',
  },
  'section-coalitions-voting': {
    need: 'Coalitions and voting',
    value: 'political group alignment, voting evidence, and coalition pressure points',
  },
  'section-stakeholder-map': {
    need: 'Stakeholder impact',
    value: 'who gains, who loses, and which institutions or citizens feel the policy effect',
  },
  'section-economic-context': {
    need: 'IMF-backed economic context',
    value: 'macro, fiscal, trade, or monetary evidence that changes the political interpretation',
  },
  'section-scenarios': {
    need: 'Forward indicators',
    value: 'dated watch items that let readers verify or falsify the assessment later',
  },
  'section-risk': {
    need: 'Risk assessment',
    value: 'policy, institutional, coalition, communications, and implementation risk register',
  },
  'section-threat': {
    need: 'Threat landscape',
    value: 'hostile actors, attack vectors, consequence trees, and legislative-disruption pathways',
  },
  'section-forward-projection': {
    need: 'What to watch',
    value: 'dated trigger events, calendar dependencies, and legislative-pipeline forecasts',
  },
  'section-electoral-arc': {
    need: 'Electoral arc and mandate',
    value:
      'where the story sits in the EP term, mandate fulfilment, seat projection, and presidency-trio context',
  },
  'section-pestle-context': {
    need: 'PESTLE and structural context',
    value:
      'political, economic, social, technological, legal, and environmental forces plus the historical baseline',
  },
  'section-continuity': {
    need: 'Cross-run continuity',
    value: 'what changed since prior sessions and how confidence shifted between runs',
  },
  'section-deep-analysis': {
    need: 'Deep analysis',
    value: 'long-form Economist-style explanation for readers who want the full argument',
  },
  'section-documents': {
    need: 'Document trail',
    value: 'the document index and per-file analysis behind the public judgement',
  },
  'section-extended-intel': {
    need: 'Extended intelligence',
    value:
      "devil's-advocate critique, comparative parallels, historical precedents, and media framing",
  },
  'section-mcp-reliability': {
    need: 'MCP data reliability',
    value: 'which feeds were healthy, which were degraded, and how data limits bound conclusions',
  },
  'section-quality-reflection': {
    need: 'Analytical quality and reflection',
    value:
      'self-assessment scores, methodology audit, structured analytic techniques, and known limitations',
  },
  'section-supplementary-intelligence': {
    need: 'Supplementary intelligence',
    value:
      'additional markdown discovered in the run that has not yet been assigned to a canonical section',
  },
};

/**
 * Render the generated reader-intelligence guide that appears before the
 * artifact sections. It gives readers a Riksdagsmonitor-style navigation layer
 * without requiring agents to hand-author another artifact.
 *
 * Section membership is checked against `READER_GUIDE_SECTION_IDS` (the
 * canonical list shared with the HTML renderer in `reader-intelligence-guide.ts`)
 * to prevent drift between the two renderers.
 *
 * @param sections - Emitted section TOC entries, in document order
 * @param included - Included artifacts, used to name each section's source
 * @returns Markdown block containing the guide table
 */
export function renderReaderIntelligenceGuide(
  sections: readonly TocSection[],
  included: readonly IncludedArtifact[]
): string {
  const rows = sections
    .map((section) => {
      if (!READER_GUIDE_SECTION_IDS.includes(section.id)) return '';
      const copy = Object.getOwnPropertyDescriptor(READER_GUIDE_EN, section.id)?.value as
        { need: string; value: string } | undefined;
      if (!copy) return '';
      const source = included.find((artifact) => artifact.sectionId === section.id)?.runRelPath;
      const label = source ? `\`${source}\`` : section.title;
      return `| [${copy.need}](#${section.id}) | ${copy.value} | ${label} |`;
    })
    .filter(Boolean);

  if (rows.length === 0) return '';
  return [
    `<h2 id="${READER_GUIDE_SECTION_ID}">${READER_GUIDE_SECTION_TITLE}</h2>`,
    '',
    'Use this guide to read the article as a political-intelligence product rather than a raw artifact dump. High-value reader lenses appear first; technical provenance remains available in the audit appendices.',
    '',
    "| Reader need | What you'll get | Source artifact |",
    '|---|---|---|',
    ...rows,
    '',
  ].join('\n');
}
