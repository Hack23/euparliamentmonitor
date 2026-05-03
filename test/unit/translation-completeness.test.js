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

describe('translation-completeness', () => {
  const labelMaps = collectLabelMaps();

  it('discovers at least 10 label maps in language-ui.js', () => {
    expect(labelMaps.length).toBeGreaterThanOrEqual(10);
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

    it('has no empty-string values (English fallthrough)', () => {
      for (const lang of ALL_LANGUAGES) {
        const entry = value[lang];
        if (typeof entry === 'string') {
          expect(
            entry.trim().length,
            `${name}['${lang}'] is empty`,
          ).toBeGreaterThan(0);
        }
        // Objects (like ARTICLE_TYPE_LABELS.en = { ... }) are allowed — they
        // carry nested keys. We only check flat-string maps here.
      }
    });
  });
});
