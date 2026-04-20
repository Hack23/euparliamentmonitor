// SPDX-FileCopyrightText: 2024-2026 Hack23 AB
// SPDX-License-Identifier: Apache-2.0

/**
 * Unit tests for imf-data.js — EU country-code mapping, SDMX-JSON
 * parsing (including the forecast flag), series helpers,
 * indicator formatting, and the HTML context builder.
 */

import { describe, it, expect } from 'vitest';
import {
  IMF_EU_COUNTRY_CODES,
  IMF_POLICY_INDICATORS,
  IMF_INDICATOR_SDMX_CODES,
  IMF_AGGREGATE_LABELS,
  getIMFCountryCode,
  isIMFEUMemberState,
  parseSDMXJSON,
  getMostRecentObservation,
  getForecastPoints,
  formatIMFValue,
  buildIMFEconomicContext,
  buildIMFEconomicContextHTML,
} from '../../scripts/utils/imf-data.js';

describe('imf-data', () => {
  describe('IMF_EU_COUNTRY_CODES', () => {
    it('includes all 27 EU member states', () => {
      expect(Object.keys(IMF_EU_COUNTRY_CODES)).toHaveLength(27);
    });

    it('maps DE → DEU and FR → FRA', () => {
      expect(IMF_EU_COUNTRY_CODES.DE).toBe('DEU');
      expect(IMF_EU_COUNTRY_CODES.FR).toBe('FRA');
    });
  });

  describe('getIMFCountryCode', () => {
    it('returns the alpha-3 code for EU member states', () => {
      expect(getIMFCountryCode('DE')).toBe('DEU');
      expect(getIMFCountryCode('SE')).toBe('SWE');
    });

    it('is case-insensitive', () => {
      expect(getIMFCountryCode('de')).toBe('DEU');
      expect(getIMFCountryCode('Sv')).toBeNull(); // Sv is not SE
    });

    it('returns null for non-EU ISO-2 codes', () => {
      expect(getIMFCountryCode('US')).toBeNull();
      expect(getIMFCountryCode('JP')).toBeNull();
    });

    it('returns null on empty input', () => {
      expect(getIMFCountryCode('')).toBeNull();
    });
  });

  describe('isIMFEUMemberState', () => {
    it('returns true for EU codes', () => {
      expect(isIMFEUMemberState('DE')).toBe(true);
      expect(isIMFEUMemberState('PL')).toBe(true);
    });

    it('returns false for non-EU and empty codes', () => {
      expect(isIMFEUMemberState('US')).toBe(false);
      expect(isIMFEUMemberState('')).toBe(false);
    });
  });

  describe('IMF_POLICY_INDICATORS', () => {
    it('covers gdp, gdpGrowth, inflation, unemployment, govDebt, primaryBalance', () => {
      const keys = Object.keys(IMF_POLICY_INDICATORS);
      for (const k of [
        'gdp',
        'gdpGrowth',
        'inflation',
        'unemployment',
        'govDebt',
        'primaryBalance',
      ]) {
        expect(keys).toContain(k);
      }
    });

    it('maps each indicator to a concrete SDMX code', () => {
      expect(IMF_POLICY_INDICATORS.gdpGrowth.indicator).toBe('NGDP_RPCH');
      expect(IMF_POLICY_INDICATORS.govDebt.indicator).toBe('GGXWDG_NGDP');
      expect(IMF_POLICY_INDICATORS.primaryBalance.indicator).toBe('GGXONLB_NGDP');
    });

    it('flags forecasts where IMF publishes them', () => {
      expect(IMF_POLICY_INDICATORS.gdpGrowth.hasForecast).toBe(true);
      expect(IMF_POLICY_INDICATORS.govDebt.hasForecast).toBe(true);
      expect(IMF_POLICY_INDICATORS.realEffectiveExchangeRate.hasForecast).toBe(false);
    });
  });

  describe('IMF_INDICATOR_SDMX_CODES', () => {
    it('is derived from IMF_POLICY_INDICATORS', () => {
      const fromMap = new Set(Object.values(IMF_POLICY_INDICATORS).map((m) => m.indicator));
      expect(new Set(IMF_INDICATOR_SDMX_CODES)).toEqual(fromMap);
    });

    it('has no duplicate entries', () => {
      expect(new Set(IMF_INDICATOR_SDMX_CODES).size).toBe(IMF_INDICATOR_SDMX_CODES.length);
    });
  });

  describe('IMF_AGGREGATE_LABELS', () => {
    it('exposes the EU aggregate label', () => {
      expect(IMF_AGGREGATE_LABELS.EU).toBe('European Union');
    });
  });

  describe('parseSDMXJSON', () => {
    it('returns an empty map for null/undefined/empty', () => {
      expect(parseSDMXJSON(null).size).toBe(0);
      expect(parseSDMXJSON(undefined).size).toBe(0);
      expect(parseSDMXJSON('').size).toBe(0);
    });

    it('returns an empty map when input is not valid JSON', () => {
      expect(parseSDMXJSON('{not json').size).toBe(0);
    });

    it('parses a minimal SDMX payload with actuals + forecasts', () => {
      const payload = {
        data: {
          dataSets: [
            {
              series: {
                '0:0': {
                  observations: {
                    0: [3.1, null],
                    1: [2.8, null],
                    2: [2.5, 0], // forecast — OBS_STATUS index 0 → code "F"
                  },
                },
              },
            },
          ],
          structure: {
            dimensions: {
              observation: [
                {
                  id: 'TIME_PERIOD',
                  values: [{ id: '2024' }, { id: '2025' }, { id: '2026' }],
                },
              ],
            },
            attributes: {
              observation: [
                {
                  id: 'OBS_STATUS',
                  values: [{ id: 'F' }, { id: 'E' }],
                },
              ],
            },
          },
        },
      };
      const result = parseSDMXJSON(payload);
      const series = result.get('0:0');
      expect(series).toBeDefined();
      expect(series).toHaveLength(3);
      expect(series[0]).toMatchObject({ period: '2024', year: 2024, value: 3.1, isForecast: false });
      expect(series[2]).toMatchObject({ period: '2026', year: 2026, value: 2.5, isForecast: true });
    });

    it('handles string OBS_STATUS flags', () => {
      const payload = {
        data: {
          dataSets: [
            {
              series: {
                '0:0': { observations: { 0: [1.1, 'F'] } },
              },
            },
          ],
          structure: {
            dimensions: {
              observation: [{ id: 'TIME_PERIOD', values: [{ id: '2030' }] }],
            },
            attributes: {
              observation: [{ id: 'OBS_STATUS', values: [{ id: 'F' }] }],
            },
          },
        },
      };
      const series = parseSDMXJSON(payload).get('0:0');
      expect(series[0].isForecast).toBe(true);
    });

    it('tolerates missing structure blocks', () => {
      const result = parseSDMXJSON({ data: { dataSets: [{}] } });
      expect(result.size).toBe(0);
    });

    it('coerces numeric strings to numbers and filters non-finite cells to null', () => {
      const payload = {
        data: {
          dataSets: [
            {
              series: {
                '0:0': {
                  observations: {
                    0: ['3.5'],
                    1: [''],
                    2: ['NaN'],
                  },
                },
              },
            },
          ],
          structure: {
            dimensions: {
              observation: [
                {
                  id: 'TIME_PERIOD',
                  values: [{ id: '2020' }, { id: '2021' }, { id: '2022' }],
                },
              ],
            },
            attributes: { observation: [] },
          },
        },
      };
      const series = parseSDMXJSON(payload).get('0:0');
      expect(series[0].value).toBe(3.5);
      expect(series[1].value).toBeNull();
      expect(series[2].value).toBeNull();
    });

    it('accepts stringified JSON input', () => {
      const payload = JSON.stringify({
        data: {
          dataSets: [{ series: { a: { observations: { 0: [1] } } } }],
          structure: {
            dimensions: { observation: [{ id: 'TIME_PERIOD', values: [{ id: '2020' }] }] },
            attributes: { observation: [] },
          },
        },
      });
      const result = parseSDMXJSON(payload);
      expect(result.size).toBe(1);
      expect(result.get('a')[0].year).toBe(2020);
    });
  });

  describe('getMostRecentObservation', () => {
    it('returns null for an empty series', () => {
      expect(getMostRecentObservation([])).toBeNull();
    });

    it('returns null when every observation is null-valued', () => {
      expect(
        getMostRecentObservation([
          { period: '2025', year: 2025, value: null, isForecast: false },
        ])
      ).toBeNull();
    });

    it('prefers the actual over the forecast at the same year', () => {
      const observations = [
        { period: '2025-actual', year: 2025, value: 2.8, isForecast: false },
        { period: '2025-forecast', year: 2025, value: 2.6, isForecast: true },
        { period: '2024', year: 2024, value: 3.1, isForecast: false },
      ];
      const recent = getMostRecentObservation(observations);
      expect(recent.isForecast).toBe(false);
      expect(recent.value).toBe(2.8);
    });

    it('returns the highest year when values exist', () => {
      const recent = getMostRecentObservation([
        { period: '2020', year: 2020, value: 1.0, isForecast: false },
        { period: '2026', year: 2026, value: 2.0, isForecast: true },
      ]);
      expect(recent.year).toBe(2026);
    });
  });

  describe('getForecastPoints', () => {
    it('returns only forecast points, oldest first', () => {
      const points = getForecastPoints([
        { period: '2024', year: 2024, value: 3.1, isForecast: false },
        { period: '2027', year: 2027, value: 2.7, isForecast: true },
        { period: '2026', year: 2026, value: 2.5, isForecast: true },
        { period: '2028', year: 2028, value: null, isForecast: true },
      ]);
      expect(points.map((p) => p.year)).toEqual([2026, 2027]);
    });

    it('includes the vintage label when provided', () => {
      const points = getForecastPoints(
        [{ period: '2026', year: 2026, value: 2.5, isForecast: true }],
        'WEO-April-2026'
      );
      expect(points[0].vintage).toBe('WEO-April-2026');
    });
  });

  describe('formatIMFValue', () => {
    it('formats percentage indicators with one decimal', () => {
      expect(formatIMFValue(3.14159, IMF_POLICY_INDICATORS.gdpGrowth)).toBe('3.1%');
      expect(formatIMFValue(2.0, IMF_POLICY_INDICATORS.inflation)).toBe('2.0%');
    });

    it('formats GDP with magnitude suffix', () => {
      expect(formatIMFValue(4.2e12, IMF_POLICY_INDICATORS.gdp)).toBe('$4.2T');
      expect(formatIMFValue(200e9, IMF_POLICY_INDICATORS.gdp)).toBe('$200.0B');
    });

    it('formats population in millions', () => {
      expect(formatIMFValue(83.2, IMF_POLICY_INDICATORS.population)).toBe('83.2M');
    });

    it('returns N/A for null or non-finite values', () => {
      expect(formatIMFValue(null, IMF_POLICY_INDICATORS.gdpGrowth)).toBe('N/A');
      expect(formatIMFValue(Number.NaN, IMF_POLICY_INDICATORS.gdpGrowth)).toBe('N/A');
      expect(formatIMFValue(Number.POSITIVE_INFINITY, IMF_POLICY_INDICATORS.gdpGrowth)).toBe('N/A');
    });
  });

  describe('buildIMFEconomicContext', () => {
    function makeSeries(overrides) {
      return {
        databaseId: 'WEO',
        countryId: 'DEU',
        countryName: 'Germany',
        indicatorId: 'NGDP_RPCH',
        indicatorName: 'Real GDP growth',
        frequency: 'A',
        observations: [],
        ...overrides,
      };
    }

    it('returns an empty context when the series map is empty', () => {
      const ctx = buildIMFEconomicContext('DE', 'Germany', new Map());
      expect(ctx.indicators).toEqual([]);
      expect(ctx.countryCode).toBe('DE');
      expect(ctx.forecastHorizonYear).toBeUndefined();
    });

    it('builds a row per indicator using the most recent observation', () => {
      const map = new Map();
      map.set(
        'gdpGrowth',
        makeSeries({
          observations: [
            { period: '2025', year: 2025, value: 1.2, isForecast: false },
            { period: '2026', year: 2026, value: 1.5, isForecast: true },
          ],
        })
      );
      const ctx = buildIMFEconomicContext('DE', 'Germany', map, 'WEO-April-2026');
      expect(ctx.indicators).toHaveLength(1);
      expect(ctx.indicators[0].value).toBe(1.5);
      expect(ctx.indicators[0].isForecast).toBe(true);
      expect(ctx.indicators[0].vintage).toBe('WEO-April-2026');
      expect(ctx.forecastHorizonYear).toBe(2026);
    });

    it('skips series with no observations', () => {
      const map = new Map();
      map.set('gdpGrowth', makeSeries({ observations: [] }));
      const ctx = buildIMFEconomicContext('DE', 'Germany', map);
      expect(ctx.indicators).toEqual([]);
    });

    it('ignores unknown indicator keys', () => {
      const map = new Map();
      map.set(
        'notARealKey',
        makeSeries({
          observations: [{ period: '2025', year: 2025, value: 5, isForecast: false }],
        })
      );
      const ctx = buildIMFEconomicContext('DE', 'Germany', map);
      expect(ctx.indicators).toEqual([]);
    });
  });

  describe('buildIMFEconomicContextHTML', () => {
    it('returns empty string when there are no indicators', () => {
      const html = buildIMFEconomicContextHTML({
        countryCode: 'DE',
        countryName: 'Germany',
        indicators: [],
        dataTimestamp: new Date().toISOString(),
      });
      expect(html).toBe('');
    });

    it('renders a row per indicator and a forecast flag marker', () => {
      const html = buildIMFEconomicContextHTML({
        countryCode: 'DE',
        countryName: 'Germany',
        indicators: [
          {
            name: 'Real GDP growth',
            indicatorId: 'NGDP_RPCH',
            database: 'WEO',
            value: 1.5,
            period: '2026',
            year: 2026,
            isForecast: true,
            formatted: '1.5%',
            vintage: 'WEO-April-2026',
          },
        ],
        forecastHorizonYear: 2030,
        dataTimestamp: new Date().toISOString(),
      });
      expect(html).toContain('Real GDP growth');
      expect(html).toContain('1.5%');
      expect(html).toContain('data-forecast="true"');
      expect(html).toContain('WEO-April-2026');
      expect(html).toContain('Projections extend through 2030');
      expect(html).toContain('data.imf.org');
    });

    it('escapes HTML in country name and indicator fields', () => {
      const html = buildIMFEconomicContextHTML({
        countryCode: 'DE',
        countryName: '<script>alert(1)</script>',
        indicators: [
          {
            name: '<img src=x>',
            indicatorId: 'NGDP_RPCH',
            database: 'WEO',
            value: 1,
            period: '2025',
            year: 2025,
            isForecast: false,
            formatted: '1.0%',
          },
        ],
        dataTimestamp: new Date().toISOString(),
      });
      expect(html).not.toContain('<script>alert');
      expect(html).not.toContain('<img src=x>');
      expect(html).toContain('&lt;script&gt;');
    });
  });
});
