// SPDX-FileCopyrightText: 2024-2026 Hack23 AB
// SPDX-License-Identifier: Apache-2.0

/**
 * Translation completeness drift-guard.
 *
 * Every exported i18n label map in `scripts/constants/language-ui.js` must
 * contain exactly 14 language entries (one per ALL_LANGUAGES code). This
 * prevents English-fallthrough in the site chrome and ensures translators
 * or agents don't accidentally leave a language out.
 */

import { describe, it, expect } from 'vitest';
import { ALL_LANGUAGES } from '../../scripts/constants/language-core.js';
import * as languageUi from '../../scripts/constants/language-ui.js';

const EXPECTED_LANG_COUNT = 14;

// Collect every named export that looks like a per-language label map
// (objects whose top-level keys are language codes).
function collectLabelMaps() {
  const maps = [];
  for (const [name, value] of Object.entries(languageUi)) {
    if (
      value &&
      typeof value === 'object' &&
      !Array.isArray(value) &&
      // Must have at least 'en' key to qualify as a label map
      Object.prototype.hasOwnProperty.call(value, 'en')
    ) {
      maps.push({ name, value });
    }
  }
  return maps;
}

/**
 * Walk every named export looking for *nested* per-language maps:
 * shapes like `{ <sectionKey>: { en, sv, da, ... } }` where the *value*
 * objects (not the top-level export) are LanguageMaps.
 *
 * Returns a flat list of `{ name, value }` entries where `name` is
 * `EXPORT_NAME[childKey]` and `value` is the inner LanguageMap. This
 * lets the same per-language coverage assertions run against e.g.
 * `SECTION_TITLE_LABELS[executive-brief]` so that a missing language
 * inside any nested entry is caught.
 */
function collectNestedLabelMaps() {
  const maps = [];
  for (const [name, value] of Object.entries(languageUi)) {
    if (!value || typeof value !== 'object' || Array.isArray(value)) continue;
    // Skip top-level LanguageMaps — they're already covered by collectLabelMaps()
    if (Object.prototype.hasOwnProperty.call(value, 'en')) continue;
    for (const [childKey, child] of Object.entries(value)) {
      if (
        child &&
        typeof child === 'object' &&
        !Array.isArray(child) &&
        Object.prototype.hasOwnProperty.call(child, 'en')
      ) {
        maps.push({ name: `${name}[${childKey}]`, value: child });
      }
    }
  }
  return maps;
}

function collectEmptyStringPaths(value, path) {
  if (typeof value === 'string') {
    return value.trim().length === 0 ? [path] : [];
  }

  if (!value || typeof value !== 'object') {
    return [];
  }

  if (Array.isArray(value)) {
    return value.flatMap((entry, index) => collectEmptyStringPaths(entry, `${path}[${index}]`));
  }

  return Object.entries(value).flatMap(([key, entry]) => collectEmptyStringPaths(entry, `${path}.${key}`));
}

describe('translation-completeness', () => {
  const labelMaps = collectLabelMaps();
  const nestedLabelMaps = collectNestedLabelMaps();

  it('discovers the expected number of label maps in language-ui.js (tight sentinel)', () => {
    // language-ui.js currently exports 96 consts; at least ~30 are per-language
    // label maps. Lock against a tight lower bound to detect accidental removals.
    expect(labelMaps.length).toBeGreaterThanOrEqual(25);
  });

  it('discovers nested per-section LanguageMaps (e.g. SECTION_TITLE_LABELS[executive-brief])', () => {
    // Tight sentinel — SECTION_TITLE_LABELS carries 19 nested LanguageMaps
    // (one per emitted aggregator section). Lock against a lower bound of
    // 15 to detect accidental flattening, removal, or migration.
    expect(nestedLabelMaps.length).toBeGreaterThanOrEqual(15);
  });

  it(`ALL_LANGUAGES has exactly ${EXPECTED_LANG_COUNT} entries`, () => {
    expect(ALL_LANGUAGES).toHaveLength(EXPECTED_LANG_COUNT);
  });

  describe.each(labelMaps)('$name', ({ name, value }) => {
    it(`has entries for all ${EXPECTED_LANG_COUNT} languages`, () => {
      const keys = Object.keys(value);
      const missing = ALL_LANGUAGES.filter((lang) => !keys.includes(lang));
      expect(
        missing,
        `${name} is missing language(s): ${missing.join(', ')}`,
      ).toHaveLength(0);
    });

    it('has no extra language codes beyond ALL_LANGUAGES', () => {
      const keys = Object.keys(value);
      const extra = keys.filter((k) => !ALL_LANGUAGES.includes(k));
      expect(
        extra,
        `${name} has unexpected language code(s): ${extra.join(', ')}`,
      ).toHaveLength(0);
    });

    it('has no empty-string values at any nested translation path (English fallthrough)', () => {
      const emptyPaths = [];
      for (const lang of ALL_LANGUAGES) {
        emptyPaths.push(...collectEmptyStringPaths(value[lang], `${name}.${lang}`));
      }

      expect(emptyPaths, `Empty translation string(s): ${emptyPaths.join(', ')}`).toHaveLength(0);
    });
  });

  // Run the same per-language coverage assertions against every nested
  // LanguageMap discovered inside top-level objects (e.g. each entry of
  // SECTION_TITLE_LABELS). Catches the case where a translator adds a new
  // section key but forgets to translate it into all 14 languages.
  describe.each(nestedLabelMaps)('$name', ({ name, value }) => {
    it(`has entries for all ${EXPECTED_LANG_COUNT} languages`, () => {
      const keys = Object.keys(value);
      const missing = ALL_LANGUAGES.filter((lang) => !keys.includes(lang));
      expect(
        missing,
        `${name} is missing language(s): ${missing.join(', ')}`,
      ).toHaveLength(0);
    });

    it('has no empty-string values at any nested translation path (English fallthrough)', () => {
      const emptyPaths = [];
      for (const lang of ALL_LANGUAGES) {
        emptyPaths.push(...collectEmptyStringPaths(value[lang], `${name}.${lang}`));
      }

      expect(emptyPaths, `Empty translation string(s): ${emptyPaths.join(', ')}`).toHaveLength(0);
    });
  });
});
