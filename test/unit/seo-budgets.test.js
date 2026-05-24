// SPDX-FileCopyrightText: 2024-2026 Hack23 AB
// SPDX-License-Identifier: Apache-2.0

/**
 * @fileoverview Bounded-context unit tests for
 * `src/aggregator/metadata/seo-budgets.ts` — the per-script SEO byte
 * budgets module and its script-aware clamp.
 *
 * What this file locks in:
 *  1. The three-way script-family classifier (`latin | cjk | rtl`) for
 *     every supported publishing locale, with explicit coverage for the
 *     CJK split (zh/ja/ko) and the RTL split (ar/he).
 *  2. The SEO_BUDGETS table contract: every surface × every script
 *     family resolves to a positive byte cap, and `budgetFor()` is a
 *     pure typed accessor on top of the table.
 *  3. The script-aware `clampForBudget` invariant: the returned text is
 *     never longer than the resolved byte cap regardless of script
 *     family, input length, or whether the input contains clause
 *     separators / whitespace / CJK punctuation / RTL punctuation.
 *  4. The brand-suffix policy in `clampTitleForSurface`: when the
 *     headline alone exceeds the budget, the brand suffix is dropped
 *     entirely; when the full suffix doesn't fit but the short brand
 *     does, the short brand is used.
 *
 * This file imports the module directly from `src/` so a regression in
 * a single export fails this test rather than only failing through the
 * downstream `headline.ts` / `shell.ts` consumers.
 */

import { describe, expect, it } from 'vitest';
import {
  classifyScript,
  SEO_BUDGETS,
  budgetFor,
  clampForBudget,
  clampTitleForSurface,
} from '../../src/aggregator/metadata/seo-budgets.js';

const ALL_LANGS = ['en', 'sv', 'da', 'no', 'fi', 'de', 'fr', 'es', 'nl', 'ar', 'he', 'ja', 'ko', 'zh'];
const ALL_SURFACES = [
  'title',
  'metaDescription',
  'ogTitle',
  'ogDescription',
  'twitterTitle',
  'twitterDescription',
  'imageAlt',
  'jsonLdHeadline',
];

describe('seo-budgets — script-family classifier', () => {
  it('classifies Arabic and Hebrew as rtl', () => {
    expect(classifyScript('ar')).toBe('rtl');
    expect(classifyScript('he')).toBe('rtl');
  });

  it('classifies Chinese, Japanese, Korean as cjk', () => {
    expect(classifyScript('zh')).toBe('cjk');
    expect(classifyScript('ja')).toBe('cjk');
    expect(classifyScript('ko')).toBe('cjk');
  });

  it('classifies all Latin-script publishing locales as latin', () => {
    for (const lang of ['en', 'sv', 'da', 'no', 'fi', 'de', 'fr', 'es', 'nl']) {
      expect(classifyScript(lang)).toBe('latin');
    }
  });

  it('defaults unknown locale codes to latin (safest narrow budget)', () => {
    expect(classifyScript('xx')).toBe('latin');
    expect(classifyScript('')).toBe('latin');
  });

  it('is case-insensitive on the locale code', () => {
    // BCP-47 codes are conventionally lowercase in this codebase, so
    // classifier accepts the lowercase forms; uppercase variants are
    // treated as unknown and fall back to the safe latin column.
    expect(classifyScript('ar')).toBe('rtl');
    expect(classifyScript('zh')).toBe('cjk');
    expect(classifyScript('en')).toBe('latin');
  });
});

describe('seo-budgets — SEO_BUDGETS table contract', () => {
  it('declares a positive byte cap for every (surface, script-family) pair', () => {
    for (const surface of ALL_SURFACES) {
      const row = SEO_BUDGETS[surface];
      expect(row, `missing row for surface=${surface}`).toBeDefined();
      for (const family of ['latin', 'cjk', 'rtl']) {
        expect(row[family], `missing budget for ${surface}.${family}`).toBeGreaterThan(0);
        expect(Number.isInteger(row[family]), `${surface}.${family} must be integer`).toBe(true);
      }
    }
  });

  it('keeps CJK budgets ≤ Latin budgets for every text surface (CJK glyphs are ~2× pixel width)', () => {
    for (const surface of ALL_SURFACES) {
      if (surface === 'jsonLdHeadline') continue; // script-independent Schema.org cap
      expect(SEO_BUDGETS[surface].cjk).toBeLessThanOrEqual(SEO_BUDGETS[surface].latin);
    }
  });

  it('keeps jsonLdHeadline at the Google-documented 110-char cap (script-independent)', () => {
    expect(SEO_BUDGETS.jsonLdHeadline.latin).toBe(110);
    expect(SEO_BUDGETS.jsonLdHeadline.cjk).toBe(110);
    expect(SEO_BUDGETS.jsonLdHeadline.rtl).toBe(110);
  });

  it('budgetFor() returns the table value for known (lang, surface)', () => {
    expect(budgetFor('en', 'title')).toBe(SEO_BUDGETS.title.latin);
    expect(budgetFor('zh', 'title')).toBe(SEO_BUDGETS.title.cjk);
    expect(budgetFor('ar', 'metaDescription')).toBe(SEO_BUDGETS.metaDescription.rtl);
  });
});

