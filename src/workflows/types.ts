// SPDX-FileCopyrightText: 2024-2026 Hack23 AB
// SPDX-License-Identifier: Apache-2.0

/**
 * @module Workflows/Types
 * @description Shared type definitions for the agentic workflow bounded contexts.
 * These types define the contracts between pipeline stages (A → B → C → D → E)
 * and the data shapes flowing through the workflow system.
 */

// ─── Data Mode ───────────────────────────────────────────────────────────────

/**
 * Declares the level of data availability during a run.
 * When EP/IMF/WB data sources are partially unavailable, the manifest records
 * a degraded mode so downstream validators can adjust thresholds proportionally.
 */
export type DataMode =
  | 'full'
  | 'title-only'
  | 'degraded-imf'
  | 'degraded-voting'
  | 'minimal';

/**
 * Reduction factors applied to line-floor thresholds per data mode.
 * Structural checks (mermaid, WEP, Admiralty, SATs) are never reduced.
 */
export const DATA_MODE_REDUCTION: Readonly<Record<DataMode, number>> = {
  'full': 1.0,
  'title-only': 0.75,
  'degraded-imf': 0.85,
  'degraded-voting': 0.85,
  'minimal': 0.65,
};

// ─── Stage Gate Results ──────────────────────────────────────────────────────

/** Stage C gate verdict — GREEN means pass, RED means blocking violations. */
export type GateVerdict = 'GREEN' | 'RED';

/**
 * Structured result emitted by the Stage C completeness validator.
 * Corresponds to the `STAGE_C_GATE:` output line parsed by downstream tooling.
 */
export interface StageGateResult {
  /** The final verdict: GREEN (pass) or RED (fail). */
  readonly verdict: GateVerdict;
  /** The article type slug resolved from the manifest. */
  readonly articleType: string;
  /** Total number of mandatory artifacts validated. */
  readonly artifactCount: number;
  /** Total line count across all validated artifacts (GREEN only). */
  readonly totalLines?: number;
  /** Count of missing artifacts (RED only). */
  readonly missingCount?: number;
  /** Count of artifacts below line-floor thresholds (RED only). */
  readonly shortCount?: number;
  /** Count of artifacts with placeholder markers (RED only). */
  readonly placeholderCount?: number;
}

// ─── Validation Issue Severity ───────────────────────────────────────────────

/** Severity level for validation issues detected during Stage C. */
export type IssueSeverity = 'error' | 'warning';

/**
 * A single validation issue found in an artifact during Stage C analysis.
 */
export interface ValidationIssue {
  /** The artifact-relative path where the issue was found. */
  readonly artifactPath: string;
  /** Human-readable issue description (e.g. 'mermaid:missing', 'short:42<80'). */
  readonly code: string;
  /** Whether this issue blocks the gate (error) or is advisory (warning). */
  readonly severity: IssueSeverity;
}

// ─── Artifact Validation Result ──────────────────────────────────────────────

/**
 * Per-artifact validation result from the completeness gate.
 */
export interface ArtifactValidationResult {
  /** Artifact path relative to the run directory. */
  readonly relativePath: string;
  /** Line count of the artifact file. */
  readonly lines: number;
  /** Blocking issues that cause a RED gate. */
  readonly issues: readonly string[];
  /** Non-blocking warnings (advisory only unless --strict). */
  readonly warnings: readonly string[];
}

// ─── Pipeline Stage ──────────────────────────────────────────────────────────

/**
 * Pipeline stages in the agentic workflow execution model.
 * Each unified news-*.md workflow runs stages A → E in sequence.
 */
export type PipelineStage =
  | 'A' // Data Collection
  | 'B' // Analysis Protocol (2-pass)
  | 'C' // Completeness Gate
  | 'D' // Article Generation (2-pass)
  | 'E'; // PR & Safe Outputs

/**
 * Stage metadata recorded in manifest.history[] entries.
 */
export interface StageHistoryEntry {
  /** Which pipeline stage this entry describes. */
  readonly stage: PipelineStage;
  /** ISO 8601 timestamp when the stage started. */
  readonly startedAt: string;
  /** ISO 8601 timestamp when the stage completed (absent if in-progress). */
  readonly completedAt?: string;
  /** Stage C gate result (only present for stage C). */
  readonly gateResult?: GateVerdict;
  /** Summary text for audit logging. */
  readonly summary?: string;
  /** Files written during this stage. */
  readonly filesWritten?: readonly string[];
}
