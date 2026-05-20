// SPDX-FileCopyrightText: 2024-2026 Hack23 AB
// SPDX-License-Identifier: Apache-2.0

/**
 * @module Aggregator/Metadata/TranslatedSibling
 * @description Filter predicate that identifies translated sibling brief
 * files (e.g. `executive-brief_ar.md`) so they can be excluded from the
 * English-only top-level artefact fallback scan in
 * {@link extractArtifactHighlight}.
 *
 * High-reuse module: import this predicate wherever translated siblings
 * must be excluded from discovery (e.g. tradecraft discovery,
 * template-frontmatter sync).
 */

import { ALL_LANGUAGES } from '../../constants/language-core.js';

/**
 * Filename suffix pattern that identifies a translated sibling brief
 * (e.g. `executive-brief_ar.md`, `synthesis-summary_zh.md`). The
 * `_<lang>` token is matched against {@link ALL_LANGUAGES} so we never
 * exclude a legitimate English artefact whose name happens to end in
 * `_<two-letter-suffix>.md`.
 *
 * Matching is case-insensitive to handle uppercase variants.
 */
export const TRANSLATED_SIBLING_SUFFIX_RE = new RegExp(`_(${ALL_LANGUAGES.join('|')})\\.md$`, 'i');

/**
 * Return `true` when a top-level `.md` filename looks like a translated
 * sibling of a canonical editorial artefact (e.g.
 * `executive-brief_ar.md`). These files must be excluded from the
 * top-level fallback scan in {@link extractArtifactHighlight} because
 * their localized H1s evade the English-only generic-heading detector
 * and would otherwise hijack the English SEO surfaces.
 *
 * @param filename - Run-relative `.md` filename (no path separators)
 * @returns `true` when the file is a translated sibling brief
 */
export function isTranslatedSiblingBrief(filename: string): boolean {
  return TRANSLATED_SIBLING_SUFFIX_RE.test(filename);
}
