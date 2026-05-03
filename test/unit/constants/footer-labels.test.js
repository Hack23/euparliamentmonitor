// SPDX-FileCopyrightText: 2024-2026 Hack23 AB
// SPDX-License-Identifier: Apache-2.0

// @ts-check

/**
 * Unit tests for footer localization label constants.
 * Asserts that every new footer LanguageMap constant covers all 14 languages
 * with non-empty values.
 */

import { describe, it, expect } from 'vitest';
import {
  ALL_LANGUAGES,
  FOOTER_HOME_LABELS,
  FOOTER_SITEMAP_LABELS,
  FOOTER_RSS_LABELS,
  FOOTER_GITHUB_REPO_LABELS,
  FOOTER_LICENSE_LABELS,
  FOOTER_EUROPARL_LABELS,
  FOOTER_LINKEDIN_LABELS,
  FOOTER_SECURITY_POLICY_LABELS,
  FOOTER_CONTACT_LABELS,
  FOOTER_DISCLAIMER_LABELS,
  FOOTER_REPORT_ISSUES_LABELS,
  FOOTER_ARTICLES_AVAILABLE_LABELS,
  LANGUAGE_SELECTION_ARIA_LABELS,
  FOOTER_TRUST_BADGES_ARIA_LABELS,
} from '../../../scripts/constants/languages.js';

/** All footer LanguageMap constants under test */
const FOOTER_LABEL_MAPS = [
  { name: 'FOOTER_HOME_LABELS', map: FOOTER_HOME_LABELS },
  { name: 'FOOTER_SITEMAP_LABELS', map: FOOTER_SITEMAP_LABELS },
  { name: 'FOOTER_RSS_LABELS', map: FOOTER_RSS_LABELS },
  { name: 'FOOTER_GITHUB_REPO_LABELS', map: FOOTER_GITHUB_REPO_LABELS },
  { name: 'FOOTER_LICENSE_LABELS', map: FOOTER_LICENSE_LABELS },
  { name: 'FOOTER_EUROPARL_LABELS', map: FOOTER_EUROPARL_LABELS },
  { name: 'FOOTER_LINKEDIN_LABELS', map: FOOTER_LINKEDIN_LABELS },
  { name: 'FOOTER_SECURITY_POLICY_LABELS', map: FOOTER_SECURITY_POLICY_LABELS },
  { name: 'FOOTER_CONTACT_LABELS', map: FOOTER_CONTACT_LABELS },
  { name: 'FOOTER_DISCLAIMER_LABELS', map: FOOTER_DISCLAIMER_LABELS },
  { name: 'FOOTER_REPORT_ISSUES_LABELS', map: FOOTER_REPORT_ISSUES_LABELS },
  { name: 'FOOTER_ARTICLES_AVAILABLE_LABELS', map: FOOTER_ARTICLES_AVAILABLE_LABELS },
  { name: 'LANGUAGE_SELECTION_ARIA_LABELS', map: LANGUAGE_SELECTION_ARIA_LABELS },
  { name: 'FOOTER_TRUST_BADGES_ARIA_LABELS', map: FOOTER_TRUST_BADGES_ARIA_LABELS },
];

