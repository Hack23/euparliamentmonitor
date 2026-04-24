// SPDX-FileCopyrightText: 2024-2026 Hack23 AB
// SPDX-License-Identifier: Apache-2.0

/**
 * @module Aggregator/ArtifactOrder
 * @description Canonical ordering of analysis artifacts in the aggregated
 * article markdown. The order reads like an intelligence product:
 * boardroom summary → facts → forces → assessment → scenarios → self-audit.
 *
 * Every entry lists the artifact paths (relative to the analysis run dir)
 * that belong in that section, in priority order. Missing artifacts are
 * silently skipped. Artifacts that match no section go to the
 * "Supplementary intelligence" bucket so nothing is ever dropped.
 */

/** One section in the aggregated document. */
export interface ArtifactSection {
  /** Stable id used for HTML anchors (lowercase-kebab). */
  readonly id: string;
  /** English section title (other languages come from translated MD). */
  readonly title: string;
  /**
   * Ordered list of artifact paths relative to the run dir. May contain
   * either exact file paths (e.g. `intelligence/synthesis-summary.md`) or
   * directory prefixes ending with `/` (e.g. `threat-assessment/`) to
   * include every remaining `.md` under that folder in lexical order.
   */
  readonly artifacts: readonly string[];
}

/**
 * Canonical ordering. Order matches the plan:
 *  1. Executive brief   2. Synthesis   3. Significance   4. Actors & forces
 *  5. Coalitions        6. Stakeholders 7. PESTLE         8. Economic
 *  9. Risk             10. Threat      11. Scenarios     12. Continuity
 * 13. Deep analysis     14. Documents   15. Extended      16. MCP audit
 * 17. Quality & reflection.
 */
export const ARTIFACT_SECTIONS: readonly ArtifactSection[] = [
  {
    id: 'executive-brief',
    title: 'Executive Brief',
    artifacts: ['extended/executive-brief.md'],
  },
  {
    id: 'synthesis',
    title: 'Synthesis Summary',
    artifacts: ['intelligence/synthesis-summary.md'],
  },
  {
    id: 'significance',
    title: 'Significance',
    artifacts: [
      'classification/significance-classification.md',
      'intelligence/significance-scoring.md',
    ],
  },
  {
    id: 'actors-forces',
    title: 'Actors & Forces',
    artifacts: [
      'classification/actor-mapping.md',
      'classification/forces-analysis.md',
      'classification/impact-matrix.md',
    ],
  },
  {
    id: 'coalitions-voting',
    title: 'Coalitions & Voting',
    artifacts: [
      'intelligence/coalition-dynamics.md',
      'intelligence/voting-patterns.md',
      'existing/voting-patterns.md',
    ],
  },
  {
    id: 'stakeholder-map',
    title: 'Stakeholder Map',
    artifacts: ['intelligence/stakeholder-map.md', 'existing/stakeholder-impact.md'],
  },
  {
    id: 'pestle-context',
    title: 'PESTLE & Context',
    artifacts: ['intelligence/pestle-analysis.md', 'intelligence/historical-baseline.md'],
  },
  {
    id: 'economic-context',
    title: 'Economic Context',
    artifacts: ['intelligence/economic-context.md'],
  },
  {
    id: 'risk',
    title: 'Risk Assessment',
    artifacts: [
      'risk-scoring/risk-matrix.md',
      'risk-scoring/quantitative-swot.md',
      'risk-scoring/political-capital-risk.md',
      'risk-scoring/legislative-velocity-risk.md',
    ],
  },
  {
    id: 'threat',
    title: 'Threat Landscape',
    artifacts: [
      'intelligence/political-threat-landscape.md',
      'intelligence/threat-model.md',
      'threat-assessment/',
    ],
  },
  {
    id: 'scenarios',
    title: 'Scenarios & Wildcards',
    artifacts: ['intelligence/scenario-forecast.md', 'intelligence/wildcards-blackswans.md'],
  },
  {
    id: 'continuity',
    title: 'Cross-Run Continuity',
    artifacts: [
      'intelligence/cross-run-diff.md',
      'existing/cross-session-intelligence.md',
      'intelligence/cross-session-intelligence.md',
      'existing/session-baseline.md',
    ],
  },
  {
    id: 'deep-analysis',
    title: 'Deep Analysis',
    artifacts: ['existing/deep-analysis.md'],
  },
  {
    id: 'documents',
    title: 'Document Analysis',
    artifacts: [
      'documents/document-analysis-index.md',
      'documents/',
      'existing/per-file-political-intelligence.md',
    ],
  },
  {
    id: 'extended-intel',
    title: 'Extended Intelligence',
    artifacts: ['extended/'],
  },
  {
    id: 'mcp-reliability',
    title: 'MCP Reliability Audit',
    artifacts: ['intelligence/mcp-reliability-audit.md'],
  },
  {
    id: 'quality-reflection',
    title: 'Analytical Quality & Reflection',
    artifacts: [
      'intelligence/reference-analysis-quality.md',
      'intelligence/workflow-audit.md',
      'intelligence/methodology-reflection.md',
    ],
  },
];

/** Id of the catch-all bucket for artifacts not matched by any section. */
export const SUPPLEMENTARY_SECTION_ID = 'supplementary-intelligence';

/** Display title for the catch-all bucket. */
export const SUPPLEMENTARY_SECTION_TITLE = 'Supplementary Intelligence';

/** Id of the tradecraft references appendix. */
export const TRADECRAFT_SECTION_ID = 'tradecraft-references';

/** Display title for the tradecraft references appendix. */
export const TRADECRAFT_SECTION_TITLE = 'Tradecraft References';

/** Id of the analysis index / manifest appendix. */
export const MANIFEST_SECTION_ID = 'analysis-index';

/** Display title for the analysis index / manifest appendix. */
export const MANIFEST_SECTION_TITLE = 'Analysis Index';
