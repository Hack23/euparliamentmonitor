// SPDX-FileCopyrightText: 2024-2026 Hack23 AB
// SPDX-License-Identifier: Apache-2.0

/**
 * Unit tests for world-bank-data.js
 * Tests CSV parsing, indicator formatting, EU country mapping, and economic context
 */

/* eslint-disable no-undef */

import { describe, it, expect } from 'vitest';
import {
  EU_COUNTRY_CODES,
  EU_AGGREGATE_CODE,
  POLICY_INDICATORS,
  parseWorldBankCSV,
  formatIndicatorValue,
  getMostRecentValue,
  buildEconomicContext,
  getWorldBankCountryCode,
  isEUMemberState,
  buildEconomicContextHTML,
} from '../../scripts/utils/world-bank-data.js';

describe('world-bank-data', () => {
  describe('EU_COUNTRY_CODES', () => {
    it('should contain all 27 EU member states', () => {
      expect(Object.keys(EU_COUNTRY_CODES)).toHaveLength(27);
    });

    it('should map DE to DEU', () => {
      expect(EU_COUNTRY_CODES['DE']).toBe('DEU');
    });

    it('should map FR to FRA', () => {
      expect(EU_COUNTRY_CODES['FR']).toBe('FRA');
    });

    it('should map SE to SWE', () => {
      expect(EU_COUNTRY_CODES['SE']).toBe('SWE');
    });

    it('should map all codes to 3-letter strings', () => {
      for (const [key, value] of Object.entries(EU_COUNTRY_CODES)) {
        expect(key).toHaveLength(2);
        expect(value).toHaveLength(3);
      }
    });
  });

  describe('EU_AGGREGATE_CODE', () => {
    it('should be EUU', () => {
      expect(EU_AGGREGATE_CODE).toBe('EUU');
    });
  });

  describe('POLICY_INDICATORS', () => {
    it('should contain gdp indicator', () => {
      expect(POLICY_INDICATORS.gdp).toBe('NY.GDP.MKTP.CD');
    });

    it('should contain all 8 policy-relevant indicators', () => {
      const keys = Object.keys(POLICY_INDICATORS);
      expect(keys).toHaveLength(8);
      expect(keys).toContain('gdp');
      expect(keys).toContain('gdpGrowth');
      expect(keys).toContain('inflation');
      expect(keys).toContain('unemployment');
      expect(keys).toContain('trade');
      expect(keys).toContain('co2Emissions');
      expect(keys).toContain('population');
      expect(keys).toContain('rdExpenditure');
    });
  });

  describe('parseWorldBankCSV', () => {
    it('should return empty array for empty input', () => {
      expect(parseWorldBankCSV('')).toEqual([]);
    });

    it('should return empty array for null-like input', () => {
      expect(parseWorldBankCSV(null)).toEqual([]);
      expect(parseWorldBankCSV(undefined)).toEqual([]);
    });

    it('should return empty array for header-only CSV', () => {
      expect(parseWorldBankCSV('country.id,value,date')).toEqual([]);
    });

    it('should parse standard World Bank CSV format', () => {
      const csv = `country.id,country.value,indicator.id,indicator.value,date,value
DEU,Germany,NY.GDP.MKTP.CD,GDP (current US$),2023,4082000000000
DEU,Germany,NY.GDP.MKTP.CD,GDP (current US$),2022,4072000000000`;

      const result = parseWorldBankCSV(csv);
      expect(result).toHaveLength(2);
      expect(result[0].countryId).toBe('DEU');
      expect(result[0].countryName).toBe('Germany');
      expect(result[0].indicatorId).toBe('NY.GDP.MKTP.CD');
      expect(result[0].year).toBe(2023);
      expect(result[0].value).toBe(4082000000000);
    });

    it('should handle alternative header names', () => {
      const csv = `countryiso3code,country_name,indicator_id,indicator_name,year,value
FRA,France,FP.CPI.TOTL.ZG,Inflation,2023,5.7`;

      const result = parseWorldBankCSV(csv);
      expect(result).toHaveLength(1);
      expect(result[0].countryId).toBe('FRA');
      expect(result[0].countryName).toBe('France');
      expect(result[0].value).toBe(5.7);
    });

    it('should handle null values', () => {
      const csv = `country.id,country.value,indicator.id,indicator.value,date,value
DEU,Germany,NY.GDP.MKTP.CD,GDP,2023,`;

      const result = parseWorldBankCSV(csv);
      expect(result).toHaveLength(1);
      expect(result[0].value).toBeNull();
    });

    it('should skip rows with invalid year', () => {
      const csv = `country.id,country.value,indicator.id,indicator.value,date,value
DEU,Germany,NY.GDP.MKTP.CD,GDP,invalid,1000`;

      const result = parseWorldBankCSV(csv);
      expect(result).toHaveLength(0);
    });
  });

  describe('formatIndicatorValue', () => {
    it('should return N/A for null value', () => {
      expect(formatIndicatorValue(null, POLICY_INDICATORS.gdp)).toBe('N/A');
    });

    it('should format GDP in trillions', () => {
      expect(formatIndicatorValue(4.2e12, POLICY_INDICATORS.gdp)).toBe('$4.2T');
    });

    it('should format GDP in billions', () => {
      expect(formatIndicatorValue(500e9, POLICY_INDICATORS.gdp)).toBe('$500.0B');
    });

    it('should format GDP in millions', () => {
      expect(formatIndicatorValue(50e6, POLICY_INDICATORS.gdp)).toBe('$50.0M');
    });

    it('should format population in millions', () => {
      expect(formatIndicatorValue(83.2e6, POLICY_INDICATORS.population)).toBe('83.2M');
    });

    it('should format population in billions', () => {
      expect(formatIndicatorValue(1.4e9, POLICY_INDICATORS.population)).toBe('1.40B');
    });

    it('should format percentage indicators', () => {
      expect(formatIndicatorValue(3.1, POLICY_INDICATORS.gdpGrowth)).toBe('3.1%');
      expect(formatIndicatorValue(5.7, POLICY_INDICATORS.inflation)).toBe('5.7%');
      expect(formatIndicatorValue(6.3, POLICY_INDICATORS.unemployment)).toBe('6.3%');
    });

    it('should format CO2 emissions', () => {
      expect(formatIndicatorValue(7.5, POLICY_INDICATORS.co2Emissions)).toBe('7.5 t/cap');
    });

    it('should format unknown indicator as decimal', () => {
      expect(formatIndicatorValue(42.567, 'UNKNOWN.ID')).toBe('42.57');
    });
  });

  describe('getMostRecentValue', () => {
    it('should return null for empty array', () => {
      expect(getMostRecentValue([])).toBeNull();
    });

    it('should return null when all values are null', () => {
      const data = [
        { countryId: 'DEU', countryName: 'Germany', indicatorId: 'GDP', indicatorName: 'GDP', year: 2023, value: null },
        { countryId: 'DEU', countryName: 'Germany', indicatorId: 'GDP', indicatorName: 'GDP', year: 2022, value: null },
      ];
      expect(getMostRecentValue(data)).toBeNull();
    });

    it('should return the most recent non-null value', () => {
      const data = [
        { countryId: 'DEU', countryName: 'Germany', indicatorId: 'GDP', indicatorName: 'GDP', year: 2023, value: null },
        { countryId: 'DEU', countryName: 'Germany', indicatorId: 'GDP', indicatorName: 'GDP', year: 2022, value: 4072e9 },
        { countryId: 'DEU', countryName: 'Germany', indicatorId: 'GDP', indicatorName: 'GDP', year: 2021, value: 3800e9 },
      ];
      const result = getMostRecentValue(data);
      expect(result.year).toBe(2022);
      expect(result.value).toBe(4072e9);
    });
  });

  describe('buildEconomicContext', () => {
    it('should build context with indicator summaries', () => {
      const indicatorData = new Map([
        [POLICY_INDICATORS.gdp, [
          { countryId: 'DEU', countryName: 'Germany', indicatorId: POLICY_INDICATORS.gdp, indicatorName: 'GDP', year: 2023, value: 4.2e12 },
        ]],
        [POLICY_INDICATORS.unemployment, [
          { countryId: 'DEU', countryName: 'Germany', indicatorId: POLICY_INDICATORS.unemployment, indicatorName: 'Unemployment', year: 2023, value: 3.1 },
        ]],
      ]);

      const context = buildEconomicContext('DE', 'Germany', indicatorData);
      expect(context.countryCode).toBe('DE');
      expect(context.countryName).toBe('Germany');
      expect(context.indicators).toHaveLength(2);
      expect(context.indicators[0].formatted).toBe('$4.2T');
      expect(context.indicators[1].formatted).toBe('3.1%');
      expect(context.dataTimestamp).toBeTruthy();
    });

    it('should handle empty indicator data', () => {
      const context = buildEconomicContext('DE', 'Germany', new Map());
      expect(context.indicators).toHaveLength(0);
    });
  });

  describe('getWorldBankCountryCode', () => {
    it('should return World Bank code for EU member states', () => {
      expect(getWorldBankCountryCode('DE')).toBe('DEU');
      expect(getWorldBankCountryCode('FR')).toBe('FRA');
      expect(getWorldBankCountryCode('SE')).toBe('SWE');
    });

    it('should be case-insensitive', () => {
      expect(getWorldBankCountryCode('de')).toBe('DEU');
      expect(getWorldBankCountryCode('De')).toBe('DEU');
    });

    it('should return null for non-EU countries', () => {
      expect(getWorldBankCountryCode('US')).toBeNull();
      expect(getWorldBankCountryCode('GB')).toBeNull();
      expect(getWorldBankCountryCode('XX')).toBeNull();
    });
  });

  describe('isEUMemberState', () => {
    it('should return true for EU member states', () => {
      expect(isEUMemberState('DE')).toBe(true);
      expect(isEUMemberState('FR')).toBe(true);
      expect(isEUMemberState('SE')).toBe(true);
    });

    it('should return false for non-EU countries', () => {
      expect(isEUMemberState('US')).toBe(false);
      expect(isEUMemberState('GB')).toBe(false);
    });

    it('should be case-insensitive', () => {
      expect(isEUMemberState('de')).toBe(true);
    });
  });

  describe('buildEconomicContextHTML', () => {
    it('should return empty string when no indicators', () => {
      const context = { countryCode: 'DE', countryName: 'Germany', indicators: [], dataTimestamp: '' };
      expect(buildEconomicContextHTML(context)).toBe('');
    });

    it('should generate valid HTML table', () => {
      const context = {
        countryCode: 'DE',
        countryName: 'Germany',
        indicators: [
          { name: 'GDP', indicatorId: 'NY.GDP.MKTP.CD', value: 4.2e12, year: 2023, formatted: '$4.2T' },
        ],
        dataTimestamp: '2024-01-01',
      };
      const html = buildEconomicContextHTML(context);
      expect(html).toContain('<section class="economic-context"');
      expect(html).toContain('Germany');
      expect(html).toContain('GDP');
      expect(html).toContain('$4.2T');
      expect(html).toContain('2023');
      expect(html).toContain('World Bank Open Data');
      expect(html).toContain('aria-label');
    });

    it('should escape HTML in country name', () => {
      const context = {
        countryCode: 'XX',
        countryName: '<script>alert("xss")</script>',
        indicators: [
          { name: 'GDP', indicatorId: 'NY.GDP.MKTP.CD', value: 100, year: 2023, formatted: '$100' },
        ],
        dataTimestamp: '2024-01-01',
      };
      const html = buildEconomicContextHTML(context);
      expect(html).not.toContain('<script>');
      expect(html).toContain('&lt;script&gt;');
    });
  });
});
