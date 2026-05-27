// SPDX-FileCopyrightText: 2024-2026 Hack23 AB
// SPDX-License-Identifier: Apache-2.0

// @ts-check

/**
 * Comprehensive i18n fallback strategy test.
 *
 * Validates that all 14 supported languages (EN, SV, DA, NO, FI, DE, FR, ES, NL, AR, HE, JA, KO, ZH)
 * produce correct, non-empty titles, descriptions, and keywords — both when translations exist
 * and when the English fallback strategy applies.
 *
 * Languages:
 * 🇬🇧 EN | 🇸🇪 SV | 🇩🇰 DA | 🇳🇴 NO | 🇫🇮 FI | 🇩🇪 DE | 🇫🇷 FR | 🇪🇸 ES | 🇳🇱 NL | 🇸🇦 AR | 🇮🇱 HE | 🇯🇵 JA | 🇰🇷 KO | 🇨🇳 ZH
 */

import { describe, it, expect } from 'vitest';
import {
  ALL_LANGUAGES,
  LANGUAGE_FLAGS,
  LANGUAGE_NAMES,
  PAGE_TITLES,
  PAGE_DESCRIPTIONS,
  getLocalizedString,
  getTextDirection,
  isSupportedLanguage,
} from '../../scripts/constants/languages.js';
import { LOCALIZED_KEYWORDS } from '../../scripts/constants/articles/localized-keywords.js';
import {
  WEEK_AHEAD_TITLES,
  MONTH_AHEAD_TITLES,
  BREAKING_NEWS_TITLES,
  COMMITTEE_REPORTS_TITLES,
  MOTIONS_TITLES,
  PROPOSITIONS_TITLES,
  WEEKLY_REVIEW_TITLES,
  MONTHLY_REVIEW_TITLES,
} from '../../scripts/constants/articles/index.js';

const ARTICLE_CATEGORIES = [
  'week-ahead',
  'month-ahead',
  'breaking',
  'committee-reports',
  'motions',
  'propositions',
  'week-in-review',
  'month-in-review',
  'quarter-ahead',
  'quarter-in-review',
  'year-ahead',
  'year-in-review',
  'term-outlook',
  'election-cycle',
  'deep-analysis',
];

