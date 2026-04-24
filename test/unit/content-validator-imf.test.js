// SPDX-FileCopyrightText: 2024-2026 Hack23 AB
// SPDX-License-Identifier: Apache-2.0

/**
 * Unit tests for the IMF fingerprint helpers and the Wave-1 dual-source
 * OR-gate added to `src/utils/content-validator.ts`.
 *
 * Kept in a dedicated file so the large legacy `content-validator.test.js`
 * stays focused on article-quality validation and this file stays focused
 * on the economic-context evidence rules.
 */

import { describe, it, expect } from 'vitest';
import {
  IMF_STRONG_FINGERPRINTS,
  IMF_INDICATOR_CODES,
  hasIMFEvidence,
  hasWorldBankEvidence,
  articlePolicyHasEconomicContext,
  articlePolicyHasWorldBank,
  articlePolicyHasIMFEconomicEvidence,
  isWave3IMFStrictEnabled,
} from '../../scripts/utils/content-validator.js';

describe('content-validator — IMF fingerprints', () => {
  describe('IMF_STRONG_FINGERPRINTS', () => {
    it('includes the authoritative IMF attributions', () => {
      expect(IMF_STRONG_FINGERPRINTS).toContain('IMF');
      expect(IMF_STRONG_FINGERPRINTS).toContain('International Monetary Fund');
      expect(IMF_STRONG_FINGERPRINTS).toContain('World Economic Outlook');
      expect(IMF_STRONG_FINGERPRINTS).toContain('Fiscal Monitor');
    });

    it('includes every IMF MCP tool identifier', () => {
      for (const tool of [
        'imf-list-databases',
        'imf-search-databases',
        'imf-get-parameter-defs',
        'imf-get-parameter-codes',
        'imf-fetch-data',
      ]) {
        expect(IMF_STRONG_FINGERPRINTS).toContain(tool);
      }
    });
  });

  describe('IMF_INDICATOR_CODES', () => {
    it('includes canonical WEO / FM indicator codes', () => {
      for (const code of ['NGDP_RPCH', 'PCPIPCH', 'LUR', 'GGXWDG_NGDP', 'GGXONLB_NGDP']) {
        expect(IMF_INDICATOR_CODES).toContain(code);
      }
    });
  });

  describe('hasIMFEvidence', () => {
    it('returns true when the text cites the IMF directly', () => {
      expect(hasIMFEvidence('According to the IMF World Economic Outlook, ...')).toBe(true);
    });

    it('returns true when a word-bounded IMF indicator code appears', () => {
      expect(hasIMFEvidence('series: NGDP_RPCH (real GDP growth)')).toBe(true);
      expect(hasIMFEvidence('Primary balance reading GGXONLB_NGDP rose to 1.2 %.')).toBe(true);
    });

    it('does NOT match generic English prose like "gdp" or "cpi"', () => {
      expect(hasIMFEvidence('GDP grew by 2 percent and inflation fell.')).toBe(false);
    });

    it('does NOT match inside a larger identifier', () => {
      expect(hasIMFEvidence('NGDP_RPCHER')).toBe(false);
    });

    it('returns false on empty input', () => {
      expect(hasIMFEvidence('')).toBe(false);
    });

    it('matches the phrase "International Monetary Fund" case-insensitively', () => {
      expect(hasIMFEvidence('international monetary fund')).toBe(true);
      expect(hasIMFEvidence('The International Monetary Fund forecasts ...')).toBe(true);
      expect(hasIMFEvidence('imf world economic outlook (weo) 2026 projections')).toBe(true);
    });

    it('matches tool identifiers and the data host case-insensitively', () => {
      expect(hasIMFEvidence('tool-trace: IMF-Fetch-Data returned 200')).toBe(true);
      expect(hasIMFEvidence('citation: DATA.IMF.ORG/WEO')).toBe(true);
    });

    it('does NOT match "IMF" inside a larger all-caps identifier', () => {
      // Bare identifier `IMF_API_BASE_URL`: `IMF` is followed by `_` (identifier
      // char → no word-boundary), and no other IMF fingerprint appears.
      expect(hasIMFEvidence('export IMF_API_BASE_URL=https://example.invalid/')).toBe(false);
      expect(hasIMFEvidence('IMFOON')).toBe(false);
    });

    it('does NOT match "WEO" inside a larger all-caps identifier', () => {
      expect(hasIMFEvidence('WEO_VERSION_2026')).toBe(false);
      expect(hasIMFEvidence('NWEOFFSET')).toBe(false);
    });

    it('matches short tokens `IMF`/`WEO` case-insensitively when word-bounded', () => {
      // Lowercase / mixed-case, as a standalone word, must pass the gate.
      expect(hasIMFEvidence('the imf forecasts EU growth at 1.2 percent')).toBe(true);
      expect(hasIMFEvidence('Imf projections indicate stable inflation')).toBe(true);
      expect(hasIMFEvidence('the weo vintage is April 2026')).toBe(true);
      // But still excluded inside lowercase identifiers with adjacent identifier chars.
      expect(hasIMFEvidence('imf_api_base_url=https://example.invalid/')).toBe(false);
      expect(hasIMFEvidence('weo_version_2026')).toBe(false);
    });
  });

  describe('articlePolicyHasEconomicContext — OR-gate', () => {
    const requiredType = 'committee-reports';
    const unrequiredType = 'breaking'; // not on POLICY_SLUGS_REQUIRING_WORLD_BANK

    it('passes when only World Bank evidence is present', () => {
      const html = '<p>World Bank indicator GDP_GROWTH for DEU: 1.2 %.</p>';
      expect(articlePolicyHasEconomicContext(html, requiredType)).toBe(true);
      // Parity with the legacy WB gate.
      expect(articlePolicyHasWorldBank(html, requiredType)).toBe(true);
    });

    it('passes when only IMF evidence is present (NEW behaviour)', () => {
      const html = '<p>IMF WEO series NGDP_RPCH for DEU: 1.5 % (forecast).</p>';
      expect(articlePolicyHasEconomicContext(html, requiredType)).toBe(true);
      // The legacy WB gate still rejects this — kept to document the
      // non-breaking Wave 1 posture.
      expect(articlePolicyHasWorldBank(html, requiredType)).toBe(false);
    });

    it('passes when both sources are cited', () => {
      const html =
        '<p>World Bank GDP (2024) and IMF WEO NGDP_RPCH (2026 forecast) both point to ...';
      expect(articlePolicyHasEconomicContext(html, requiredType)).toBe(true);
    });

    it('fails when neither source is cited for a policy-required type', () => {
      const html = '<p>Germany economic mood improved.</p>';
      expect(articlePolicyHasEconomicContext(html, requiredType)).toBe(false);
    });

    it('passes for article types that are not on the required list', () => {
      expect(articlePolicyHasEconomicContext('<p>No evidence.</p>', unrequiredType)).toBe(true);
    });
  });

  describe('hasWorldBankEvidence — parity smoke test', () => {
    it('still detects the literal "World Bank" phrase', () => {
      expect(hasWorldBankEvidence('Source: World Bank Open Data')).toBe(true);
    });

    it('does not false-positive on IMF-only text', () => {
      expect(hasWorldBankEvidence('IMF WEO NGDP_RPCH 2026 forecast')).toBe(false);
    });
  });

  describe('articlePolicyHasIMFEconomicEvidence — Wave-3 strict gate', () => {
    const requiredType = 'committee-reports';
    const unrequiredType = 'breaking';

    it('fails when only World Bank evidence is present (strict is IMF-only)', () => {
      const html = '<p>World Bank indicator GDP_GROWTH for DEU: 1.2 %.</p>';
      expect(articlePolicyHasIMFEconomicEvidence(html, requiredType)).toBe(false);
    });

    it('passes when IMF evidence is present', () => {
      const html = '<p>IMF WEO series NGDP_RPCH for DEU: 1.5 % (forecast).</p>';
      expect(articlePolicyHasIMFEconomicEvidence(html, requiredType)).toBe(true);
    });

    it('passes for article types not on the required list even with no evidence', () => {
      expect(articlePolicyHasIMFEconomicEvidence('<p>No evidence.</p>', unrequiredType)).toBe(
        true
      );
    });

    it('fails when neither source is cited for a required type', () => {
      expect(articlePolicyHasIMFEconomicEvidence('<p>Germany economic mood improved.</p>', requiredType)).toBe(
        false
      );
    });
  });

  describe('isWave3IMFStrictEnabled — flag parser', () => {
    it('returns false when unset', () => {
      expect(isWave3IMFStrictEnabled({})).toBe(false);
      expect(isWave3IMFStrictEnabled({ WAVE3_IMF_STRICT: undefined })).toBe(false);
    });

    it('returns false for falsy values', () => {
      expect(isWave3IMFStrictEnabled({ WAVE3_IMF_STRICT: '' })).toBe(false);
      expect(isWave3IMFStrictEnabled({ WAVE3_IMF_STRICT: '0' })).toBe(false);
      expect(isWave3IMFStrictEnabled({ WAVE3_IMF_STRICT: 'false' })).toBe(false);
      expect(isWave3IMFStrictEnabled({ WAVE3_IMF_STRICT: 'no' })).toBe(false);
      expect(isWave3IMFStrictEnabled({ WAVE3_IMF_STRICT: 'off' })).toBe(false);
    });

    it('returns true for every documented truthy value', () => {
      expect(isWave3IMFStrictEnabled({ WAVE3_IMF_STRICT: '1' })).toBe(true);
      expect(isWave3IMFStrictEnabled({ WAVE3_IMF_STRICT: 'true' })).toBe(true);
      expect(isWave3IMFStrictEnabled({ WAVE3_IMF_STRICT: 'TRUE' })).toBe(true);
      expect(isWave3IMFStrictEnabled({ WAVE3_IMF_STRICT: 'Yes' })).toBe(true);
      expect(isWave3IMFStrictEnabled({ WAVE3_IMF_STRICT: 'on' })).toBe(true);
      expect(isWave3IMFStrictEnabled({ WAVE3_IMF_STRICT: '  true  ' })).toBe(true);
    });
  });
});
