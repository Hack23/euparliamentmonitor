// SPDX-FileCopyrightText: 2024-2026 Hack23 AB
// SPDX-License-Identifier: Apache-2.0

import { describe, it, expect } from 'vitest';
import {
  SHELL_SAFETY_RULES,
  stripCommentLines,
  validateShellSafety,
} from '../../scripts/workflows/infrastructure/shell-safety.js';

describe('infrastructure/shell-safety', () => {
  describe('SHELL_SAFETY_RULES', () => {
    it('should contain all 8 rules (aligned with drift-guard)', () => {
      expect(SHELL_SAFETY_RULES.length).toBe(8);
    });

    it('should include all expected rule IDs', () => {
      const ids = SHELL_SAFETY_RULES.map((r) => r.id);
      expect(ids).toContain('nested-parameter-expansion');
      expect(ids).toContain('indirect-expansion');
      expect(ids).toContain('parameter-transformation');
      expect(ids).toContain('nested-command-substitution');
      expect(ids).toContain('default-with-command-substitution');
      expect(ids).toContain('redirection-in-command-substitution');
      expect(ids).toContain('adjacent-random');
      expect(ids).toContain('eval');
    });

    it('should have unique rule IDs', () => {
      const ids = SHELL_SAFETY_RULES.map((r) => r.id);
      expect(new Set(ids).size).toBe(ids.length);
    });

    it('should have description and rationale for each rule', () => {
      for (const rule of SHELL_SAFETY_RULES) {
        expect(rule.description).toBeTruthy();
        expect(rule.rationale).toBeTruthy();
        expect(rule.pattern).toBeInstanceOf(RegExp);
      }
    });
  });

  describe('stripCommentLines', () => {
    it('should remove lines starting with #', () => {
      const input = '#!/bin/bash\n# comment\necho hello\n  # indented comment\necho world';
      const result = stripCommentLines(input);
      expect(result).toBe('echo hello\necho world');
    });

    it('should preserve lines with inline comments', () => {
      const input = 'echo hello # inline comment';
      const result = stripCommentLines(input);
      expect(result).toContain('echo hello # inline comment');
    });

    it('should handle empty input', () => {
      expect(stripCommentLines('')).toBe('');
    });
  });

  describe('validateShellSafety', () => {
    it('should detect nested parameter expansion', () => {
      const content = 'FOO=${var#${other}}';
      const violations = validateShellSafety(content);
      expect(violations.length).toBeGreaterThan(0);
      expect(violations[0].ruleId).toBe('nested-parameter-expansion');
    });

    it('should detect indirect expansion', () => {
      const content = 'echo ${!var}';
      const violations = validateShellSafety(content);
      expect(violations.length).toBeGreaterThan(0);
      expect(violations[0].ruleId).toBe('indirect-expansion');
    });

    it('should detect parameter transformation', () => {
      const content = 'echo ${var@P}';
      const violations = validateShellSafety(content);
      expect(violations.length).toBeGreaterThan(0);
      expect(violations[0].ruleId).toBe('parameter-transformation');
    });

    it('should detect nested command substitution', () => {
      const content = 'result=$(wc -l $(find . -name "*.md"))';
      const violations = validateShellSafety(content);
      expect(violations.length).toBeGreaterThan(0);
      expect(violations[0].ruleId).toBe('nested-command-substitution');
    });

    it('should detect default with command substitution (:-)', () => {
      const content = 'VAR=${X:-$(date +%s)}';
      const violations = validateShellSafety(content);
      expect(violations.length).toBeGreaterThan(0);
      expect(violations[0].ruleId).toBe('default-with-command-substitution');
    });

    it('should detect alternate with command substitution (:+)', () => {
      const content = 'OUT=${DEBUG:+$(logger debug)}';
      const violations = validateShellSafety(content);
      expect(violations.length).toBeGreaterThan(0);
      expect(violations[0].ruleId).toBe('default-with-command-substitution');
    });

    it('should detect redirection inside command substitution', () => {
      const content = 'result=$(cat < "$file")';
      const violations = validateShellSafety(content);
      expect(violations.length).toBeGreaterThan(0);
      expect(violations[0].ruleId).toBe('redirection-in-command-substitution');
    });

    it('should detect adjacent RANDOM expansion', () => {
      const content = 'suffix=${RANDOM}${RANDOM}';
      const violations = validateShellSafety(content);
      expect(violations.length).toBeGreaterThan(0);
      expect(violations[0].ruleId).toBe('adjacent-random');
    });

    it('should detect eval usage', () => {
      const content = 'eval "$cmd"';
      const violations = validateShellSafety(content);
      expect(violations.length).toBeGreaterThan(0);
      expect(violations[0].ruleId).toBe('eval');
    });

    it('should return empty array for safe shell code', () => {
      const content = [
        'VAR="${GREETING:-hello}"',
        'echo "$VAR"',
        'result=$(date +%s)',
        'if [ -z "${VAR:-}" ]; then',
        '  echo "empty"',
        'fi',
      ].join('\n');
      const violations = validateShellSafety(content);
      expect(violations).toHaveLength(0);
    });

    it('should skip comment lines without altering line numbers', () => {
      // Line 1: comment describing a forbidden pattern (safe)
      // Line 2: actual safe code
      const content = '# This is safe: ${!var} because it is a comment\necho ok';
      const violations = validateShellSafety(content);
      expect(violations).toHaveLength(0);
    });

    it('should report accurate original line numbers (not stripped-content line numbers)', () => {
      // Lines 1-2 are comments, violation is on line 3
      const content = '# comment line 1\n# comment line 2\neval "$dangerous"';
      const violations = validateShellSafety(content);
      expect(violations.length).toBeGreaterThan(0);
      // Line number should be 3 (the original line), not 1 (what it would be after stripping)
      expect(violations[0].lineNumber).toBe(3);
    });

    it('should report correct line number without leading comments', () => {
      const content = 'echo ok\neval "$dangerous"';
      const violations = validateShellSafety(content);
      expect(violations[0].lineNumber).toBe(2);
    });
  });
});

