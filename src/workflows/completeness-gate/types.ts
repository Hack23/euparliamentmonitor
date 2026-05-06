// SPDX-FileCopyrightText: 2024-2026 Hack23 AB
// SPDX-License-Identifier: Apache-2.0

/**
 * @module Workflows/CompletenessGate/Types
 * @description Type definitions for the Stage C analysis completeness validator.
 * These types model the validation rules loaded from reference-quality-thresholds.json
 * and the per-artifact check results.
 */

import type { DataMode } from '../types.js';

// ─── Quality Threshold Rules ─────────────────────────────────────────────────

/**
 * Per-artifact line-floor override keyed by relative path.
 * When absent for a path, DEFAULT_MIN_LINES (30) applies.
 */
export type LineFloorOverrides = Readonly<Record<string, number>>;

/**
 * Complete validation rule set loaded from reference-quality-thresholds.json.
 * Defines which checks apply to which artifacts for each article type.
 */
export interface ValidationRules {
  /** Schema version of the thresholds file. */
  readonly version?: string;
  /** Default minimum line count when no per-artifact override exists. */
  readonly defaultMinLines?: number;
  /** Per-artifact minimum line counts (relativePath → floor). */
  readonly minLines?: LineFloorOverrides;
  /** Artifacts requiring at least one ```mermaid fenced block. */
  readonly mermaidRequired?: readonly string[];
  /** Artifacts requiring a WEP probability band marker. */
  readonly wepBandRequired?: readonly string[];
  /** Artifacts requiring an Admiralty grade marker (A1–F6). */
  readonly admiraltyGradeRequired?: readonly string[];
  /** Artifacts requiring an ICD 203 BLUF marker. */
  readonly icd203BlufRequired?: readonly string[];
  /** Artifacts requiring ≥10 SAT documentation bullets. */
  readonly satDocumentationRequired?: readonly string[];
  /** Artifacts requiring a reader-perspective H2 block. */
  readonly readerBlockRequired?: readonly string[];
  /** Artifacts requiring evidence of source diversity (MCP tool refs). */
  readonly sourceDiversityRequired?: readonly string[];
  /** Per-article-type overrides. */
  readonly articleTypes?: Readonly<Record<string, ArticleTypeOverrides>>;
}

/**
 * Per-article-type rule overrides that can extend or replace the default rules.
 */
export interface ArticleTypeOverrides {
  /** Additional artifacts required for this article type. */
  readonly additionalArtifacts?: readonly string[];
  /** Per-artifact line floor overrides specific to this article type. */
  readonly minLines?: LineFloorOverrides;
  /** Artifacts requiring mermaid (additive to base). */
  readonly mermaidRequired?: readonly string[];
}

// ─── Validator Options ───────────────────────────────────────────────────────

/**
 * CLI options parsed from command-line arguments.
 */
export interface ValidatorOptions {
  /** Path to the run directory (analysis/daily/<date>/<run>/). */
  readonly runDir: string;
  /** Emit JSON summary to stdout in addition to STAGE_C_GATE line. */
  readonly json: boolean;
  /** Treat warnings as errors (RED on any warning). */
  readonly strict: boolean;
  /** Explicit minimum line override (raises floor, never lowers). */
  readonly minLines: number;
  /** Whether minLines was explicitly provided via CLI flag. */
  readonly minLinesExplicit: boolean;
  /** Optional override path to thresholds JSON file. */
  readonly thresholdsPath: string | null;
}

// ─── Manifest (Validator View) ───────────────────────────────────────────────

/**
 * The subset of manifest.json fields consumed by the completeness validator.
 * Kept intentionally narrow — full Manifest type lives in aggregator/manifest/types.
 */
export interface ValidatorManifest {
  /** Article type slug (e.g. 'breaking', 'week-ahead'). */
  readonly articleType?: string;
  /** Legacy plural form. */
  readonly articleTypes?: readonly string[];
  /** Legacy runType form. */
  readonly runType?: string;
  /** File inventory for mandatory artifact resolution. */
  readonly files?: Record<string, readonly string[] | Record<string, string>>;
  /** Data availability mode for threshold reduction. */
  readonly dataMode?: DataMode;
  /** Electoral overlay flag. */
  readonly electoralOverlay?: boolean;
  /** Horizon configuration (forward-projection scenarios). */
  readonly scenarioMaxHorizonMonths?: number;
}

// ─── Validation Context ──────────────────────────────────────────────────────

/**
 * Complete context passed to per-artifact validators.
 */
export interface ValidationContext {
  /** Absolute path to the run directory. */
  readonly runDir: string;
  /** Relative path of the artifact being validated. */
  readonly relativePath: string;
  /** Loaded validation rules. */
  readonly rules: ValidationRules;
  /** CLI options. */
  readonly options: ValidatorOptions;
  /** Effective data-mode reduction factor (0–1). */
  readonly dataModeReduction: number;
}
