// SPDX-FileCopyrightText: 2024-2026 Hack23 AB
// SPDX-License-Identifier: Apache-2.0

/**
 * Unit tests for committee-indicator-map.js
 * Tests committee → World Bank indicator mappings, article category mappings, and helper functions
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
} from '../../scripts/constants/committee-indicator-map.js';
import { ArticleCategory } from '../../scripts/types/common.js';
import { POLICY_INDICATORS } from '../../scripts/utils/world-bank-data.js';

describe('committee-indicator-map', () => {
  describe('WB_INDICATORS', () => {
    it('should contain all core macro-economic indicators', () => {
      expect(WB_INDICATORS.GDP).toBe('NY.GDP.MKTP.CD');
      expect(WB_INDICATORS.GDP_GROWTH).toBe('NY.GDP.MKTP.KD.ZG');
      expect(WB_INDICATORS.INFLATION).toBe('FP.CPI.TOTL.ZG');
      expect(WB_INDICATORS.UNEMPLOYMENT).toBe('SL.UEM.TOTL.ZS');
    });

    it('should contain environment indicators', () => {
      expect(WB_INDICATORS.CO2_EMISSIONS).toBe('EN.ATM.CO2E.PC');
      expect(WB_INDICATORS.RENEWABLE_ENERGY).toBe('EG.FEC.RNEW.ZS');
      expect(WB_INDICATORS.FOREST_AREA).toBe('AG.LND.FRST.ZS');
    });

    it('should contain trade indicators', () => {
      expect(WB_INDICATORS.TRADE).toBe('NE.TRD.GNFS.ZS');
      expect(WB_INDICATORS.EXPORTS_GDP).toBe('NE.EXP.GNFS.ZS');
      expect(WB_INDICATORS.FDI_NET).toBe('BX.KLT.DINV.WD.GD.ZS');
    });

    it('should be consistent with existing POLICY_INDICATORS', () => {
      expect(WB_INDICATORS.GDP).toBe(POLICY_INDICATORS.gdp);
      expect(WB_INDICATORS.GDP_GROWTH).toBe(POLICY_INDICATORS.gdpGrowth);
      expect(WB_INDICATORS.INFLATION).toBe(POLICY_INDICATORS.inflation);
      expect(WB_INDICATORS.UNEMPLOYMENT).toBe(POLICY_INDICATORS.unemployment);
      expect(WB_INDICATORS.TRADE).toBe(POLICY_INDICATORS.trade);
      expect(WB_INDICATORS.CO2_EMISSIONS).toBe(POLICY_INDICATORS.co2Emissions);
      expect(WB_INDICATORS.POPULATION).toBe(POLICY_INDICATORS.population);
      expect(WB_INDICATORS.RD_EXPENDITURE).toBe(POLICY_INDICATORS.rdExpenditure);
    });

    it('should have at least 30 distinct indicator IDs', () => {
      const values = Object.values(WB_INDICATORS);
      expect(values.length).toBeGreaterThanOrEqual(30);
      // All should be unique
      expect(new Set(values).size).toBe(values.length);
    });
  });

  describe('COMMITTEE_INDICATOR_MAP', () => {
    it('should cover all 20 EP standing committees and sub-committees', () => {
      const committees = Object.keys(COMMITTEE_INDICATOR_MAP);
      expect(committees.length).toBeGreaterThanOrEqual(20);
    });

    it('should include the 5 featured committees', () => {
      const featured = ['ENVI', 'ECON', 'AFET', 'LIBE', 'AGRI'];
      for (const abbr of featured) {
        expect(COMMITTEE_INDICATOR_MAP[abbr]).toBeDefined();
        expect(COMMITTEE_INDICATOR_MAP[abbr].abbreviation).toBe(abbr);
      }
    });

    it('should have at least one indicator per committee', () => {
      for (const [abbr, entry] of Object.entries(COMMITTEE_INDICATOR_MAP)) {
        expect(entry.indicators.length).toBeGreaterThan(0);
        expect(entry.name).toBeTruthy();
        expect(entry.policyDomain).toBeTruthy();
      }
    });

    it('should mark ECON indicators with correct priorities', () => {
      const econ = COMMITTEE_INDICATOR_MAP['ECON'];
      expect(econ).toBeDefined();
      const primary = econ.indicators.filter((i) => i.priority === 'primary');
      const secondary = econ.indicators.filter((i) => i.priority === 'secondary');
      expect(primary.length).toBeGreaterThan(0);
      expect(secondary.length).toBeGreaterThan(0);
    });

    it('should include ENVI with environment-relevant indicators', () => {
      const envi = COMMITTEE_INDICATOR_MAP['ENVI'];
      expect(envi).toBeDefined();
      const indicatorIds = envi.indicators.map((i) => i.indicatorId);
      expect(indicatorIds).toContain(WB_INDICATORS.CO2_EMISSIONS);
      expect(indicatorIds).toContain(WB_INDICATORS.RENEWABLE_ENERGY);
    });

    it('should include AGRI with agriculture-relevant indicators', () => {
      const agri = COMMITTEE_INDICATOR_MAP['AGRI'];
      expect(agri).toBeDefined();
      const indicatorIds = agri.indicators.map((i) => i.indicatorId);
      expect(indicatorIds).toContain(WB_INDICATORS.AGRICULTURE_GDP);
      expect(indicatorIds).toContain(WB_INDICATORS.CEREAL_YIELD);
    });

    it('should include AFET with geopolitical indicators', () => {
      const afet = COMMITTEE_INDICATOR_MAP['AFET'];
      expect(afet).toBeDefined();
      const indicatorIds = afet.indicators.map((i) => i.indicatorId);
      expect(indicatorIds).toContain(WB_INDICATORS.MILITARY_EXPENDITURE);
      expect(indicatorIds).toContain(WB_INDICATORS.TRADE);
    });

    it('should have valid analysis perspectives', () => {
      const validPerspectives = [
        'political', 'economic', 'social', 'legal',
        'environmental', 'geopolitical', 'institutional',
      ];
      for (const entry of Object.values(COMMITTEE_INDICATOR_MAP)) {
        expect(entry.analysisPerspectives.length).toBeGreaterThan(0);
        for (const perspective of entry.analysisPerspectives) {
          expect(validPerspectives).toContain(perspective);
        }
      }
    });

    it('should have consistent indicator structure', () => {
      for (const entry of Object.values(COMMITTEE_INDICATOR_MAP)) {
        for (const ind of entry.indicators) {
          expect(ind.indicatorId).toBeTruthy();
          expect(ind.name).toBeTruthy();
          expect(ind.relevance).toBeTruthy();
          expect(ind.usage).toBeTruthy();
          expect(['primary', 'secondary']).toContain(ind.priority);
        }
      }
    });
  });

  describe('CATEGORY_INDICATOR_MAP', () => {
    it('should cover all ArticleCategory values', () => {
      for (const category of Object.values(ArticleCategory)) {
        expect(CATEGORY_INDICATOR_MAP[category]).toBeDefined();
        expect(CATEGORY_INDICATOR_MAP[category].category).toBe(category);
      }
    });

    it('should have enrichment strategy description for each category', () => {
      for (const entry of Object.values(CATEGORY_INDICATOR_MAP)) {
        expect(entry.enrichmentStrategy).toBeTruthy();
        expect(entry.enrichmentStrategy.length).toBeGreaterThan(20);
      }
    });

    it('should have maxWBCalls within reasonable bounds', () => {
      for (const entry of Object.values(CATEGORY_INDICATOR_MAP)) {
        expect(entry.maxWBCalls).toBeGreaterThanOrEqual(1);
        expect(entry.maxWBCalls).toBeLessThanOrEqual(5);
      }
    });

    it('should have higher maxWBCalls for deep analysis than breaking news', () => {
      const deepAnalysis = CATEGORY_INDICATOR_MAP[ArticleCategory.DEEP_ANALYSIS];
      const breaking = CATEGORY_INDICATOR_MAP[ArticleCategory.BREAKING_NEWS];
      expect(deepAnalysis.maxWBCalls).toBeGreaterThan(breaking.maxWBCalls);
    });

    it('should have primary indicators for PROPOSITIONS', () => {
      const props = CATEGORY_INDICATOR_MAP[ArticleCategory.PROPOSITIONS];
      expect(props.primaryIndicators.length).toBeGreaterThan(0);
    });

    it('should have no primary indicators for BREAKING_NEWS', () => {
      const breaking = CATEGORY_INDICATOR_MAP[ArticleCategory.BREAKING_NEWS];
      expect(breaking.primaryIndicators).toHaveLength(0);
    });

    it('should have COMMITTEE_REPORTS delegate to COMMITTEE_INDICATOR_MAP', () => {
      const committees = CATEGORY_INDICATOR_MAP[ArticleCategory.COMMITTEE_REPORTS];
      expect(committees.enrichmentStrategy).toContain('COMMITTEE_INDICATOR_MAP');
    });
  });

  describe('getCommitteeIndicators', () => {
    it('should return indicators for a known committee', () => {
      const indicators = getCommitteeIndicators('ECON');
      expect(indicators.length).toBeGreaterThan(0);
    });

    it('should be case-insensitive', () => {
      const upper = getCommitteeIndicators('ECON');
      const lower = getCommitteeIndicators('econ');
      expect(upper).toEqual(lower);
    });

    it('should return empty array for unknown committee', () => {
      expect(getCommitteeIndicators('UNKNOWN')).toEqual([]);
    });
  });

  describe('getCommitteePrimaryIndicators', () => {
    it('should return only primary indicators', () => {
      const primary = getCommitteePrimaryIndicators('ECON');
      expect(primary.length).toBeGreaterThan(0);
      for (const ind of primary) {
        expect(ind.priority).toBe('primary');
      }
    });

    it('should return fewer or equal indicators than getCommitteeIndicators', () => {
      const all = getCommitteeIndicators('ECON');
      const primary = getCommitteePrimaryIndicators('ECON');
      expect(primary.length).toBeLessThanOrEqual(all.length);
    });
  });

  describe('getCategoryIndicators', () => {
    it('should return entry for a valid category', () => {
      const entry = getCategoryIndicators(ArticleCategory.PROPOSITIONS);
      expect(entry.category).toBe(ArticleCategory.PROPOSITIONS);
      expect(entry.primaryIndicators).toBeDefined();
      expect(entry.secondaryIndicators).toBeDefined();
    });
  });

  describe('getIndicatorIdsForCommittees', () => {
    it('should return deduplicated indicator IDs for multiple committees', () => {
      const ids = getIndicatorIdsForCommittees(['ECON', 'ENVI']);
      expect(ids.length).toBeGreaterThan(0);
      // Should be deduplicated
      expect(new Set(ids).size).toBe(ids.length);
    });

    it('should filter to primary-only when requested', () => {
      const all = getIndicatorIdsForCommittees(['ECON'], false);
      const primaryOnly = getIndicatorIdsForCommittees(['ECON'], true);
      expect(primaryOnly.length).toBeLessThanOrEqual(all.length);
    });

    it('should handle empty array', () => {
      expect(getIndicatorIdsForCommittees([])).toEqual([]);
    });
  });

  describe('getAllCategoryIndicatorIds', () => {
    it('should return combined primary + secondary indicator IDs', () => {
      const ids = getAllCategoryIndicatorIds(ArticleCategory.PROPOSITIONS);
      expect(ids.length).toBeGreaterThan(0);
      // Should be deduplicated
      expect(new Set(ids).size).toBe(ids.length);
    });

    it('should return more IDs for DEEP_ANALYSIS than BREAKING_NEWS', () => {
      const deep = getAllCategoryIndicatorIds(ArticleCategory.DEEP_ANALYSIS);
      const breaking = getAllCategoryIndicatorIds(ArticleCategory.BREAKING_NEWS);
      expect(deep.length).toBeGreaterThan(breaking.length);
    });
  });
});
