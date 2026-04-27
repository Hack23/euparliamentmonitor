// SPDX-FileCopyrightText: 2024-2026 Hack23 AB
// SPDX-License-Identifier: Apache-2.0

/**
 * Unit tests for `Generators/PoliticalIntelligence/Copy` —
 * `getPICopy`, `DEFAULT_COPY`, and the `PI_COPY` per-language overrides.
 *
 * Verifies:
 *  - English defaults are returned verbatim for `lang === 'en'` and unknown codes
 *  - Every supported language overrides at least the title, hero, and
 *    breadcrumb
 *  - Overrides merge cleanly on top of `DEFAULT_COPY` (every key remains
 *    populated even if a single locale forgets one)
 *  - `__proto__` and other prototype-pollution payloads silently fall
 *    back to English (defense-in-depth — even though the renderer
 *    additionally allow-list-validates `lang`)
 *  - Plural/singular labels are paired correctly
 */

import { describe, it, expect } from 'vitest';
import {
  getPICopy,
  DEFAULT_COPY,
  PI_COPY,
} from '../../scripts/generators/political-intelligence/copy.js';

const SUPPORTED = ['en', 'sv', 'da', 'no', 'fi', 'de', 'fr', 'es', 'nl', 'ar', 'he', 'ja', 'ko', 'zh'];

describe('DEFAULT_COPY', () => {
  it('exposes every required PICopy key', () => {
    const required = [
      'title',
      'intro',
      'heroSubtitle',
      'home',
      'breadcrumbCurrent',
      'breadcrumbLabel',
      'methodologiesHeading',
      'methodologiesDescription',
      'templatesHeading',
      'templatesDescription',
      'referenceHeading',
      'referenceDescription',
      'statReferenceLabel',
      'dailyHeading',
      'dailyDescription',
      'statMethodologiesLabel',
      'statTemplatesLabel',
      'statRunsLabel',
      'statArtifactsLabel',
      'viewOnGitHub',
      'artifactCountLabel',
      'artifactCountLabelSingular',
      'runsCountLabel',
      'runsCountLabelSingular',
      'artifactsToggleLabel',
      'artifactsToggleLabelSingular',
      'sourceInEnglishNote',
      'seoKeywords',
    ];
    for (const key of required) {
      expect(DEFAULT_COPY).toHaveProperty(key);
      expect(typeof DEFAULT_COPY[key]).toBe('string');
    }
  });

  it('English `sourceInEnglishNote` is empty (only emitted on translated pages)', () => {
    expect(DEFAULT_COPY.sourceInEnglishNote).toBe('');
  });

  it('plural label includes the {count} placeholder', () => {
    expect(DEFAULT_COPY.artifactCountLabel).toContain('{count}');
    expect(DEFAULT_COPY.runsCountLabel).toContain('{count}');
    expect(DEFAULT_COPY.artifactsToggleLabel).toContain('{count}');
  });

  it('singular label does NOT contain the {count} placeholder', () => {
    expect(DEFAULT_COPY.artifactCountLabelSingular).not.toContain('{count}');
    expect(DEFAULT_COPY.runsCountLabelSingular).not.toContain('{count}');
    expect(DEFAULT_COPY.artifactsToggleLabelSingular).not.toContain('{count}');
  });
});

describe('PI_COPY', () => {
  it('declares every supported language', () => {
    for (const lang of SUPPORTED) {
      expect(PI_COPY).toHaveProperty(lang);
    }
  });

  it.each(SUPPORTED.filter((l) => l !== 'en'))(
    '%s overrides at least title, breadcrumbCurrent, and home',
    (lang) => {
      const override = PI_COPY[lang];
      expect(override).toBeDefined();
      expect(override?.title).toBeTruthy();
      expect(override?.breadcrumbCurrent).toBeTruthy();
      expect(override?.home).toBeTruthy();
      // Title should not collide with English (otherwise translation is missing)
      expect(override?.title).not.toBe(DEFAULT_COPY.title);
    }
  );

  it.each(SUPPORTED.filter((l) => l !== 'en'))(
    '%s ships a non-empty sourceInEnglishNote',
    (lang) => {
      expect(PI_COPY[lang]?.sourceInEnglishNote).toBeTruthy();
    }
  );

  it.each(SUPPORTED.filter((l) => l !== 'en'))(
    '%s plural labels keep the {count} placeholder',
    (lang) => {
      const o = PI_COPY[lang];
      if (o?.artifactCountLabel !== undefined) {
        expect(o.artifactCountLabel).toContain('{count}');
      }
      if (o?.runsCountLabel !== undefined) {
        expect(o.runsCountLabel).toContain('{count}');
      }
      if (o?.artifactsToggleLabel !== undefined) {
        expect(o.artifactsToggleLabel).toContain('{count}');
      }
    }
  );

  it('English entry is the empty-overrides marker (defaults apply)', () => {
    expect(PI_COPY.en).toEqual({});
  });
});

describe('getPICopy', () => {
  it('returns DEFAULT_COPY for English', () => {
    expect(getPICopy('en')).toEqual(DEFAULT_COPY);
  });

  it('merges Swedish overrides on top of English defaults', () => {
    const sv = getPICopy('sv');
    expect(sv.title).toBe('Politisk underrättelse');
    expect(sv.home).toBe('Hem');
    // Falls back to defaults for keys not overridden — every key stays populated
    for (const key of Object.keys(DEFAULT_COPY)) {
      expect(typeof sv[key]).toBe('string');
    }
  });

  it.each(SUPPORTED)('%s gets a fully-populated PICopy (no missing keys)', (lang) => {
    const copy = getPICopy(lang);
    for (const key of Object.keys(DEFAULT_COPY)) {
      expect(copy).toHaveProperty(key);
      expect(typeof copy[key]).toBe('string');
    }
  });

  it('falls back to English defaults for unknown codes', () => {
    expect(getPICopy('zz')).toEqual(DEFAULT_COPY);
    expect(getPICopy('')).toEqual(DEFAULT_COPY);
    expect(getPICopy('xx-YY')).toEqual(DEFAULT_COPY);
  });

  it('does not leak prototype properties via prototype-pollution payloads', () => {
    // `Object.prototype.toString` exists but `PI_COPY['__proto__']` should
    // resolve to undefined (or at worst, a non-PICopy object) — the merge
    // must still return a clean PICopy populated by DEFAULT_COPY.
    const copy = getPICopy('__proto__');
    expect(copy.title).toBe(DEFAULT_COPY.title);
    expect(copy.home).toBe(DEFAULT_COPY.home);
  });

  it('returned object does not share identity with DEFAULT_COPY', () => {
    // Mutating the returned copy must not poison the defaults
    const copy = getPICopy('en');
    expect(copy).not.toBe(DEFAULT_COPY);
    copy.title = 'Mutated';
    expect(DEFAULT_COPY.title).toBe('Political Intelligence');
  });
});
