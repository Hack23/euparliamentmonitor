// SPDX-FileCopyrightText: 2024-2026 Hack23 AB
// SPDX-License-Identifier: Apache-2.0

/**
 * Unit tests for scripts/constants/analysis-constants.js
 * Tests AI_MARKER, isAiMarker(), isPlaceholderText(), and AI_PENDING_CLASS.
 */

import { describe, it, expect } from 'vitest';
import {
  AI_MARKER,
  AI_PENDING_CLASS,
  isAiMarker,
  isPlaceholderText,
} from '../../../scripts/constants/analysis-constants.js';

// ---------------------------------------------------------------------------
// AI_MARKER constant
// ---------------------------------------------------------------------------

describe('analysis-constants', () => {
  describe('AI_MARKER', () => {
    it('should be the expected marker string', () => {
      expect(AI_MARKER).toBe('[AI_ANALYSIS_REQUIRED]');
    });

    it('should be a non-empty string', () => {
      expect(typeof AI_MARKER).toBe('string');
      expect(AI_MARKER.length).toBeGreaterThan(0);
    });
  });

  // ---------------------------------------------------------------------------
  // AI_PENDING_CLASS constant
  // ---------------------------------------------------------------------------

  describe('AI_PENDING_CLASS', () => {
    it('should be the expected CSS class name', () => {
      expect(AI_PENDING_CLASS).toBe('ai-analysis-pending');
    });

    it('should be a valid CSS class string', () => {
      expect(typeof AI_PENDING_CLASS).toBe('string');
      expect(AI_PENDING_CLASS).toMatch(/^[a-z][a-z0-9-]*$/);
    });
  });

  // ---------------------------------------------------------------------------
  // isAiMarker — recognises all three marker formats
  // ---------------------------------------------------------------------------

  describe('isAiMarker', () => {
    describe('current standard marker', () => {
      it('should return true for the primary AI_MARKER value', () => {
        // Arrange / Act / Assert
        expect(isAiMarker('[AI_ANALYSIS_REQUIRED]')).toBe(true);
      });

      it('should return true when using the AI_MARKER constant itself', () => {
        expect(isAiMarker(AI_MARKER)).toBe(true);
      });

      it('should return true for AI_MARKER with surrounding whitespace', () => {
        expect(isAiMarker('  [AI_ANALYSIS_REQUIRED]  ')).toBe(true);
        expect(isAiMarker('\t[AI_ANALYSIS_REQUIRED]\n')).toBe(true);
      });
    });

    describe('historic markers', () => {
      it('should return true for [REQUIRED] historic marker', () => {
        expect(isAiMarker('[REQUIRED]')).toBe(true);
      });

      it('should return true for [?] shorthand marker', () => {
        expect(isAiMarker('[?]')).toBe(true);
      });

      it('should return true for historic markers with whitespace', () => {
        expect(isAiMarker('  [REQUIRED]  ')).toBe(true);
        expect(isAiMarker('  [?]  ')).toBe(true);
      });
    });

    describe('non-marker values', () => {
      it('should return false for regular text', () => {
        expect(isAiMarker('Some analysis text')).toBe(false);
      });

      it('should return false for partial marker match', () => {
        expect(isAiMarker('[AI_ANALYSIS_REQUIRED] Some additional text')).toBe(false);
        expect(isAiMarker('Prefix [AI_ANALYSIS_REQUIRED]')).toBe(false);
      });

      it('should return false for empty string', () => {
        expect(isAiMarker('')).toBe(false);
      });

      it('should return false for whitespace-only string', () => {
        expect(isAiMarker('   ')).toBe(false);
      });

      it('should return false for null', () => {
        expect(isAiMarker(null)).toBe(false);
      });

      it('should return false for undefined', () => {
        expect(isAiMarker(undefined)).toBe(false);
      });

      it('should return false for similar but wrong bracket patterns', () => {
        expect(isAiMarker('{AI_ANALYSIS_REQUIRED}')).toBe(false);
        expect(isAiMarker('AI_ANALYSIS_REQUIRED')).toBe(false);
      });

      it('should return false for a real analysis sentence', () => {
        const analysis = 'The European Parliament voted in favour of the regulation with 423 votes for, 156 against.';
        expect(isAiMarker(analysis)).toBe(false);
      });
    });
  });

  // ---------------------------------------------------------------------------
  // isPlaceholderText — placeholder pattern detection
  // ---------------------------------------------------------------------------

  describe('isPlaceholderText', () => {
    describe('placeholder keyword', () => {
      it('should return true for "placeholder"', () => {
        expect(isPlaceholderText('placeholder')).toBe(true);
      });

      it('should return true for "Placeholder" (case-insensitive)', () => {
        expect(isPlaceholderText('Placeholder')).toBe(true);
      });

      it('should return true for "PLACEHOLDER"', () => {
        expect(isPlaceholderText('PLACEHOLDER')).toBe(true);
      });

      it('should return true for text containing "placeholder"', () => {
        expect(isPlaceholderText('This is a placeholder value')).toBe(true);
      });
    });

    describe('data unavailable patterns', () => {
      it('should return true for "data unavailable"', () => {
        expect(isPlaceholderText('data unavailable')).toBe(true);
      });

      it('should return true for "data_unavailable"', () => {
        expect(isPlaceholderText('data_unavailable')).toBe(true);
      });

      it('should return true for "data-unavailable"', () => {
        expect(isPlaceholderText('data-unavailable')).toBe(true);
      });

      it('should return true for "Data Unavailable" (case-insensitive)', () => {
        expect(isPlaceholderText('Data Unavailable')).toBe(true);
      });

      it('should return true for "DATA.UNAVAILABLE"', () => {
        expect(isPlaceholderText('DATA.UNAVAILABLE')).toBe(true);
      });
    });

    describe('example entity patterns', () => {
      it('should return true for "Example motion"', () => {
        expect(isPlaceholderText('Example motion')).toBe(true);
      });

      it('should return true for "example motion" (lowercase)', () => {
        expect(isPlaceholderText('example motion')).toBe(true);
      });

      it('should return true for "Example amendment"', () => {
        expect(isPlaceholderText('Example amendment')).toBe(true);
      });

      it('should return true for "Example group"', () => {
        expect(isPlaceholderText('Example group')).toBe(true);
      });

      it('should return true for "EXAMPLE MOTION" (uppercase)', () => {
        expect(isPlaceholderText('EXAMPLE MOTION')).toBe(true);
      });

      it('should return true when example entity pattern is in a sentence', () => {
        expect(isPlaceholderText('This is an Example amendment to test with')).toBe(true);
      });
    });

    describe('non-placeholder values', () => {
      it('should return false for real political text', () => {
        const realText = 'The ECON committee approved the Banking Union regulation';
        expect(isPlaceholderText(realText)).toBe(false);
      });

      it('should return false for empty string', () => {
        expect(isPlaceholderText('')).toBe(false);
      });

      it('should return false for a normal article title', () => {
        expect(isPlaceholderText('European Parliament votes on AI Act')).toBe(false);
      });

      it('should return false for text that contains "example" but not followed by the trigger words', () => {
        expect(isPlaceholderText('For example, the committee discussed...')).toBe(false);
      });

      it('should return false for "data" without unavailable', () => {
        expect(isPlaceholderText('The data shows strong growth')).toBe(false);
      });

      it('should return false for "unavailable" without data prefix', () => {
        expect(isPlaceholderText('The document is unavailable online')).toBe(false);
      });
    });
  });
});
