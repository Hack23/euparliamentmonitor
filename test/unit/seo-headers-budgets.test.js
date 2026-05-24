// SPDX-FileCopyrightText: 2024-2026 Hack23 AB
// SPDX-License-Identifier: Apache-2.0

/**
 * @fileoverview 14-locale × per-SEO-surface budget matrix.
 *
 * For every supported publishing locale and every SEO surface
 * (`<title>`, `<meta description>`, `og:title`, `og:description`,
 * `twitter:title`, `twitter:description`, `og:image:alt`,
 * JSON-LD `headline`), render an article with a deliberately
 * over-budget title and description, then assert that the emitted
 * HTML stays at-or-under the per-script-family budget declared in
 * `src/aggregator/metadata/seo-budgets.ts`.
 *
 * Why this matters. The previous matrix test (`seo-headers-matrix.test.js`)
 * only checked tag *presence* and *localization-not-equal-to-English*.
 * The 342-char Chinese `<meta description>`, 275-char Japanese
 * description, 145-char Arabic title and 115-char French title that
 * shipped to the live site were all invisible to that test because
 * none of those values were ever asserted. This file closes that gap.
 *
 * Ground truth is driven from the same `seo-budgets.ts` table the
 * renderer reads from, so a budget tweak in one place fails any
 * non-conformant surface here.
 */

import { describe, it, expect } from 'vitest';
import { wrapArticleHtml } from '../../scripts/aggregator/article-html.js';
import {
  ALL_SCRIPT_FAMILIES,
  budgetFor,
  classifyScript,
  SEO_BUDGETS,
} from '../../scripts/aggregator/metadata/seo-budgets.js';
import { ALL_LANGUAGES } from '../../scripts/constants/language-core.js';

// Surfaces measured by parsing the rendered HTML. Each entry is a
// `(surface, extract-regex)` pair — extract returns the inner content
// string so test code can assert on `.length` against `budgetFor(...)`.
const SURFACE_EXTRACTORS = [
  {
    surface: 'title',
    extract: (html) => {
      const m = html.match(/<title>([^<]*)<\/title>/);
      return m ? m[1] : null;
    },
  },
  {
    surface: 'metaDescription',
    extract: (html) => {
      const m = html.match(/<meta\s+name="description"\s+content="([^"]*)"/);
      return m ? m[1] : null;
    },
  },
  {
    surface: 'ogTitle',
    extract: (html) => {
      const m = html.match(/<meta\s+property="og:title"\s+content="([^"]*)"/);
      return m ? m[1] : null;
    },
  },
  {
    surface: 'ogDescription',
    extract: (html) => {
      const m = html.match(/<meta\s+property="og:description"\s+content="([^"]*)"/);
      return m ? m[1] : null;
    },
  },
  {
    surface: 'twitterTitle',
    extract: (html) => {
      const m = html.match(/<meta\s+name="twitter:title"\s+content="([^"]*)"/);
      return m ? m[1] : null;
    },
  },
  {
    surface: 'twitterDescription',
    extract: (html) => {
      const m = html.match(/<meta\s+name="twitter:description"\s+content="([^"]*)"/);
      return m ? m[1] : null;
    },
  },
  {
    surface: 'imageAlt',
    extract: (html) => {
      const m = html.match(/<meta\s+property="og:image:alt"\s+content="([^"]*)"/);
      return m ? m[1] : null;
    },
  },
  {
    surface: 'jsonLdHeadline',
    extract: (html) => {
      const m = html.match(/"headline":"((?:\\"|[^"])*)"/);
      return m ? m[1] : null;
    },
  },
];

// Synthetic title/description pairs designed to overflow every budget
// in the table, so the renderer's clamp is exercised on every surface.
// The Latin/CJK/RTL bodies were lifted from real briefs (anonymized)
// to keep punctuation/whitespace patterns realistic.
const OVERFLOW_INPUTS = {
  latin: {
    title:
      'European Parliament adopts wide-ranging legislative package covering digital sovereignty, defence procurement reform, agricultural subsidy realignment, and a unified migration corridor framework binding all member states for the remainder of the EP10 term',
    description:
      'Members of the European Parliament voted on Thursday to adopt a far-reaching package of legislative measures spanning digital sovereignty, defence procurement reform, agricultural subsidy realignment, and a unified migration corridor framework that will bind every member state for the remainder of the current EP10 term and reshape the institutional balance between the Commission, Council, and Parliament in ways that will reverberate across the next legislative cycle and beyond.',
  },
  cjk: {
    title:
      '欧洲议会本周四通过了一揽子立法措施涵盖数字主权国防采购改革农业补贴重新调整以及对所有成员国具有约束力的统一移民走廊框架涉及整个第十届欧洲议会任期并将重塑机构间平衡',
    description:
      '欧洲议会本周四通过了一揽子立法措施涵盖数字主权国防采购改革农业补贴重新调整以及对所有成员国具有约束力的统一移民走廊框架涉及整个第十届欧洲议会任期并将重塑机构间平衡委员会理事会和议会之间的力量关系将在未来立法周期产生深远影响',
  },
  rtl: {
    title:
      'اعتمد البرلمان الأوروبي يوم الخميس حزمة واسعة النطاق من التدابير التشريعية تشمل السيادة الرقمية وإصلاح المشتريات الدفاعية وإعادة تنظيم الإعانات الزراعية وإطار ممر الهجرة الموحد الملزم لجميع الدول الأعضاء',
    description:
      'صوت أعضاء البرلمان الأوروبي يوم الخميس على اعتماد حزمة واسعة النطاق من التدابير التشريعية تشمل السيادة الرقمية وإصلاح المشتريات الدفاعية وإعادة تنظيم الإعانات الزراعية وإطار ممر الهجرة الموحد الذي سيلزم كل دولة عضو خلال ما تبقى من الدورة الحالية للبرلمان العاشر وسيعيد تشكيل التوازن المؤسسي',
  },
};

function renderForLocale(lang) {
  const fam = classifyScript(lang);
  const sample = OVERFLOW_INPUTS[fam];
  return wrapArticleHtml({
    lang,
    articleSlug: '2026-05-22-propositions',
    body: '<h1>Test Article</h1><p>Body content with enough words to give the JSON-LD wordCount field a non-zero value.</p>',
    title: sample.title,
    description: sample.description,
    extendedDescription: sample.description,
    date: '2026-05-22',
    articleType: 'propositions',
  });
}

describe('SEO header budgets — 14-locale × 8-surface matrix', () => {
  for (const lang of ALL_LANGUAGES) {
    describe(`lang=${lang} (family=${classifyScript(lang)})`, () => {
      for (const { surface, extract } of SURFACE_EXTRACTORS) {
        it(`emits ${surface} ≤ ${budgetFor(lang, surface)} chars`, () => {
          const html = renderForLocale(lang);
          const value = extract(html);
          expect(value, `surface=${surface} was not emitted for lang=${lang}`).not.toBeNull();
          expect(
            value.length,
            `surface=${surface} lang=${lang} length=${value.length} exceeds budget=${budgetFor(lang, surface)}; value="${value}"`,
          ).toBeLessThanOrEqual(budgetFor(lang, surface));
        });
      }
    });
  }
});

describe('SEO header budgets — table is the single source of truth', () => {
  it('exposes a budget for every script family for every surface', () => {
    for (const surface of Object.keys(SEO_BUDGETS)) {
      for (const family of ALL_SCRIPT_FAMILIES) {
        expect(
          SEO_BUDGETS[surface][family],
          `missing budget for surface=${surface} family=${family}`,
        ).toBeGreaterThan(0);
      }
    }
  });
});