describe('constants/footer-labels', () => {
  for (const { name, map } of FOOTER_LABEL_MAPS) {
    describe(name, () => {
      it('should have entries for all 14 languages', () => {
        for (const lang of ALL_LANGUAGES) {
          expect(map).toHaveProperty(lang);
        }
      });

      it('should have non-empty string values for all 14 languages', () => {
        for (const lang of ALL_LANGUAGES) {
          const value = map[lang];
          expect(typeof value, `${name}[${lang}] should be a string`).toBe('string');
          expect(
            String(value).trim().length,
            `${name}[${lang}] should be non-empty`
          ).toBeGreaterThan(0);
        }
      });
    });
  }

  describe('FOOTER_ARTICLES_AVAILABLE_LABELS', () => {
    it('should contain {count} placeholder in all languages', () => {
      for (const lang of ALL_LANGUAGES) {
        const value = FOOTER_ARTICLES_AVAILABLE_LABELS[lang];
        expect(
          String(value),
          `FOOTER_ARTICLES_AVAILABLE_LABELS[${lang}] should contain {count} placeholder`
        ).toContain('{count}');
      }
    });
  });

  describe('buildSiteFooter integration', () => {
    it('should export buildSiteFooter from section-builders', async () => {
      const mod = await import('../../../scripts/templates/section-builders.js');
      expect(typeof mod.buildSiteFooter).toBe('function');
    });

    it('should render localized footer heading for German', async () => {
      const mod = await import('../../../scripts/templates/section-builders.js');
      const html = mod.buildSiteFooter({ lang: 'de', pathPrefix: '../' });
      // German "Quick Links" heading
      expect(html).toContain('Schnelllinks');
      // German "Languages" heading
      expect(html).toContain('Sprachen');
      // German "Built by" heading
      expect(html).toContain('Erstellt von Hack23 AB');
    });

    it('should render localized footer heading for Arabic', async () => {
      const mod = await import('../../../scripts/templates/section-builders.js');
      const html = mod.buildSiteFooter({ lang: 'ar', pathPrefix: '../' });
      // Arabic "Quick Links" heading
      expect(html).toContain('روابط سريعة');
      // Arabic "Languages" heading
      expect(html).toContain('اللغات');
    });

    it('should include articles count line when articleCount is provided', async () => {
      const mod = await import('../../../scripts/templates/section-builders.js');
      const html = mod.buildSiteFooter({ lang: 'en', pathPrefix: '', articleCount: 42 });
      expect(html).toContain('42 articles available');
    });

    it('should omit articles count line when articleCount is not provided', async () => {
      const mod = await import('../../../scripts/templates/section-builders.js');
      const html = mod.buildSiteFooter({ lang: 'en', pathPrefix: '' });
      expect(html).not.toContain('articles available');
    });

    it('should use correct pathPrefix for article pages', async () => {
      const mod = await import('../../../scripts/templates/section-builders.js');
      const html = mod.buildSiteFooter({ lang: 'en', pathPrefix: '../' });
      expect(html).toContain('href="../index.html"');
      expect(html).toContain('href="../sitemap.html"');
      expect(html).toContain('href="../rss.xml"');
    });

    it('should use correct pathPrefix for index pages', async () => {
      const mod = await import('../../../scripts/templates/section-builders.js');
      const html = mod.buildSiteFooter({ lang: 'en', pathPrefix: '' });
      expect(html).toContain('href="index.html"');
      expect(html).toContain('href="sitemap.html"');
      expect(html).toContain('href="rss.xml"');
    });

    it('should include all Hack23 ecosystem cross-links', async () => {
      const mod = await import('../../../scripts/templates/section-builders.js');
      const html = mod.buildSiteFooter({ lang: 'en', pathPrefix: '' });
      expect(html).toContain('https://github.com/Hack23/cia');
      expect(html).toContain('https://github.com/Hack23/riksdagsmonitor');
      expect(html).toContain('https://github.com/Hack23/European-Parliament-MCP-Server');
      expect(html).toContain('https://github.com/Hack23/cia-compliance-manager');
      expect(html).toContain('https://github.com/Hack23/homepage');
      expect(html).toContain('https://github.com/Hack23/blacktrigram');
      expect(html).toContain('https://github.com/Hack23/ISMS-PUBLIC');
    });

    it('should localize the trust-badges aria-label', async () => {
      const mod = await import('../../../scripts/templates/section-builders.js');
      const en = mod.buildSiteFooter({ lang: 'en', pathPrefix: '' });
      expect(en).toContain('aria-label="Project trust badges"');
      const de = mod.buildSiteFooter({ lang: 'de', pathPrefix: '' });
      expect(de).toContain('aria-label="Projekt-Vertrauensabzeichen"');
    });
  });
});
