// SPDX-FileCopyrightText: 2024-2026 Hack23 AB
// SPDX-License-Identifier: Apache-2.0

/**
 * Unit tests for constants/languages module
 * Tests consolidated language data and utility functions
 */

import { describe, it, expect } from 'vitest';
import {
  ALL_LANGUAGES,
  LANGUAGE_PRESETS,
  LANGUAGE_NAMES,
  PAGE_TITLES,
  PAGE_DESCRIPTIONS,
  SECTION_HEADINGS,
  NO_ARTICLES_MESSAGES,
  ARTICLE_TYPE_LABELS,
  READ_TIME_LABELS,
  BACK_TO_NEWS_LABELS,
  WEEK_AHEAD_TITLES,
  MOTIONS_TITLES,
  BREAKING_NEWS_TITLES,
  COMMITTEE_REPORTS_TITLES,
  getLocalizedString,
  isSupportedLanguage,
  getTextDirection,
} from '../../scripts/constants/languages.js';

describe('constants/languages', () => {
  describe('ALL_LANGUAGES', () => {
    it('should contain exactly 14 language codes', () => {
      expect(ALL_LANGUAGES).toHaveLength(14);
    });

    it('should contain all expected EU languages', () => {
      const expected = ['en', 'de', 'fr', 'es', 'it', 'nl', 'pl', 'pt', 'ro', 'sv', 'da', 'fi', 'el', 'hu'];
      expect([...ALL_LANGUAGES]).toEqual(expected);
    });
  });

  describe('LANGUAGE_PRESETS', () => {
    it('should have all presets', () => {
      expect(LANGUAGE_PRESETS.all).toEqual(ALL_LANGUAGES);
    });

    it('should have eu-core preset with 6 languages', () => {
      expect(LANGUAGE_PRESETS['eu-core']).toHaveLength(6);
      expect(LANGUAGE_PRESETS['eu-core']).toContain('en');
      expect(LANGUAGE_PRESETS['eu-core']).toContain('de');
      expect(LANGUAGE_PRESETS['eu-core']).toContain('fr');
    });

    it('should have nordic preset with 4 languages', () => {
      expect(LANGUAGE_PRESETS.nordic).toHaveLength(4);
      expect(LANGUAGE_PRESETS.nordic).toContain('sv');
      expect(LANGUAGE_PRESETS.nordic).toContain('da');
      expect(LANGUAGE_PRESETS.nordic).toContain('fi');
    });
  });

  describe('Language Maps', () => {
    it('should have entries for all 14 languages in LANGUAGE_NAMES', () => {
      for (const lang of ALL_LANGUAGES) {
        expect(LANGUAGE_NAMES[lang]).toBeDefined();
        expect(typeof LANGUAGE_NAMES[lang]).toBe('string');
      }
    });

    it('should have entries for all 14 languages in PAGE_TITLES', () => {
      for (const lang of ALL_LANGUAGES) {
        expect(PAGE_TITLES[lang]).toBeDefined();
      }
    });

    it('should have entries for all 14 languages in PAGE_DESCRIPTIONS', () => {
      for (const lang of ALL_LANGUAGES) {
        expect(PAGE_DESCRIPTIONS[lang]).toBeDefined();
      }
    });

    it('should have entries for all 14 languages in SECTION_HEADINGS', () => {
      for (const lang of ALL_LANGUAGES) {
        expect(SECTION_HEADINGS[lang]).toBeDefined();
      }
    });

    it('should have entries for all 14 languages in NO_ARTICLES_MESSAGES', () => {
      for (const lang of ALL_LANGUAGES) {
        expect(NO_ARTICLES_MESSAGES[lang]).toBeDefined();
      }
    });

    it('should have entries for all 14 languages in ARTICLE_TYPE_LABELS', () => {
      for (const lang of ALL_LANGUAGES) {
        const labels = ARTICLE_TYPE_LABELS[lang];
        expect(labels).toBeDefined();
        expect(labels.prospective).toBeDefined();
        expect(labels.retrospective).toBeDefined();
        expect(labels.breaking).toBeDefined();
      }
    });

    it('should have entries for all 14 languages in READ_TIME_LABELS', () => {
      for (const lang of ALL_LANGUAGES) {
        const formatter = READ_TIME_LABELS[lang];
        expect(formatter).toBeDefined();
        expect(typeof formatter).toBe('function');
        expect(formatter(5)).toContain('5');
      }
    });

    it('should have entries for all 14 languages in BACK_TO_NEWS_LABELS', () => {
      for (const lang of ALL_LANGUAGES) {
        expect(BACK_TO_NEWS_LABELS[lang]).toBeDefined();
      }
    });

    it('should have entries for all 14 languages in WEEK_AHEAD_TITLES', () => {
      for (const lang of ALL_LANGUAGES) {
        const generator = WEEK_AHEAD_TITLES[lang];
        expect(generator).toBeDefined();
        expect(typeof generator).toBe('function');
        const result = generator('2025-01-01', '2025-01-07');
        expect(result.title).toBeDefined();
        expect(result.subtitle).toBeDefined();
      }
    });


    it('should have entries for all 14 languages in MOTIONS_TITLES', () => {
      for (const lang of ALL_LANGUAGES) {
        const generator = MOTIONS_TITLES[lang];
        expect(generator).toBeDefined();
        expect(typeof generator).toBe('function');
        const result = generator('2025-01-01');
        expect(result.title).toBeDefined();
        expect(result.subtitle).toBeDefined();
      }
    });

    it('should have entries for all 14 languages in BREAKING_NEWS_TITLES', () => {
      for (const lang of ALL_LANGUAGES) {
        const generator = BREAKING_NEWS_TITLES[lang];
        expect(generator).toBeDefined();
        expect(typeof generator).toBe('function');
        const result = generator('2025-01-01');
        expect(result.title).toBeDefined();
        expect(result.subtitle).toBeDefined();
        expect(result.title).toContain('2025-01-01');
      }
    });

    it('should have correct native language names', () => {
      expect(LANGUAGE_NAMES.en).toBe('English');
      expect(LANGUAGE_NAMES.de).toBe('Deutsch');
      expect(LANGUAGE_NAMES.fr).toBe('Français');
      expect(LANGUAGE_NAMES.el).toBe('Ελληνικά');
      expect(LANGUAGE_NAMES.hu).toBe('Magyar');
    });
  });

  describe('getLocalizedString', () => {
    it('should return correct value for supported language', () => {
      expect(getLocalizedString(LANGUAGE_NAMES, 'de')).toBe('Deutsch');
    });

    it('should fall back to English for unsupported language', () => {
      expect(getLocalizedString(LANGUAGE_NAMES, 'zz')).toBe('English');
    });

    it('should work with function-valued maps', () => {
      const formatter = getLocalizedString(READ_TIME_LABELS, 'de');
      expect(formatter(3)).toBe('3 Min. Lesezeit');
    });
  });

  describe('isSupportedLanguage', () => {
    it('should return true for supported languages', () => {
      expect(isSupportedLanguage('en')).toBe(true);
      expect(isSupportedLanguage('de')).toBe(true);
      expect(isSupportedLanguage('el')).toBe(true);
    });

    it('should return false for unsupported languages', () => {
      expect(isSupportedLanguage('zz')).toBe(false);
      expect(isSupportedLanguage('ar')).toBe(false);
      expect(isSupportedLanguage('')).toBe(false);
    });
  });

  describe('getTextDirection', () => {
    it('should return ltr for EU languages', () => {
      for (const lang of ALL_LANGUAGES) {
        expect(getTextDirection(lang)).toBe('ltr');
      }
    });

    it('should return rtl for Arabic', () => {
      expect(getTextDirection('ar')).toBe('rtl');
    });

    it('should return rtl for Hebrew', () => {
      expect(getTextDirection('he')).toBe('rtl');
    });

    it('should return ltr for unknown languages', () => {
      expect(getTextDirection('zz')).toBe('ltr');
    });
  });

  describe('COMMITTEE_REPORTS_TITLES', () => {
    it('should have entries for all 14 supported languages', () => {
      expect(Object.keys(COMMITTEE_REPORTS_TITLES)).toHaveLength(14);
    });

    it('should generate non-empty title containing committee name for each language', () => {
      const committeeName = 'ENVI, ECON, AFET, LIBE, AGRI';
      for (const lang of ALL_LANGUAGES) {
        const generator = COMMITTEE_REPORTS_TITLES[lang];
        expect(generator).toBeDefined();
        const result = generator(committeeName);
        expect(result.title).toContain(committeeName);
        expect(typeof result.subtitle).toBe('string');
        expect(result.subtitle.length).toBeGreaterThan(0);
      }
    });
  });
});
