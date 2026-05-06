// SPDX-FileCopyrightText: 2024-2026 Hack23 AB
// SPDX-License-Identifier: Apache-2.0
/**
 * @module Workflows/CompletenessGate/Constants
 * @description Extracted constants from the Stage C completeness validator.
 * These regex patterns and threshold values are the authoritative definitions
 * referenced by both the validator script and unit tests.
 *
 * Note: detect-unsafe-regex is disabled for this file because these patterns
 * operate on bounded artifact content (typically <1000 lines of markdown)
 * with no user-supplied input, identical to their origin in the validator script.
 */
/* eslint-disable security/detect-unsafe-regex */
// ─── Default Thresholds ──────────────────────────────────────────────────────
/** Default minimum line count for artifacts when no per-artifact override exists. */
export const DEFAULT_MIN_LINES = 30;
/**
 * Minimum scenarioMaxHorizonMonths threshold that triggers the structural-break
 * requirement in scenario-forecast.md (3 years — long enough to span an EP election cycle).
 */
export const LONG_HORIZON_THRESHOLD_MONTHS = 36;
// ─── Placeholder Detection ───────────────────────────────────────────────────
/**
 * Patterns that indicate unfinished AI analysis placeholders.
 * Any artifact containing these (outside meta-doc contexts) fails Stage C.
 */
export const PLACEHOLDER_PATTERNS = [
    /\[AI_ANALYSIS_REQUIRED\]/,
    /AI_ANALYSIS_PENDING/,
    /\[TO BE FILLED\]/,
    /\[TBD\]/i,
    /^TODO:/m,
];
/**
 * Meta-documentation hint — when this pattern matches an artifact,
 * placeholder scanning is suppressed (the artifact is itself a template
 * instruction doc that legitimately contains placeholder examples).
 */
export const META_DOC_HINT_RE = /(template-instructions|placeholder reference|TODO list of)/i;
// ─── Content Quality Patterns ────────────────────────────────────────────────
/**
 * WEP (Words of Estimative Probability) band markers.
 * At least one must appear in artifacts listed in wepBandRequired.
 */
export const WEP_BAND_RE = /\b(Almost Certain|Highly Likely|Likely|Roughly Even|Even Chance|About even|Unlikely|Highly Unlikely|Almost No Chance|WEP\s*:)\b/i;
/**
 * Admiralty grading system marker (A1–F6).
 * At least one must appear in artifacts listed in admiraltyGradeRequired.
 */
export const ADMIRALTY_RE = /(^|[\s|`(])([A-F][1-6])([\s|`)]|$)/;
/** ICD 203 Bottom Line Up Front marker. */
export const BLUF_RE = /\bBLUF\s*[:.]/i;
/**
 * Reader-perspective H2 block detection.
 * Articles must contain at least one of these heading patterns.
 */
export const READER_BLOCK_RE = /^##+\s+(?:[^\n]*?)?(Reader|For Citizens|What This Means|Reader Briefing|Citizen Briefing|Newsroom)/im;
/** Crude bullet-list matcher for counting SAT documentation entries. */
export const SAT_LIST_RE = /(?:^|\n)\s*(?:[-*+]|\d+\.)\s+[^\n]+/g;
// ─── Source Diversity ────────────────────────────────────────────────────────
/**
 * MCP tool reference pattern — at least one must appear in artifacts
 * listed in sourceDiversityRequired for source diversity compliance.
 */
export const MCP_TOOL_RE = /\b(get_(?:procedures|adopted_texts|plenary_sessions|voting_records|meps|parliamentary_questions|speeches|committee_documents)|search_(?:documents|code|issues|repositories)|analyze_(?:voting_patterns|coalition_dynamics|country_delegation)|semantic_(?:issues_search|issue_similarity_search)|monitor_legislative_pipeline|track_legislation|track_mep_attendance|generate_political_landscape|early_warning_system|correlate_intelligence)\b/;
// ─── IMF/WB Economic Source Policies ─────────────────────────────────────────
/**
 * IMF Source field in structured evidence table.
 * Used to verify economic-context artifacts cite IMF as primary source.
 */
export const IMF_SOURCE_FIELD_RE = /^\|\s*\*\*IMF Source\*\*\s*\|\s*`?([^`|\]]+?)`?\s*\|/im;
/**
 * IMF numeric claim proximity pattern — detects "IMF" within 160 chars
 * of a numeric figure with economic units (%, pp, GDP, EUR, etc).
 */
export const IMF_FIGURE_CLAIM_RE = /\bIMF\b[\s\S]{0,160}\b\d+(?:\.\d+)?\s*(?:%|pp|percentage points|GDP|EUR|USD|billion|trillion|million)/i;
/**
 * World Bank economic indicator codes that must NOT appear in economic-context.md.
 * IMF is the sole authoritative source for economic claims per editorial policy.
 */
export const WB_ECONOMIC_INDICATOR_CODE_RE = /\b(NY\.GDP\.[A-Z0-9.]+|NY\.GNP\.[A-Z0-9.]+|FP\.CPI\.[A-Z0-9.]+|SL\.UEM\.[A-Z0-9.]+|GC\.DOD\.[A-Z0-9.]+|GC\.TAX\.[A-Z0-9.]+|NE\.EXP\.[A-Z0-9.]+|NE\.IMP\.[A-Z0-9.]+|NE\.TRD\.[A-Z0-9.]+|NE\.CON\.GOVT\.[A-Z0-9.]+|BX\.KLT\.[A-Z0-9.]+|BN\.KLT\.[A-Z0-9.]+|FR\.INR\.[A-Z0-9.]+)\b/;
/**
 * World Bank economic prose claim detection — "World Bank" within 120 chars
 * of an economic noun. Narrow window avoids false positives on legitimate
 * non-economic WB citations (WGI governance index, etc).
 */
export const WB_ECONOMIC_CLAIM_RE = /\bWorld\s+Bank\b[\s\S]{0,120}\b(?:GDP(?:\s+growth|\s+per\s+capita)?|inflation|CPI|unemployment(?:\s+rate)?|fiscal\s+balance|primary\s+balance|government\s+debt|public\s+debt|current\s+account|trade(?:\s+balance)?|FDI|foreign\s+direct\s+investment|exchange\s+rate|REER|policy\s+rate|reserve\s+assets|capital\s+adequacy|NPL\s+ratio)\b/i;
// ─── Structural Break Detection ──────────────────────────────────────────────
/**
 * Pattern for structural-break / regime-change content required in
 * scenario-forecast.md when horizonMonths ≥ LONG_HORIZON_THRESHOLD_MONTHS.
 */
export const STRUCTURAL_BREAK_RE = /\b(structural[- ]break|regime[- ]change|regime[- ]shift)\b/i;
// ─── Directory Classification ────────────────────────────────────────────────
/**
 * Directories whose artifacts implicitly require Mermaid diagrams
 * even when not explicitly listed in mermaidRequired.
 */
export const DIAGRAM_DIRS = [
    'intelligence',
    'classification',
    'risk-scoring',
    'threat-assessment',
];
// ─── Family-D Electoral Artifacts ────────────────────────────────────────────
/**
 * Artifacts required when the manifest declares electoralOverlay = true.
 * These are the "Family D" artifacts specific to electoral analysis.
 */
export const FAMILY_D_ARTIFACTS = [
    'intelligence/seat-projection.md',
    'intelligence/term-arc.md',
    'intelligence/mandate-fulfilment-scorecard.md',
];
//# sourceMappingURL=constants.js.map