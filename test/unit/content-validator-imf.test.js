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
});
