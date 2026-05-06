// SPDX-FileCopyrightText: 2024-2026 Hack23 AB
// SPDX-License-Identifier: Apache-2.0
/**
 * Full set of shell safety rules enforced in agentic workflow scripts.
 * Each rule corresponds to a pattern that the sandbox shell-safety filter blocks.
 * IDs and regexes are aligned with the drift-guard in test/unit/shell-safety.test.js.
 */
export const SHELL_SAFETY_RULES = [
    {
        id: 'nested-parameter-expansion',
        description: 'Nested parameter expansion like `${var#${other}}` or `${A:-${B:-}}`',
        pattern: /\$\{[^{}]*\$\{/u,
        rationale: 'Inner expansion result becomes part of the outer pattern — classic prompt-injection vector.',
    },
    {
        id: 'indirect-expansion',
        description: 'Indirect expansion `${!var}`',
        pattern: /\$\{![A-Za-z_]/u,
        rationale: 'Reads arbitrary variables by name — information leak vector.',
    },
    {
        id: 'parameter-transformation',
        description: 'Parameter transformation `${var@P/Q/E/A/K/a}`',
        pattern: /\$\{[A-Za-z_][A-Za-z_0-9]*@[PQEAKa]\}/u,
        rationale: '@P re-evaluates as a prompt; others leak state.',
    },
    {
        id: 'nested-command-substitution',
        description: 'Nested command substitution `$(cmd $(inner))`',
        pattern: /\$\([^()]*\$\(/u,
        rationale: 'Inner $() executes under the outer — command injection vector.',
    },
    {
        id: 'default-with-command-substitution',
        description: 'Default/alternate/assign/error with command substitution `${VAR:-$(cmd)}`, `${VAR:+$(cmd)}`, etc.',
        pattern: /\$\{[A-Za-z_][A-Za-z_0-9]*:[-=+?]\$\(/u,
        rationale: 'The parameter-expansion operator combines with command substitution — same risk as nested $().',
    },
    {
        id: 'redirection-in-command-substitution',
        description: 'Input/output redirection inside `$()` — e.g. `$(cmd < file)` or `$(cmd <"$file")`',
        // Matches a `$(` … `<` sequence on a single line where `<` is a single-char
        // redirection operator. Excludes `<<`/`<<<` (here-doc), `<(...)` (process
        // substitution), and `<=` (comparison).
        pattern: /\$\([^()]*(?:^|\s|[0-9])<(?![<(=])/u,
        rationale: 'Redirection inside $() can read arbitrary files at agent runtime — file-exfiltration vector.',
    },
    {
        id: 'adjacent-random',
        description: 'Adjacent `${RANDOM}${RANDOM}` — adjacency heuristic trips nested-expansion detection',
        pattern: /\$\{RANDOM\}\$\{RANDOM\}/u,
        rationale: 'The adjacency pattern triggers the sandbox nested-expansion heuristic.',
    },
    {
        id: 'eval',
        description: 'Use of `eval` builtin',
        pattern: /(^|[\s;&|])eval\s/u,
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
export function stripCommentLines(content) {
    return content
        .split('\n')
        .filter((line) => !/^\s*#/u.test(line))
        .join('\n');
}
/**
 * Validate shell script content against all shell safety rules.
 * Accepts raw shell content — comment-only lines are automatically skipped
 * during scanning so reported line numbers match the original file.
 *
 * @param content - Raw shell script content (comment lines will be skipped automatically)
 * @returns array of rule violations with line context
 */
export function validateShellSafety(content) {
    const lines = content.split('\n');
    const violations = [];
    for (const rule of SHELL_SAFETY_RULES) {
        for (let i = 0; i < lines.length; i++) {
            const line = lines[i];
            // Skip whole-line comments — they describe patterns without executing them
            if (line === undefined || /^\s*#/u.test(line)) {
                continue;
            }
            if (rule.pattern.test(line)) {
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
//# sourceMappingURL=shell-safety.js.map