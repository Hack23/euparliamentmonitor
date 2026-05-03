// SPDX-FileCopyrightText: 2024-2026 Hack23 AB
// SPDX-License-Identifier: Apache-2.0

import { describe, expect, it } from 'vitest';
import {
  getNewsIndexSeo,
  getSitemapSeo,
  getPoliticalIntelligenceSeo,
} from '../../scripts/generators/seo-copy.js';
import { ALL_LANGUAGES } from '../../scripts/constants/language-core.js';

const getters = [
  ['getNewsIndexSeo', getNewsIndexSeo],
  ['getSitemapSeo', getSitemapSeo],
  ['getPoliticalIntelligenceSeo', getPoliticalIntelligenceSeo],
];

describe('seo-copy', () => {
  for (const [name, getter] of getters) {
    describe(name, () => {
      it.each(ALL_LANGUAGES)('returns a fully-populated PageSeoCopy for %s', (lang) => {
        const copy = getter(lang);
        expect(copy.keywords.length).toBeGreaterThan(0);
        expect(copy.ogImageAlt.length).toBeGreaterThan(0);
        expect(copy.breadcrumbHome.length).toBeGreaterThan(0);
        expect(copy.breadcrumbCurrent.length).toBeGreaterThan(0);
        expect(copy.breadcrumbAriaLabel.length).toBeGreaterThan(0);
        expect(copy.faqHeading.length).toBeGreaterThan(0);
        expect(copy.faqs.length).toBeGreaterThanOrEqual(5);
        for (const faq of copy.faqs) {
          expect(faq.q.length).toBeGreaterThan(0);
          // Answers must be substantive enough to qualify for FAQPage rich
          // results (Google requires meaningful answer text).
          expect(faq.a.length).toBeGreaterThan(20);
        }
      });

      it('falls back to English for unknown language codes', () => {
        const fallback = getter('xx');
        const en = getter('en');
        expect(fallback.faqHeading).toBe(en.faqHeading);
        expect(fallback.faqs.length).toBe(en.faqs.length);
      });
    });
  }

  it('every page type uses a distinct breadcrumbCurrent label', () => {
    const labels = new Set(getters.map(([, g]) => g('en').breadcrumbCurrent));
    expect(labels.size).toBe(getters.length);
  });

  it('non-English locales translate the breadcrumb home label', () => {
    expect(getNewsIndexSeo('sv').breadcrumbHome).not.toBe(getNewsIndexSeo('en').breadcrumbHome);
    expect(getNewsIndexSeo('de').breadcrumbHome).not.toBe(getNewsIndexSeo('en').breadcrumbHome);
    expect(getNewsIndexSeo('ja').breadcrumbHome).not.toBe(getNewsIndexSeo('en').breadcrumbHome);
  });
});

