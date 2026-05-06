// SPDX-FileCopyrightText: 2024-2026 Hack23 AB
// SPDX-License-Identifier: Apache-2.0

/**
 * @module Workflows/Infrastructure
 * @description Public API for infrastructure-related workflow utilities.
 */

export type { ShellSafetyRule, ShellSafetyViolation } from './shell-safety.js';
export { SHELL_SAFETY_RULES, stripCommentLines, validateShellSafety } from './shell-safety.js';