describe('i18n fallback strategy — all 14 languages', () => {
  describe('getLocalizedString fallback to English', () => {
    it('returns English for unsupported language codes', () => {
      const result = getLocalizedString(PAGE_TITLES, 'xx');
      expect(result).toBe(PAGE_TITLES.en);
    });

    it('returns English for empty string language code', () => {
      const result = getLocalizedString(PAGE_TITLES, '');
      expect(result).toBe(PAGE_TITLES.en);
    });

    it('returns the correct localized value for each supported language', () => {
      for (const lang of ALL_LANGUAGES) {
        const result = getLocalizedString(PAGE_TITLES, lang);
        expect(result).toBe(PAGE_TITLES[lang]);
        expect(result.length).toBeGreaterThan(0);
      }
    });
  });

  describe('PAGE_TITLES — sample across all languages', () => {
    it.each([
      ['en', 'EU Parliament Monitor - News'],
      ['sv', 'EU-parlamentsmonitor - Nyheter'],
      ['da', 'EU-parlamentsmonitor - Nyheder'],
      ['no', 'EU-parlamentsmonitor - Nyheter'],
      ['fi', 'EU-parlamentin seuranta - Uutiset'],
      ['de', 'EU-Parlamentsmonitor - Nachrichten'],
      ['fr', 'Moniteur du Parlement UE - Actualités'],
      ['es', 'Monitor del Parlamento UE - Noticias'],
      ['nl', 'EU Parlementsmonitor - Nieuws'],
      ['ar', 'مراقب البرلمان الأوروبي - أخبار'],
      ['he', 'מוניטור הפרלמנט האירופי - חדשות'],
      ['ja', 'EU議会モニター - ニュース'],
      ['ko', 'EU 의회 모니터 - 뉴스'],
      ['zh', 'EU议会监测 - 新闻'],
    ])('%s — "%s"', (lang, expected) => {
      expect(PAGE_TITLES[lang]).toBe(expected);
    });
  });

  describe('PAGE_DESCRIPTIONS — non-empty for all languages', () => {
    for (const lang of ALL_LANGUAGES) {
      it(`${LANGUAGE_FLAGS[lang]} ${lang.toUpperCase()} has a meaningful description (>50 chars)`, () => {
        const desc = PAGE_DESCRIPTIONS[lang];
        expect(desc).toBeDefined();
        expect(desc.length).toBeGreaterThan(50);
      });
    }
  });

  describe('LOCALIZED_KEYWORDS — coverage for all article categories', () => {
    for (const lang of ALL_LANGUAGES) {
      describe(`${LANGUAGE_FLAGS[lang]} ${lang.toUpperCase()}`, () => {
        it('has keyword entries for all standard article categories', () => {
          const keywords = LOCALIZED_KEYWORDS[lang];
          expect(keywords).toBeDefined();
          for (const category of ARTICLE_CATEGORIES) {
            const categoryKeywords = keywords[category];
            expect(
              categoryKeywords,
              `Missing keywords for ${lang}/${category}`
            ).toBeDefined();
            expect(categoryKeywords.length).toBeGreaterThanOrEqual(3);
          }
        });

        it('all keyword arrays contain non-empty strings', () => {
          const keywords = LOCALIZED_KEYWORDS[lang];
          for (const category of ARTICLE_CATEGORIES) {
            const categoryKeywords = keywords[category];
            if (categoryKeywords) {
              for (const kw of categoryKeywords) {
                expect(kw.trim().length).toBeGreaterThan(0);
              }
            }
          }
        });
      });
    }
  });

  describe('Title generators — work for all languages', () => {
    it('WEEK_AHEAD_TITLES generates valid output for all 14 languages', () => {
      for (const lang of ALL_LANGUAGES) {
        const generator = WEEK_AHEAD_TITLES[lang];
        expect(generator).toBeDefined();
        const result = generator('2026-05-19', '2026-05-23');
        expect(result.title.length).toBeGreaterThan(0);
        expect(result.subtitle.length).toBeGreaterThan(0);
      }
    });

    it('MONTH_AHEAD_TITLES generates valid output for all 14 languages', () => {
      for (const lang of ALL_LANGUAGES) {
        const generator = MONTH_AHEAD_TITLES[lang];
        expect(generator).toBeDefined();
        const result = generator('June 2026');
        expect(result.title.length).toBeGreaterThan(0);
        expect(result.subtitle.length).toBeGreaterThan(0);
      }
    });

    it('BREAKING_NEWS_TITLES generates valid output for all 14 languages', () => {
      for (const lang of ALL_LANGUAGES) {
        const generator = BREAKING_NEWS_TITLES[lang];
        expect(generator).toBeDefined();
        const result = generator('2026-05-27');
        expect(result.title).toContain('2026-05-27');
        expect(result.subtitle.length).toBeGreaterThan(0);
      }
    });

    it('COMMITTEE_REPORTS_TITLES generates valid output for all 14 languages', () => {
      for (const lang of ALL_LANGUAGES) {
        const generator = COMMITTEE_REPORTS_TITLES[lang];
        expect(generator).toBeDefined();
        const result = generator('ENVI, ECON');
        expect(result.title).toContain('ENVI, ECON');
        expect(result.subtitle.length).toBeGreaterThan(0);
      }
    });

    it('MOTIONS_TITLES generates valid output for all 14 languages', () => {
      for (const lang of ALL_LANGUAGES) {
        const generator = MOTIONS_TITLES[lang];
        expect(generator).toBeDefined();
        const result = generator('2026-05-27');
        expect(result.title.length).toBeGreaterThan(0);
        expect(result.subtitle.length).toBeGreaterThan(0);
      }
    });

    it('PROPOSITIONS_TITLES generates valid output for all 14 languages', () => {
      for (const lang of ALL_LANGUAGES) {
        const generator = PROPOSITIONS_TITLES[lang];
        expect(generator).toBeDefined();
        const result = generator();
        expect(result.title.length).toBeGreaterThan(0);
        expect(result.subtitle.length).toBeGreaterThan(0);
      }
    });

    it('WEEKLY_REVIEW_TITLES generates valid output for all 14 languages', () => {
      for (const lang of ALL_LANGUAGES) {
        const generator = WEEKLY_REVIEW_TITLES[lang];
        expect(generator).toBeDefined();
        const result = generator('2026-05-19', '2026-05-23');
        expect(result.title.length).toBeGreaterThan(0);
        expect(result.subtitle.length).toBeGreaterThan(0);
      }
    });

    it('MONTHLY_REVIEW_TITLES generates valid output for all 14 languages', () => {
      for (const lang of ALL_LANGUAGES) {
        const generator = MONTHLY_REVIEW_TITLES[lang];
        expect(generator).toBeDefined();
        const result = generator('May 2026');
        expect(result.title.length).toBeGreaterThan(0);
        expect(result.subtitle.length).toBeGreaterThan(0);
      }
    });
  });

  describe('Fallback strategy — unsupported language falls back to English', () => {
    it('getLocalizedString returns English value for non-existent language', () => {
      // Simulate a map where a language might be missing (partial map scenario)
      const partialMap = { en: 'Hello', sv: 'Hej', de: 'Hallo' };
      // Using getLocalizedString with a non-existent language should return 'en'
      const result = getLocalizedString(partialMap, 'xx');
      expect(result).toBe('Hello');
    });

    it('getLocalizedString fallback works with complex map values', () => {
      const map = {
        en: { title: 'English Title', desc: 'English Description' },
        sv: { title: 'Svensk Titel', desc: 'Svensk Beskrivning' },
        da: { title: 'Dansk Titel', desc: 'Dansk Beskrivelse' },
        no: { title: 'Norsk Tittel', desc: 'Norsk Beskrivelse' },
        fi: { title: 'Suomalainen Otsikko', desc: 'Suomalainen Kuvaus' },
        de: { title: 'Deutscher Titel', desc: 'Deutsche Beschreibung' },
        fr: { title: 'Titre Français', desc: 'Description Française' },
        es: { title: 'Título Español', desc: 'Descripción Española' },
        nl: { title: 'Nederlandse Titel', desc: 'Nederlandse Beschrijving' },
        ar: { title: 'عنوان عربي', desc: 'وصف عربي' },
        he: { title: 'כותרת עברית', desc: 'תיאור עברי' },
        ja: { title: '日本語タイトル', desc: '日本語の説明' },
        ko: { title: '한국어 제목', desc: '한국어 설명' },
        zh: { title: '中文标题', desc: '中文描述' },
      };

      // All languages should return their own value
      for (const lang of ALL_LANGUAGES) {
        const result = getLocalizedString(map, lang);
        expect(result).toBe(map[lang]);
      }

      // Unsupported should fall back to English
      const fallback = getLocalizedString(map, 'pt');
      expect(fallback).toBe(map.en);
    });
  });

  describe('Text direction', () => {
    it('RTL languages (ar, he) return rtl', () => {
      expect(getTextDirection('ar')).toBe('rtl');
      expect(getTextDirection('he')).toBe('rtl');
    });

    it('LTR languages return ltr', () => {
      const ltrLangs = ['en', 'sv', 'da', 'no', 'fi', 'de', 'fr', 'es', 'nl', 'ja', 'ko', 'zh'];
      for (const lang of ltrLangs) {
        expect(getTextDirection(lang)).toBe('ltr');
      }
    });

    it('unknown language defaults to ltr', () => {
      expect(getTextDirection('unknown')).toBe('ltr');
    });
  });

  describe('Language support validation', () => {
    it('all 14 expected languages are supported', () => {
      const expected = ['en', 'sv', 'da', 'no', 'fi', 'de', 'fr', 'es', 'nl', 'ar', 'he', 'ja', 'ko', 'zh'];
      for (const lang of expected) {
        expect(isSupportedLanguage(lang)).toBe(true);
      }
    });

    it('unsupported languages return false', () => {
      const unsupported = ['pt', 'it', 'ru', 'el', 'pl', 'cs', 'hu', 'ro', 'bg'];
      for (const lang of unsupported) {
        expect(isSupportedLanguage(lang)).toBe(false);
      }
    });

    it('each language has a flag and native name', () => {
      for (const lang of ALL_LANGUAGES) {
        expect(LANGUAGE_FLAGS[lang]).toBeDefined();
        expect(LANGUAGE_FLAGS[lang].length).toBeGreaterThan(0);
        expect(LANGUAGE_NAMES[lang]).toBeDefined();
        expect(LANGUAGE_NAMES[lang].length).toBeGreaterThan(0);
      }
    });
  });

  describe('Keyword quality — no accidental English duplicates in non-EN languages', () => {
    it('non-EN languages have localized keywords distinct from English', () => {
      const enKeywords = LOCALIZED_KEYWORDS.en;
      for (const lang of ALL_LANGUAGES) {
        if (lang === 'en') continue;
        const langKeywords = LOCALIZED_KEYWORDS[lang];
        // At least one category should have keywords different from English
        let hasDifference = false;
        for (const category of ARTICLE_CATEGORIES) {
          const enKws = enKeywords[category];
          const langKws = langKeywords[category];
          if (enKws && langKws) {
            const enSet = new Set(enKws.map((k) => k.toLowerCase()));
            const langDistinct = langKws.filter((k) => !enSet.has(k.toLowerCase()));
            if (langDistinct.length > 0) {
              hasDifference = true;
              break;
            }
          }
        }
        expect(
          hasDifference,
          `${lang} keywords appear to be identical to English — likely untranslated`
        ).toBe(true);
      }
    });
  });
});
