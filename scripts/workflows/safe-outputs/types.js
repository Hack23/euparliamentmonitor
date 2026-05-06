// SPDX-FileCopyrightText: 2024-2026 Hack23 AB
// SPDX-License-Identifier: Apache-2.0
// ─── Forbidden Phrases ───────────────────────────────────────────────────────
/**
 * Phrases forbidden in agentic workflow files.
 * Detected by lint-prompts.js — presence causes lint failure.
 */
export const FORBIDDEN_PHRASES = [
    'checkpoint pr',
    'checkpoint-pr',
    'keep-alive',
    'keepalive',
    'keep alive',
    'heartbeat',
    'progressive safe output',
];
/**
 * Forbidden tool references in workflow files.
 * push_repo_memory is not allowed in any news-*.md workflow.
 */
export const FORBIDDEN_TOOL_REFS = ['safeoutputs___push_repo_memory'];
// ─── Default Constraints by Slug Type ────────────────────────────────────────
/**
 * Default safe-outputs timing constraints for standard article slugs.
 */
export const STANDARD_CONSTRAINTS = {
    maxPRCalls: 1,
    targetMinute: 42,
    hardDeadlineMinute: 45,
};
/**
 * Safe-outputs timing constraints for electoral-overlay article slugs.
 */
export const ELECTORAL_CONSTRAINTS = {
    maxPRCalls: 1,
    targetMinute: 47,
    hardDeadlineMinute: 50,
};
//# sourceMappingURL=types.js.map