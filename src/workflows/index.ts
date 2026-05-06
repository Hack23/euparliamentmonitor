// SPDX-FileCopyrightText: 2024-2026 Hack23 AB
// SPDX-License-Identifier: Apache-2.0

/**
 * @module Workflows
 * @description Bounded context barrel export for the agentic workflow support modules.
 *
 * Architecture:
 * ```
 * src/workflows/
 * ├── types.ts                  — Shared workflow contract types
 * ├── completeness-gate/        — Stage C validation (from validate-analysis-completeness.js)
 * ├── infrastructure/           — Shell safety, MCP setup helpers
 * └── safe-outputs/             — Stage E PR creation constraints
 * ```
 *
 * @see WORKFLOWS.md for the full bounded context architecture documentation.
 */

export type {
  DataMode,
  GateVerdict,
  StageCVerdict,
  StageGateResult,
  IssueSeverity,
  ValidationIssue,
  ArtifactValidationResult,
  PipelineStage,
  StageHistoryEntry,
} from './types.js';

export { DATA_MODE_REDUCTION } from './types.js';

// Re-export bounded contexts
export * as completenessGate from './completeness-gate/index.js';
export * as infrastructure from './infrastructure/index.js';
export * as safeOutputs from './safe-outputs/index.js';
