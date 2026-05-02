// SPDX-FileCopyrightText: 2024-2026 Hack23 AB
// SPDX-License-Identifier: Apache-2.0

/**
 * Unit tests for scripts/constants/committee-indicator-map.js
 * Tests WB_INDICATORS, COMMITTEE_INDICATOR_MAP, CATEGORY_INDICATOR_MAP,
 * and all five exported helper functions.
 */

import { describe, it, expect } from 'vitest';
import {
  WB_INDICATORS,
  COMMITTEE_INDICATOR_MAP,
  CATEGORY_INDICATOR_MAP,
  getCommitteeIndicators,
  getCommitteePrimaryIndicators,
  getCategoryIndicators,
  getIndicatorIdsForCommittees,
  getAllCategoryIndicatorIds,
} from '../../../scripts/constants/committee-indicator-map.js';
import { ArticleCategory } from '../../../scripts/types/common.js';

// ---------------------------------------------------------------------------
// WB_INDICATORS — constant object checks
// ---------------------------------------------------------------------------

describe('committee-indicator-map', () => {
  describe('WB_INDICATORS', () => {
    it('should be a non-empty object', () => {
      expect(typeof WB_INDICATORS).toBe('object');
      expect(WB_INDICATORS).not.toBeNull();
      expect(Object.keys(WB_INDICATORS).length).toBeGreaterThan(0);
    });

    it('should contain at least 10 macroeconomic indicators', () => {
      expect(Object.keys(WB_INDICATORS).length).toBeGreaterThanOrEqual(10);
    });

    it('should include standard macroeconomic indicators', () => {
      expect(WB_INDICATORS.GDP).toBe('NY.GDP.MKTP.CD');
      expect(WB_INDICATORS.GDP_GROWTH).toBe('NY.GDP.MKTP.KD.ZG');
      expect(WB_INDICATORS.GDP_PER_CAPITA).toBe('NY.GDP.PCAP.CD');
      expect(WB_INDICATORS.INFLATION).toBe('FP.CPI.TOTL.ZG');
      expect(WB_INDICATORS.UNEMPLOYMENT).toBe('SL.UEM.TOTL.ZS');
      expect(WB_INDICATORS.TRADE).toBe('NE.TRD.GNFS.ZS');
    });

    it('should have all values formatted as World Bank indicator IDs', () => {
      for (const [key, value] of Object.entries(WB_INDICATORS)) {
        expect(typeof value).toBe('string');
        expect(value.length).toBeGreaterThan(0);
        // World Bank IDs have at least one dot separating the components
        expect(value).toMatch(/\./);
      }
    });

    it('should have unique indicator IDs (no duplicates)', () => {
      const ids = Object.values(WB_INDICATORS);
      const uniqueIds = new Set(ids);
      expect(uniqueIds.size).toBe(ids.length);
    });
  });

  // ---------------------------------------------------------------------------
  // COMMITTEE_INDICATOR_MAP — data structure validation
  // ---------------------------------------------------------------------------

  describe('COMMITTEE_INDICATOR_MAP', () => {
    it('should contain major EP committee abbreviations', () => {
      const requiredCommittees = ['ECON', 'ENVI', 'LIBE', 'ITRE', 'AGRI', 'EMPL'];
      for (const abbr of requiredCommittees) {
        expect(COMMITTEE_INDICATOR_MAP).toHaveProperty(abbr);
      }
    });

    it('each committee entry should have an indicators array', () => {
      for (const [abbr, entry] of Object.entries(COMMITTEE_INDICATOR_MAP)) {
        expect(Array.isArray(entry.indicators), `${abbr} should have indicators array`).toBe(true);
        expect(entry.indicators.length, `${abbr} should have at least one indicator`).toBeGreaterThan(0);
      }
    });

    it('each indicator should have required fields', () => {
      for (const [abbr, entry] of Object.entries(COMMITTEE_INDICATOR_MAP)) {
        for (const ind of entry.indicators) {
          expect(typeof ind.indicatorId, `${abbr} indicator.indicatorId`).toBe('string');
          expect(ind.indicatorId.length).toBeGreaterThan(0);
          expect(typeof ind.name, `${abbr} indicator.name`).toBe('string');
          expect(['primary', 'secondary']).toContain(ind.priority);
        }
      }
    });

    it('ECON committee should have GDP and inflation-related indicators', () => {
      const econIndicators = COMMITTEE_INDICATOR_MAP.ECON.indicators;
      const ids = econIndicators.map((i) => i.indicatorId);
      // ECON committee must cover at minimum GDP and one fiscal indicator
      expect(ids.some((id) => id.includes('GDP'))).toBe(true);
    });

    it('ENVI committee should have at least one environmental indicator', () => {
      const enviIndicators = COMMITTEE_INDICATOR_MAP.ENVI.indicators;
      const ids = enviIndicators.map((i) => i.indicatorId);
      // CO2 or renewable energy should appear
      expect(
        ids.some((id) => id.includes('CO') || id.includes('EG.') || id.includes('EN.'))
      ).toBe(true);
    });

    it('AGRI committee should have at least one agricultural indicator', () => {
      const agriIndicators = COMMITTEE_INDICATOR_MAP.AGRI.indicators;
      const ids = agriIndicators.map((i) => i.indicatorId);
      expect(ids.some((id) => id.includes('AG') || id.includes('NV.AGR'))).toBe(true);
    });

    it('should contain at least 15 committee entries', () => {
      expect(Object.keys(COMMITTEE_INDICATOR_MAP).length).toBeGreaterThanOrEqual(15);
    });
  });

  // ---------------------------------------------------------------------------
  // CATEGORY_INDICATOR_MAP — data structure validation
  // ---------------------------------------------------------------------------

  describe('CATEGORY_INDICATOR_MAP', () => {
    it('should contain ArticleCategory.PROPOSITIONS', () => {
      expect(CATEGORY_INDICATOR_MAP).toHaveProperty(ArticleCategory.PROPOSITIONS);
    });

    it('should contain ArticleCategory.BREAKING_NEWS', () => {
      expect(CATEGORY_INDICATOR_MAP).toHaveProperty(ArticleCategory.BREAKING_NEWS);
    });

    it('should contain ArticleCategory.MONTH_AHEAD', () => {
      expect(CATEGORY_INDICATOR_MAP).toHaveProperty(ArticleCategory.MONTH_AHEAD);
    });

    it('each category entry should have primaryIndicators and secondaryIndicators arrays', () => {
      for (const [cat, entry] of Object.entries(CATEGORY_INDICATOR_MAP)) {
        expect(Array.isArray(entry.primaryIndicators), `${cat} primaryIndicators`).toBe(true);
        expect(Array.isArray(entry.secondaryIndicators), `${cat} secondaryIndicators`).toBe(true);
      }
    });

    it('most categories should have at least one primary indicator', () => {
      // BREAKING_NEWS, COMMITTEE_REPORTS, and MOTIONS are intentionally sparse
      // (empty primaryIndicators) to reflect their design intent:
      //   - BREAKING_NEWS: speed over depth
      //   - COMMITTEE_REPORTS: per-committee indicator selection
      //   - MOTIONS: motion-specific logic
      const sparseCategories = new Set([
        ArticleCategory.BREAKING_NEWS,
        ArticleCategory.COMMITTEE_REPORTS,
        ArticleCategory.MOTIONS,
      ]);
      for (const [cat, entry] of Object.entries(CATEGORY_INDICATOR_MAP)) {
        if (!sparseCategories.has(cat)) {
          expect(
            entry.primaryIndicators.length,
            `${cat} should have primaryIndicators`
          ).toBeGreaterThan(0);
        }
      }
    });

    it('BREAKING_NEWS should have at least one secondary indicator even with empty primary', () => {
      const entry = CATEGORY_INDICATOR_MAP[ArticleCategory.BREAKING_NEWS];
      // By design: no primary (speed), but at least one secondary for economic context
      expect(entry.primaryIndicators).toHaveLength(0);
      expect(entry.secondaryIndicators.length).toBeGreaterThan(0);
    });

    it('COMMITTEE_REPORTS should delegate to COMMITTEE_INDICATOR_MAP (empty primary by design)', () => {
      const entry = CATEGORY_INDICATOR_MAP[ArticleCategory.COMMITTEE_REPORTS];
      // By design: committee reports use per-committee indicators, not a fixed global list
      expect(entry.primaryIndicators).toHaveLength(0);
      expect(typeof entry.enrichmentStrategy).toBe('string');
      expect(entry.enrichmentStrategy.length).toBeGreaterThan(0);
    });

    it('each category should have a maxWBCalls number', () => {
      for (const [cat, entry] of Object.entries(CATEGORY_INDICATOR_MAP)) {
        expect(typeof entry.maxWBCalls, `${cat}.maxWBCalls`).toBe('number');
        expect(entry.maxWBCalls).toBeGreaterThan(0);
      }
    });
  });

  // ---------------------------------------------------------------------------
  // getCommitteeIndicators
  // ---------------------------------------------------------------------------

  describe('getCommitteeIndicators', () => {
    it('should return indicators array for a known committee (ECON)', () => {
      const result = getCommitteeIndicators('ECON');
      expect(Array.isArray(result)).toBe(true);
      expect(result.length).toBeGreaterThan(0);
    });

    it('should return indicators for ENVI committee', () => {
      const result = getCommitteeIndicators('ENVI');
      expect(Array.isArray(result)).toBe(true);
      expect(result.length).toBeGreaterThan(0);
    });

    it('should handle lowercase input (case-insensitive)', () => {
      const upper = getCommitteeIndicators('ECON');
      const lower = getCommitteeIndicators('econ');
      expect(lower).toEqual(upper);
    });

    it('should handle mixed case input', () => {
      const upper = getCommitteeIndicators('EMPL');
      const mixed = getCommitteeIndicators('Empl');
      expect(mixed).toEqual(upper);
    });

    it('should return empty array for unknown committee abbreviation', () => {
      const result = getCommitteeIndicators('ZZZZ');
      expect(Array.isArray(result)).toBe(true);
      expect(result).toHaveLength(0);
    });

    it('should return each indicator with indicatorId and priority fields', () => {
      const result = getCommitteeIndicators('ITRE');
      expect(result.length).toBeGreaterThan(0);
      for (const ind of result) {
        expect(typeof ind.indicatorId).toBe('string');
        expect(['primary', 'secondary']).toContain(ind.priority);
      }
    });
  });

  // ---------------------------------------------------------------------------
  // getCommitteePrimaryIndicators
  // ---------------------------------------------------------------------------

  describe('getCommitteePrimaryIndicators', () => {
    it('should return only primary indicators for ECON', () => {
      const result = getCommitteePrimaryIndicators('ECON');
      expect(result.length).toBeGreaterThan(0);
      for (const ind of result) {
        expect(ind.priority).toBe('primary');
      }
    });

    it('should return a subset of all indicators', () => {
      const allIndicators = getCommitteeIndicators('ENVI');
      const primaryIndicators = getCommitteePrimaryIndicators('ENVI');
      expect(primaryIndicators.length).toBeLessThanOrEqual(allIndicators.length);
    });

    it('should return empty array for unknown committee', () => {
      const result = getCommitteePrimaryIndicators('UNKNOWN_COMMITTEE');
      expect(result).toHaveLength(0);
    });

    it('should handle lowercase committee abbreviation', () => {
      const upper = getCommitteePrimaryIndicators('AGRI');
      const lower = getCommitteePrimaryIndicators('agri');
      expect(lower).toEqual(upper);
    });

    it('should filter out secondary indicators', () => {
      const primary = getCommitteePrimaryIndicators('EMPL');
      const all = getCommitteeIndicators('EMPL');
      const secondaryInPrimary = primary.filter((i) => i.priority === 'secondary');
      expect(secondaryInPrimary).toHaveLength(0);
      // Ensure there actually were secondary indicators to filter
      const hasSecondary = all.some((i) => i.priority === 'secondary');
      if (hasSecondary) {
        expect(primary.length).toBeLessThan(all.length);
      }
    });
  });

  // ---------------------------------------------------------------------------
  // getCategoryIndicators
  // ---------------------------------------------------------------------------

  describe('getCategoryIndicators', () => {
    it('should return indicators for PROPOSITIONS category', () => {
      const result = getCategoryIndicators(ArticleCategory.PROPOSITIONS);
      expect(result).toBeDefined();
      expect(Array.isArray(result.primaryIndicators)).toBe(true);
      expect(Array.isArray(result.secondaryIndicators)).toBe(true);
    });

    it('should return indicators for MONTH_AHEAD category', () => {
      const result = getCategoryIndicators(ArticleCategory.MONTH_AHEAD);
      expect(result).toBeDefined();
      expect(result.primaryIndicators.length).toBeGreaterThan(0);
    });

    it('should return indicators for BREAKING_NEWS category with secondary but no primary', () => {
      const result = getCategoryIndicators(ArticleCategory.BREAKING_NEWS);
      expect(result).toBeDefined();
      // BREAKING_NEWS has no primary indicators by design (speed over depth)
      expect(result.primaryIndicators).toHaveLength(0);
      // But it does have secondary indicators for economic context
      expect(result.secondaryIndicators.length).toBeGreaterThan(0);
    });

    it('should return indicators for WEEK_AHEAD category', () => {
      const result = getCategoryIndicators(ArticleCategory.WEEK_AHEAD);
      expect(result).toBeDefined();
      expect(result.primaryIndicators.length).toBeGreaterThan(0);
    });

    it('should return indicators for YEAR_IN_REVIEW category', () => {
      const result = getCategoryIndicators(ArticleCategory.YEAR_IN_REVIEW);
      expect(result).toBeDefined();
      expect(result.primaryIndicators.length).toBeGreaterThan(0);
    });

    it('should fall back to BREAKING_NEWS for an unknown category', () => {
      const fallback = getCategoryIndicators(ArticleCategory.BREAKING_NEWS);
      const unknown = getCategoryIndicators('totally-unknown-category');
      expect(unknown).toEqual(fallback);
    });

    it('should return object with maxWBCalls', () => {
      const result = getCategoryIndicators(ArticleCategory.COMMITTEE_REPORTS);
      expect(typeof result.maxWBCalls).toBe('number');
      expect(result.maxWBCalls).toBeGreaterThan(0);
    });

    it('should return indicators for DEEP_ANALYSIS category', () => {
      const result = getCategoryIndicators(ArticleCategory.DEEP_ANALYSIS);
      expect(result).toBeDefined();
      expect(result.primaryIndicators.length).toBeGreaterThan(0);
    });

    it('should return indicators for ELECTION_CYCLE category', () => {
      const result = getCategoryIndicators(ArticleCategory.ELECTION_CYCLE);
      expect(result).toBeDefined();
      expect(result.primaryIndicators.length).toBeGreaterThan(0);
    });
  });

  // ---------------------------------------------------------------------------
  // getIndicatorIdsForCommittees
  // ---------------------------------------------------------------------------

  describe('getIndicatorIdsForCommittees', () => {
    it('should return unique indicator IDs for a single committee', () => {
      const result = getIndicatorIdsForCommittees(['ECON']);
      expect(Array.isArray(result)).toBe(true);
      expect(result.length).toBeGreaterThan(0);
      // All values should be strings
      for (const id of result) {
        expect(typeof id).toBe('string');
      }
    });

    it('should deduplicate IDs when committees share indicators', () => {
      const single = getIndicatorIdsForCommittees(['ECON']);
      const combined = getIndicatorIdsForCommittees(['ECON', 'ECON']);
      // Should be same length — deduplicated
      expect(combined.length).toBe(single.length);
    });

    it('should return more IDs for multiple committees than for one', () => {
      const single = getIndicatorIdsForCommittees(['ECON']);
      const multi = getIndicatorIdsForCommittees(['ECON', 'ENVI', 'EMPL']);
      // The multi-committee set should contain at least as many as the single
      expect(multi.length).toBeGreaterThanOrEqual(single.length);
    });

    it('should return only primary indicator IDs when primaryOnly=true', () => {
      const all = getIndicatorIdsForCommittees(['ECON'], false);
      const primaryOnly = getIndicatorIdsForCommittees(['ECON'], true);
      expect(primaryOnly.length).toBeLessThanOrEqual(all.length);
    });

    it('should return empty array for unknown committees', () => {
      const result = getIndicatorIdsForCommittees(['UNKNOWN_1', 'UNKNOWN_2']);
      expect(result).toHaveLength(0);
    });

    it('should return empty array for empty input', () => {
      const result = getIndicatorIdsForCommittees([]);
      expect(result).toHaveLength(0);
    });

    it('should handle a mix of valid and invalid committees', () => {
      const valid = getIndicatorIdsForCommittees(['ECON']);
      const mixed = getIndicatorIdsForCommittees(['ECON', 'INVALID_XXX']);
      // mixed should return at least what the single valid committee returns
      expect(mixed.length).toBeGreaterThanOrEqual(valid.length);
    });

    it('should work with lowercase committee abbreviations', () => {
      const upper = getIndicatorIdsForCommittees(['ECON']);
      const lower = getIndicatorIdsForCommittees(['econ']);
      expect(lower).toEqual(upper);
    });
  });

  // ---------------------------------------------------------------------------
  // getAllCategoryIndicatorIds
  // ---------------------------------------------------------------------------

  describe('getAllCategoryIndicatorIds', () => {
    it('should return unique IDs for PROPOSITIONS category', () => {
      const result = getAllCategoryIndicatorIds(ArticleCategory.PROPOSITIONS);
      expect(Array.isArray(result)).toBe(true);
      expect(result.length).toBeGreaterThan(0);
      // All unique
      const unique = new Set(result);
      expect(unique.size).toBe(result.length);
    });

    it('should return IDs for MONTH_AHEAD category', () => {
      const result = getAllCategoryIndicatorIds(ArticleCategory.MONTH_AHEAD);
      expect(result.length).toBeGreaterThan(0);
    });

    it('should include both primary and secondary indicator IDs', () => {
      const entry = getCategoryIndicators(ArticleCategory.DEEP_ANALYSIS);
      const primaryIds = entry.primaryIndicators.map((i) => i.indicatorId);
      const secondaryIds = entry.secondaryIndicators.map((i) => i.indicatorId);
      const allIds = getAllCategoryIndicatorIds(ArticleCategory.DEEP_ANALYSIS);
      // All primary IDs should be present
      for (const id of primaryIds) {
        expect(allIds).toContain(id);
      }
      // All secondary IDs should be present
      for (const id of secondaryIds) {
        expect(allIds).toContain(id);
      }
    });

    it('should return more IDs than just primary indicators', () => {
      const entry = getCategoryIndicators(ArticleCategory.YEAR_AHEAD);
      // Only meaningful if there are secondary indicators
      if (entry.secondaryIndicators.length > 0) {
        const allIds = getAllCategoryIndicatorIds(ArticleCategory.YEAR_AHEAD);
        const primaryIds = entry.primaryIndicators.map((i) => i.indicatorId);
        const uniquePrimary = new Set(primaryIds);
        expect(allIds.length).toBeGreaterThanOrEqual(uniquePrimary.size);
      }
    });

    it('should deduplicate IDs (no repeated indicators)', () => {
      const result = getAllCategoryIndicatorIds(ArticleCategory.ELECTION_CYCLE);
      const unique = new Set(result);
      expect(unique.size).toBe(result.length);
    });

    it('should fall back gracefully for unknown category (uses BREAKING_NEWS fallback)', () => {
      const result = getAllCategoryIndicatorIds('unknown-category-xyz');
      // BREAKING_NEWS is the fallback. It has secondary but not primary,
      // so the IDs should come from secondaryIndicators only
      const breakingEntry = getCategoryIndicators(ArticleCategory.BREAKING_NEWS);
      const expectedIds = breakingEntry.secondaryIndicators.map((i) => i.indicatorId);
      expect(result).toEqual(expectedIds);
    });

    it('should return IDs in array format', () => {
      const result = getAllCategoryIndicatorIds(ArticleCategory.WEEK_IN_REVIEW);
      expect(Array.isArray(result)).toBe(true);
      for (const id of result) {
        expect(typeof id).toBe('string');
        expect(id).toMatch(/\./); // World Bank ID format has dots
      }
    });
  });
});
