// SPDX-FileCopyrightText: 2024-2026 Hack23 AB
// SPDX-License-Identifier: Apache-2.0

import { describe, it, expect } from 'vitest';
import {
  DATA_MODE_REDUCTION,
  completenessGate,
  infrastructure,
  safeOutputs,
} from '../../scripts/workflows/index.js';

describe('workflows/index (barrel export)', () => {
  describe('DATA_MODE_REDUCTION', () => {
    it('should have all five data modes', () => {
      expect(Object.keys(DATA_MODE_REDUCTION)).toHaveLength(5);
      expect(DATA_MODE_REDUCTION['full']).toBe(1.0);
      expect(DATA_MODE_REDUCTION['title-only']).toBe(0.75);
      expect(DATA_MODE_REDUCTION['degraded-imf']).toBe(0.85);
      expect(DATA_MODE_REDUCTION['degraded-voting']).toBe(0.85);
      expect(DATA_MODE_REDUCTION['minimal']).toBe(0.65);
    });

    it('should have values between 0 and 1', () => {
      for (const value of Object.values(DATA_MODE_REDUCTION)) {
        expect(value).toBeGreaterThan(0);
        expect(value).toBeLessThanOrEqual(1);
      }
    });
  });

  describe('completenessGate namespace', () => {
    it('should export validator functions', () => {
      expect(typeof completenessGate.hasPlaceholders).toBe('function');
      expect(typeof completenessGate.hasMermaid).toBe('function');
      expect(typeof completenessGate.hasWepBand).toBe('function');
      expect(typeof completenessGate.hasAdmiraltyGrade).toBe('function');
      expect(typeof completenessGate.computeEffectiveMinLines).toBe('function');
      expect(typeof completenessGate.resolveDataModeReduction).toBe('function');
    });

    it('should export constants', () => {
      expect(completenessGate.DEFAULT_MIN_LINES).toBe(30);
      expect(completenessGate.LONG_HORIZON_THRESHOLD_MONTHS).toBe(36);
      expect(completenessGate.FAMILY_D_ARTIFACTS).toContain('intelligence/seat-projection.md');
      expect(completenessGate.DIAGRAM_DIRS).toContain('intelligence');
    });

    it('should export regex patterns', () => {
      expect(completenessGate.WEP_BAND_RE).toBeInstanceOf(RegExp);
      expect(completenessGate.ADMIRALTY_RE).toBeInstanceOf(RegExp);
      expect(completenessGate.BLUF_RE).toBeInstanceOf(RegExp);
      expect(completenessGate.PLACEHOLDER_PATTERNS).toBeInstanceOf(Array);
    });
  });

  describe('infrastructure namespace', () => {
    it('should export shell safety rules', () => {
      expect(infrastructure.SHELL_SAFETY_RULES).toBeInstanceOf(Array);
      expect(infrastructure.SHELL_SAFETY_RULES.length).toBeGreaterThan(0);
    });

    it('should export validation functions', () => {
      expect(typeof infrastructure.stripCommentLines).toBe('function');
      expect(typeof infrastructure.validateShellSafety).toBe('function');
    });
  });

  describe('safeOutputs namespace', () => {
    it('should export forbidden phrases', () => {
      expect(safeOutputs.FORBIDDEN_PHRASES).toContain('checkpoint pr');
      expect(safeOutputs.FORBIDDEN_PHRASES).toContain('keep-alive');
      expect(safeOutputs.FORBIDDEN_PHRASES).toContain('heartbeat');
    });

    it('should export forbidden tool refs', () => {
      expect(safeOutputs.FORBIDDEN_TOOL_REFS).toContain('safeoutputs___push_repo_memory');
    });

    it('should export timing constraints', () => {
      expect(safeOutputs.STANDARD_CONSTRAINTS.maxPRCalls).toBe(1);
      expect(safeOutputs.STANDARD_CONSTRAINTS.targetMinute).toBe(42);
      expect(safeOutputs.STANDARD_CONSTRAINTS.hardDeadlineMinute).toBe(45);

      expect(safeOutputs.ELECTORAL_CONSTRAINTS.targetMinute).toBe(47);
      expect(safeOutputs.ELECTORAL_CONSTRAINTS.hardDeadlineMinute).toBe(50);
    });
  });
});
