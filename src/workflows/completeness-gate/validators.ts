// SPDX-FileCopyrightText: 2024-2026 Hack23 AB
// SPDX-License-Identifier: Apache-2.0

/**
 * @module Workflows/CompletenessGate/Validators
 * @description Core validation functions for Stage C analysis completeness.
 * These pure functions implement individual artifact checks extracted from
 * the monolithic validate-analysis-completeness.js script.
 *
 * Each function is a single-responsibility checker that returns a boolean
 * or enriches a result object — making them independently testable.
 */

import {
  PLACEHOLDER_PATTERNS,
  META_DOC_HINT_RE,
  WEP_BAND_RE,
  ADMIRALTY_RE,
  BLUF_RE,
  READER_BLOCK_RE,
  SAT_LIST_RE,
  MCP_TOOL_RE,
  IMF_FIGURE_CLAIM_RE,
  WB_ECONOMIC_INDICATOR_CODE_RE,
  WB_ECONOMIC_CLAIM_RE,
  DIAGRAM_DIRS,
  DEFAULT_MIN_LINES,
} from './constants.js';
import type { ArtifactValidationResult } from '../types.js';
import type { ValidationRules } from './types.js';
import type { DataMode } from '../types.js';
import { DATA_MODE_REDUCTION } from '../types.js';

// ─── Content Checks ──────────────────────────────────────────────────────────

/**
 * Check if content contains placeholder markers that indicate unfinished analysis.
 *
 * @param content - The full text content of an artifact
 * @returns true if any placeholder pattern is found
 */
export function hasPlaceholders(content: string): boolean {
  if (META_DOC_HINT_RE.test(content)) {
    return false; // meta-doc contexts are exempt
  }
  return PLACEHOLDER_PATTERNS.some((pattern) => pattern.test(content));
}

/**
 * Check if content contains at least one mermaid fenced code block.
 *
 * @param content - The full text content of an artifact
 * @returns true if a ```mermaid block is present
 */
export function hasMermaid(content: string): boolean {
  return /```mermaid/i.test(content);
}

/**
 * Check if content contains a WEP (Words of Estimative Probability) band marker.
 *
 * @param content - The full text content of an artifact
 * @returns true if a WEP band marker is present
 */
export function hasWepBand(content: string): boolean {
  return WEP_BAND_RE.test(content);
}

/**
 * Check if content contains an Admiralty grading marker (A1–F6).
 *
 * @param content - The full text content of an artifact
 * @returns true if an Admiralty grade is present
 */
export function hasAdmiraltyGrade(content: string): boolean {
  return ADMIRALTY_RE.test(content);
}

/**
 * Check if content contains an ICD 203 BLUF (Bottom Line Up Front) marker.
 *
 * @param content - The full text content of an artifact
 * @returns true if a BLUF marker is present
 */
export function hasBluf(content: string): boolean {
  return BLUF_RE.test(content);
}

/**
 * Check if content contains a reader-perspective block heading.
 *
 * @param content - The full text content of an artifact
 * @returns true if a reader block heading is present
 */
export function hasReaderBlock(content: string): boolean {
  return READER_BLOCK_RE.test(content);
}

/**
 * Count the number of SAT (Structured Analytic Technique) documentation bullets.
 *
 * @param content - The full text content of an artifact
 * @returns the count of SAT bullet items found
 */
export function countSatBullets(content: string): number {
  const matches = content.match(SAT_LIST_RE);
  return matches ? matches.length : 0;
}

/**
 * Check if content contains evidence of source diversity (MCP tool references
 * or structured evidence table rows).
 *
 * @param content - The full text content of an artifact
 * @returns true if source diversity evidence is present
 */
export function hasSourceDiversityEvidence(content: string): boolean {
  // Check for MCP tool references
  if (MCP_TOOL_RE.test(content)) {
    return true;
  }
  // Check for structured evidence table rows (| Source | ... pattern)
  if (/^\|[^|]+\|[^|]+\|/m.test(content)) {
    return true;
  }
  return false;
}

/**
 * Check if an artifact contains an IMF numeric figure claim.
 *
 * @param content - The full text content of an artifact
 * @returns true if an IMF figure claim pattern is found
 */
export function hasImfFigureClaim(content: string): boolean {
  return IMF_FIGURE_CLAIM_RE.test(content);
}

/**
 * Check if an economic-context artifact improperly uses World Bank economic codes.
 *
 * @param content - The full text content of an economic-context artifact
 * @returns the matched WB indicator code, or null if clean
 */
export function findWbEconomicIndicator(content: string): string | null {
  const match = content.match(WB_ECONOMIC_INDICATOR_CODE_RE);
  return match ? match[1] ?? null : null;
}

/**
 * Check if an economic-context artifact improperly makes World Bank economic claims.
 *
 * @param content - The full text content of an economic-context artifact
 * @returns true if a WB economic prose claim is found
 */
export function hasWbEconomicClaim(content: string): boolean {
  return WB_ECONOMIC_CLAIM_RE.test(content);
}

// ─── Threshold Computation ───────────────────────────────────────────────────

/**
 * Compute the effective minimum line count for an artifact, accounting for
 * per-artifact overrides and data-mode reduction factors.
 *
 * @param relativePath - The artifact's relative path
 * @param rules - The loaded validation rules
 * @param dataModeReduction - The effective reduction factor (0–1)
 * @param explicitMinLines - CLI-provided floor (raises but never lowers)
 * @returns the computed minimum line count
 */
export function computeEffectiveMinLines(
  relativePath: string,
  rules: ValidationRules,
  dataModeReduction: number,
  explicitMinLines?: number,
): number {
  const baseFloor = rules.minLines?.[relativePath] ?? rules.defaultMinLines ?? DEFAULT_MIN_LINES;
  const reduced = Math.ceil(baseFloor * dataModeReduction);

  // CLI --min-lines only raises, never lowers
  if (explicitMinLines !== undefined && explicitMinLines > reduced) {
    return explicitMinLines;
  }
  return reduced;
}

/**
 * Resolve the effective data-mode reduction factor from a manifest's dataMode field.
 *
 * @param dataMode - The declared data mode (or undefined for full)
 * @returns the reduction factor (0–1)
 */
export function resolveDataModeReduction(dataMode?: DataMode): number {
  if (!dataMode) {
    return 1.0;
  }
  return DATA_MODE_REDUCTION[dataMode] ?? 1.0;
}

// ─── Artifact Path Classification ────────────────────────────────────────────

/**
 * Determine whether an artifact path implicitly requires a Mermaid diagram
 * based on its directory location (intelligence/, classification/, etc).
 *
 * @param relativePath - The artifact's relative path
 * @param rules - The loaded validation rules
 * @returns true if the artifact requires a Mermaid diagram
 */
export function requiresMermaid(relativePath: string, rules: ValidationRules): boolean {
  // Explicitly listed in mermaidRequired
  if (rules.mermaidRequired?.includes(relativePath)) {
    return true;
  }
  // Implicitly required by directory
  const dir = relativePath.split('/')[0];
  return dir !== undefined && DIAGRAM_DIRS.includes(dir);
}

// ─── Result Builders ─────────────────────────────────────────────────────────

/**
 * Create an empty artifact validation result for a given path.
 *
 * @param relativePath - The artifact's relative path
 * @returns a fresh ArtifactValidationResult with empty issues/warnings
 */
export function createEmptyResult(relativePath: string): ArtifactValidationResult {
  return {
    relativePath,
    lines: 0,
    issues: [],
    warnings: [],
  };
}