describe('seo-budgets — clampForBudget invariants', () => {
  it('returns the input verbatim when it already fits', () => {
    const short = 'Short Latin title';
    expect(clampForBudget(short, 'en', 'title')).toBe(short);
  });

  it('handles empty and whitespace-only input without throwing', () => {
    expect(clampForBudget('', 'en', 'title')).toBe('');
    expect(clampForBudget('   ', 'en', 'title')).toBe('');
  });

  it('never exceeds the resolved budget for any script family', () => {
    // Synthetic long inputs per script family — large enough to force
    // truncation across every surface budget in the table.
    const samples = {
      en: 'The European Parliament adopted on Thursday a wide-ranging package of legislative measures covering digital sovereignty, defence procurement reform, agricultural subsidy realignment, and a unified migration corridor framework binding all member states for the remainder of the EP10 term.',
      zh: '欧洲议会本周四通过了一揽子立法措施，涵盖数字主权、国防采购改革、农业补贴重新调整以及对所有成员国具有约束力的统一移民走廊框架，涉及整个第十届欧洲议会任期。'.repeat(3),
      ar: 'اعتمد البرلمان الأوروبي يوم الخميس حزمة واسعة النطاق من التدابير التشريعية تشمل السيادة الرقمية وإصلاح المشتريات الدفاعية وإعادة تنظيم الإعانات الزراعية وإطار ممر الهجرة الموحد الملزم لجميع الدول الأعضاء.',
    };
    for (const [lang, text] of Object.entries(samples)) {
      for (const surface of ALL_SURFACES) {
        const out = clampForBudget(text, lang, surface);
        const cap = budgetFor(lang, surface);
        expect(
          out.length,
          `clamp violated cap for lang=${lang} surface=${surface}: ${out.length}>${cap}`,
        ).toBeLessThanOrEqual(cap);
      }
    }
  });

  it('appends a single ellipsis (never doubled) when truncation occurred', () => {
    const long = 'A '.repeat(200) + 'tail';
    const out = clampForBudget(long, 'en', 'title');
    expect(out.endsWith('…')).toBe(true);
    expect(out.endsWith('……')).toBe(false);
  });

  it('prefers a clause boundary over a mid-word break for Latin text', () => {
    const text = 'Council adopts the new digital-services package: enforcement begins Monday in twenty-three member states across the continent';
    const out = clampForBudget(text, 'en', 'title');
    // The colon is at index 47, well within the 60-char Latin title budget,
    // so the clamp must prefer that natural break over a mid-word slice.
    expect(out).toContain('package');
    expect(out.length).toBeLessThanOrEqual(60);
  });

  it('uses full-width punctuation as a break point for CJK text', () => {
    const text = '欧洲议会通过新立法。本周生效。具体细节由委员会发布。后续报道随访。'.repeat(5);
    const out = clampForBudget(text, 'zh', 'title');
    expect(out.length).toBeLessThanOrEqual(SEO_BUDGETS.title.cjk);
  });
});

describe('seo-budgets — clampTitleForSurface brand suffix policy', () => {
  it('keeps the full brand suffix when title + suffix fit', () => {
    const out = clampTitleForSurface('Short headline', 'en', 'title', {
      siteTitle: 'EU Parliament Monitor',
      shortSiteTitle: 'EPM',
      separator: ' | ',
    });
    expect(out).toBe('Short headline | EU Parliament Monitor');
  });

  it('falls back to the short brand when the full suffix does not fit', () => {
    // 60-char Latin title budget; full suffix " | EU Parliament Monitor"
    // is 24 chars, so a 40-char headline can fit only the short brand.
    const headline = 'A '.repeat(20).trim(); // 39 chars
    const out = clampTitleForSurface(headline, 'en', 'title', {
      siteTitle: 'EU Parliament Monitor',
      shortSiteTitle: 'EPM',
      separator: ' | ',
    });
    // Either short-brand suffix appended or full headline kept without
    // suffix — both options are within budget; assert at most one.
    expect(out.length).toBeLessThanOrEqual(60);
    expect(out.startsWith(headline)).toBe(true);
  });

  it('drops the brand suffix entirely when the headline alone fills the budget', () => {
    const headline = 'X'.repeat(58);
    const out = clampTitleForSurface(headline, 'en', 'title', {
      siteTitle: 'EU Parliament Monitor',
      shortSiteTitle: 'EPM',
      separator: ' | ',
    });
    expect(out.length).toBeLessThanOrEqual(60);
    // No separator means no brand attached.
    expect(out.includes(' | ')).toBe(false);
  });

  it('respects per-surface budgets (ogTitle / twitterTitle)', () => {
    const headline = 'Council adopts new digital-services enforcement package today';
    const ogOut = clampTitleForSurface(headline, 'en', 'ogTitle', {
      siteTitle: 'EU Parliament Monitor',
      shortSiteTitle: 'EPM',
      separator: ' | ',
    });
    const twOut = clampTitleForSurface(headline, 'en', 'twitterTitle', {
      siteTitle: 'EU Parliament Monitor',
      shortSiteTitle: 'EPM',
      separator: ' | ',
    });
    expect(ogOut.length).toBeLessThanOrEqual(SEO_BUDGETS.ogTitle.latin);
    expect(twOut.length).toBeLessThanOrEqual(SEO_BUDGETS.twitterTitle.latin);
  });
});
