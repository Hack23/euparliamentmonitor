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

  it('discovers the expected number of label maps in language-ui.js (tight sentinel)', () => {
    // language-ui.js currently exports 96 consts; at least ~30 are per-language
    // label maps. Lock against a tight lower bound to detect accidental removals.
    expect(labelMaps.length).toBeGreaterThanOrEqual(25);
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
});
