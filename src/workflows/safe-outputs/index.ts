// SPDX-FileCopyrightText: 2024-2026 Hack23 AB
// SPDX-License-Identifier: Apache-2.0

/**
 * @module Workflows/SafeOutputs
 * @description Public API for Stage E safe-outputs types and constraints.
 */

export type { SafeOutputsPRParams, SafeOutputsConstraints } from './types.js';
export {
  FORBIDDEN_PHRASES,
  FORBIDDEN_TOOL_REFS,
  STANDARD_CONSTRAINTS,
  ELECTORAL_CONSTRAINTS,
} from './types.js';
