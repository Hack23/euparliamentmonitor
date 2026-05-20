// SPDX-FileCopyrightText: 2024-2026 Hack23 AB
// SPDX-License-Identifier: Apache-2.0

/**
 * Unit tests for src/aggregator/metadata/translated-sibling —
 * `isTranslatedSiblingBrief` predicate covering all 14 language codes
 * plus edge cases (case sensitivity, double extensions, missing suffix).
 */

import { describe, it, expect } from 'vitest';
import { isTranslatedSiblingBrief } from '../../scripts/aggregator/metadata/translated-sibling.js';
import { ALL_LANGUAGES } from '../../scripts/constants/language-core.js';

describe('isTranslatedSiblingBrief', () => {
  describe('flags all 14 supported language codes', () => {
    it('identifies `executive-brief_<lang>.md` for every non-English locale', () => {
      for (const lang of ALL_LANGUAGES) {
        if (lang === 'en') continue;
        expect(
          isTranslatedSiblingBrief(`executive-brief_${lang}.md`),
          `expected executive-brief_${lang}.md to be flagged`
        ).toBe(true);
      }
    });

    it('identifies `synthesis-summary_<lang>.md` for every non-English locale', () => {
      for (const lang of ALL_LANGUAGES) {
        if (lang === 'en') continue;
        expect(
          isTranslatedSiblingBrief(`synthesis-summary_${lang}.md`),
          `expected synthesis-summary_${lang}.md to be flagged`
        ).toBe(true);
      }
    });

    it('identifies known translation codes explicitly (ar, zh, de, fr, sv, ja, ko, he, da, no, fi, nl, es)', () => {
      const expectedCodes = ['ar', 'zh', 'de', 'fr', 'sv', 'ja', 'ko', 'he', 'da', 'no', 'fi', 'nl', 'es'];
      for (const lang of expectedCodes) {
        expect(isTranslatedSiblingBrief(`executive-brief_${lang}.md`)).toBe(true);
      }
    });
  });

  describe('does NOT flag canonical English artefacts', () => {
    it('returns false for the base executive-brief.md', () => {
      expect(isTranslatedSiblingBrief('executive-brief.md')).toBe(false);
    });

    it('returns false for synthesis-summary.md', () => {
      expect(isTranslatedSiblingBrief('synthesis-summary.md')).toBe(false);
    });

    it('returns false for other English artefacts', () => {
      expect(isTranslatedSiblingBrief('coalition-dynamics.md')).toBe(false);
      expect(isTranslatedSiblingBrief('deep-analysis.md')).toBe(false);
      expect(isTranslatedSiblingBrief('breaking-news-analysis.md')).toBe(false);
      expect(isTranslatedSiblingBrief('article.md')).toBe(false);
    });
  });

  describe('does NOT flag non-language suffix codes', () => {
    it('returns false for `_eu` suffix (not a supported locale)', () => {
      expect(isTranslatedSiblingBrief('mff-overview_eu.md')).toBe(false);
    });

    it('returns false for `_uk` suffix (Ukrainian is not yet a supported locale)', () => {
      expect(isTranslatedSiblingBrief('whatever_uk.md')).toBe(false);
    });

    it('returns false for `_pl` suffix (Polish is not a supported locale)', () => {
      expect(isTranslatedSiblingBrief('report_pl.md')).toBe(false);
    });
  });

  describe('case sensitivity', () => {
    it('flags uppercase language codes (e.g. `executive-brief_AR.md`)', () => {
      expect(isTranslatedSiblingBrief('executive-brief_AR.md')).toBe(true);
    });

    it('flags mixed-case language codes (e.g. `executive-brief_Ar.md`)', () => {
      expect(isTranslatedSiblingBrief('executive-brief_Ar.md')).toBe(true);
    });

    it('flags uppercase ZH (e.g. `synthesis-summary_ZH.md`)', () => {
      expect(isTranslatedSiblingBrief('synthesis-summary_ZH.md')).toBe(true);
    });
  });

  describe('double extensions and path separators', () => {
    it('returns false for double-extension files (e.g. `executive-brief_ar.md.bak`)', () => {
      expect(isTranslatedSiblingBrief('executive-brief_ar.md.bak')).toBe(false);
    });

    it('returns false when the language suffix is followed by extra characters', () => {
      expect(isTranslatedSiblingBrief('executive-brief_ar.md2')).toBe(false);
    });

    it('returns false for a canonical English brief (no language suffix)', () => {
      // Regression guard: `executive-brief.md` must never be excluded
      expect(isTranslatedSiblingBrief('executive-brief.md')).toBe(false);
    });
  });

  describe('edge cases', () => {
    it('returns false for empty string', () => {
      expect(isTranslatedSiblingBrief('')).toBe(false);
    });

    it('returns false for a filename with no underscore before the language code', () => {
      // `ar.md` has no `_` separator so it does NOT match the suffix pattern
      expect(isTranslatedSiblingBrief('ar.md')).toBe(false);
    });

    it('returns false for a file that is just the extension', () => {
      expect(isTranslatedSiblingBrief('.md')).toBe(false);
    });
  });
});
