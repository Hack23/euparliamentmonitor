// SPDX-FileCopyrightText: 2024-2026 Hack23 AB
// SPDX-License-Identifier: Apache-2.0

/**
 * @module Workflows/Infrastructure/ShellSafety
 * @description Shell safety patterns and validation for agentic workflows.
 * Defines the forbidden shell expansion patterns that the sandbox filter blocks,
 * extracted from .github/prompts/00-scope-and-ground-rules.md §47 and
 * .github/prompts/08-infrastructure.md §177-181.
 *
 * These patterns are used by test/unit/shell-safety.test.js as the drift guard
 * and can be consumed by any tooling that needs to validate shell scripts.
 */

// ─── Forbidden Pattern Definitions ───────────────────────────────────────────

/**
 * A shell safety rule with a human-readable name, detection regex,
 * and explanation of why it's forbidden.
 */
export interface ShellSafetyRule {
  /** Short identifier for the rule (e.g. 'nested-param-expansion'). */
  readonly id: string;
  /** Human-readable description of what this rule detects. */
  readonly description: string;
  /** Regex that detects the forbidden pattern in shell code. */
  readonly pattern: RegExp;
  /** Explanation of why this pattern is dangerous in sandboxed execution. */
  readonly rationale: string;
}

/**
 * Complete set of shell safety rules enforced in agentic workflow scripts.
 * Each rule corresponds to a pattern that the sandbox shell-safety filter blocks.
 */
export const SHELL_SAFETY_RULES: readonly ShellSafetyRule[] = [
  {
    id: 'nested-param-expansion',
    description: 'Nested parameter expansion (inner expansion becomes outer pattern)',
    pattern: /\$\{[^}]*\$\{/,
    rationale: 'Inner expansion result becomes part of the outer pattern — classic prompt-injection vector.',
  },
  {
    id: 'indirect-expansion',
    description: 'Indirect variable expansion (${!var})',
    pattern: /\$\{![a-zA-Z_]/,
    rationale: 'Reads arbitrary variables by name — information leak vector.',
  },
  {
    id: 'parameter-transformation',
    description: 'Parameter transformation operators (${var@P}, ${var@Q}, etc)',
    pattern: /\$\{[^}]+@[PQEAKa]\}/,
    rationale: '@P re-evaluates as a prompt; others leak state.',
  },
  {
    id: 'nested-command-substitution',
    description: 'Nested command substitution ($(cmd $(inner)))',
    pattern: /\$\([^)]*\$\(/,
    rationale: 'Inner $() executes under the outer — command injection vector.',
  },
  {
    id: 'default-with-command-sub',
    description: 'Default/alternate with command substitution (${VAR:-$(cmd)})',
    pattern: /\$\{[^}]*:-\s*\$\(/,
    rationale: 'Default expression is a live command — same risk as nested $().',
  },
  {
    id: 'eval-usage',
    description: 'Use of eval (explicit arbitrary code execution)',
    pattern: /\beval\s/,
    rationale: 'Explicit arbitrary-code execution primitive.',
  },
];

// ─── Validation Functions ────────────────────────────────────────────────────

/**
 * Strip whole-line bash comments from shell script content.
 * Lines whose first non-whitespace character is `#` are removed.
 * Inline comments (code before #) are preserved.
 *
 * @param content - Raw shell script content
 * @returns content with comment-only lines removed
 */
export function stripCommentLines(content: string): string {
  return content
    .split('\n')
    .filter((line) => !/^\s*#/.test(line))
    .join('\n');
}

/**
 * Validate shell script content against all shell safety rules.
 * Returns an array of violations found (empty = clean).
 *
 * @param content - Shell script content (comments should be pre-stripped)
 * @returns array of rule violations with line context
 */
export function validateShellSafety(content: string): readonly ShellSafetyViolation[] {
  const strippedContent = stripCommentLines(content);
  const lines = strippedContent.split('\n');
  const violations: ShellSafetyViolation[] = [];

  for (const rule of SHELL_SAFETY_RULES) {
    for (let i = 0; i < lines.length; i++) {
      const line = lines[i];
      if (line !== undefined && rule.pattern.test(line)) {
        violations.push({
          ruleId: rule.id,
          description: rule.description,
          lineNumber: i + 1,
          lineContent: line.trim(),
        });
      }
    }
  }

  return violations;
}

/**
 * A single shell safety violation found during validation.
 */
export interface ShellSafetyViolation {
  /** The rule that was violated. */
  readonly ruleId: string;
  /** Human-readable description of the violation. */
  readonly description: string;
  /** 1-based line number where the violation was found. */
  readonly lineNumber: number;
  /** The trimmed content of the violating line. */
  readonly lineContent: string;
}
