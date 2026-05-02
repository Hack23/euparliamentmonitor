// SPDX-FileCopyrightText: 2024-2026 Hack23 AB
// SPDX-License-Identifier: Apache-2.0

/**
 * Unit tests for scripts/utils/metadata-utils.js
 * Tests pl() pluralisation helper and truncateTitle() truncation.
 */

import { describe, it, expect } from 'vitest';
import {
  pl,
  truncateTitle,
  MIN_MEANINGFUL_TITLE_LENGTH,
} from '../../../scripts/utils/metadata-utils.js';

// ---------------------------------------------------------------------------
// pl — pluralisation helper
// ---------------------------------------------------------------------------

describe('metadata-utils', () => {
  describe('pl', () => {
    it('should return singular form for count === 1', () => {
      // Arrange / Act / Assert
      expect(pl(1, 'item', 'items')).toBe('1 item');
    });

    it('should return plural form for count === 0', () => {
      expect(pl(0, 'item', 'items')).toBe('0 items');
    });

    it('should return plural form for count > 1', () => {
      expect(pl(2, 'item', 'items')).toBe('2 items');
      expect(pl(10, 'article', 'articles')).toBe('10 articles');
      expect(pl(100, 'vote', 'votes')).toBe('100 votes');
    });

    it('should return plural form for negative counts', () => {
      expect(pl(-1, 'item', 'items')).toBe('-1 items');
      expect(pl(-2, 'report', 'reports')).toBe('-2 reports');
    });

    it('should handle different singular/plural word pairs', () => {
      expect(pl(1, 'MEP', 'MEPs')).toBe('1 MEP');
      expect(pl(5, 'MEP', 'MEPs')).toBe('5 MEPs');
      expect(pl(1, 'committee', 'committees')).toBe('1 committee');
      expect(pl(3, 'committee', 'committees')).toBe('3 committees');
    });

    it('should work with identical singular and plural', () => {
      expect(pl(1, 'sheep', 'sheep')).toBe('1 sheep');
      expect(pl(5, 'sheep', 'sheep')).toBe('5 sheep');
    });

    it('should handle large counts', () => {
      expect(pl(1000000, 'citizen', 'citizens')).toBe('1000000 citizens');
    });
  });

  // ---------------------------------------------------------------------------
  // truncateTitle — suffix truncation
  // ---------------------------------------------------------------------------

  describe('truncateTitle', () => {
    it('should return the title unchanged when within the limit', () => {
      // Arrange
      const shortTitle = 'Short title';
      // Act
      const result = truncateTitle(shortTitle);
      // Assert
      expect(result).toBe(shortTitle);
    });

    it('should return the title unchanged when exactly at the limit (60 chars)', () => {
      const exactTitle = 'A'.repeat(60);
      expect(truncateTitle(exactTitle)).toBe(exactTitle);
    });

    it('should truncate titles longer than 60 characters with ellipsis', () => {
      const longTitle = 'A'.repeat(61);
      const result = truncateTitle(longTitle);
      expect(result.length).toBe(60);
      expect(result.endsWith('...')).toBe(true);
    });

    it('should truncate to correct length: first 57 chars + "..."', () => {
      const longTitle = 'European Parliament committee report on artificial intelligence regulation';
      const result = truncateTitle(longTitle);
      expect(result.length).toBe(60);
      expect(result).toBe(longTitle.slice(0, 57) + '...');
    });

    it('should respect custom maxLength parameter', () => {
      const title = 'A'.repeat(20);
      const result = truncateTitle(title, 15);
      expect(result.length).toBe(15);
      expect(result.endsWith('...')).toBe(true);
    });

    it('should not truncate when title is shorter than custom maxLength', () => {
      const title = 'Short';
      expect(truncateTitle(title, 100)).toBe(title);
    });

    it('should handle empty string', () => {
      expect(truncateTitle('')).toBe('');
    });

    it('should handle title exactly at custom maxLength', () => {
      const title = 'A'.repeat(10);
      expect(truncateTitle(title, 10)).toBe(title);
    });

    it('should produce correct prefix content before the ellipsis', () => {
      const title = 'The European Parliament has adopted a new regulation on digital markets';
      const result = truncateTitle(title);
      expect(result.startsWith('The European Parliament')).toBe(true);
      expect(result.endsWith('...')).toBe(true);
    });
  });

  // ---------------------------------------------------------------------------
  // MIN_MEANINGFUL_TITLE_LENGTH — exported constant
  // ---------------------------------------------------------------------------

  describe('MIN_MEANINGFUL_TITLE_LENGTH', () => {
    it('should be a positive integer', () => {
      expect(typeof MIN_MEANINGFUL_TITLE_LENGTH).toBe('number');
      expect(MIN_MEANINGFUL_TITLE_LENGTH).toBeGreaterThan(0);
      expect(Number.isInteger(MIN_MEANINGFUL_TITLE_LENGTH)).toBe(true);
    });

    it('should equal 10', () => {
      expect(MIN_MEANINGFUL_TITLE_LENGTH).toBe(10);
    });

    it('should distinguish meaningful titles from short placeholders', () => {
      const shortTitle = 'EU Act';
      const meaningfulTitle = 'European Union Regulation 2026';
      expect(shortTitle.length < MIN_MEANINGFUL_TITLE_LENGTH).toBe(true);
      expect(meaningfulTitle.length >= MIN_MEANINGFUL_TITLE_LENGTH).toBe(true);
    });
  });
});
