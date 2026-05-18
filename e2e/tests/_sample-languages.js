// SPDX-FileCopyrightText: 2024-2026 Hack23 AB
// SPDX-License-Identifier: Apache-2.0

/**
 * Shared E2E language sample.
 *
 * E2E suite intentionally tests a representative *sample* of the 14
 * supported languages rather than every page — full per-language HTML
 * generator coverage is provided by the unit tests
 * (`test/unit/horizon-pi-html.test.js` covers 14×6 = 84 cases,
 * `test/unit/seo-headers-matrix.test.js` covers the 14-locale × 4-surface
 * matrix). E2E only needs to prove the *deployed* HTML still renders
 * correctly for one representative of each structural class.
 *
 *   en — canonical English (default route, no suffix)
 *   de — European LTR locale overlay
 *   ar — RTL (right-to-left script)
 *   ja — CJK (multi-byte script + different word boundary rules)
 *
 * Cumulative "all 14 URLs return HTTP 200" smoke tests in
 * `hreflang.spec.js` and `sitemap.spec.js` still guard against any
 * language variant going missing from the deployed corpus.
 */
export const SAMPLE_LANGUAGES = ['en', 'de', 'ar', 'ja'];

/** Sample minus English — for tests that already cover '/' separately. */
export const SAMPLE_LANGUAGES_NON_EN = SAMPLE_LANGUAGES.filter((lang) => lang !== 'en');
