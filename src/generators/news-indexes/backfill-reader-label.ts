// SPDX-FileCopyrightText: 2024-2026 Hack23 AB
// SPDX-License-Identifier: Apache-2.0

/**
 * @module Generators/NewsIndexes/BackfillReaderLabel
 * @description Truncated reader-label detection and stripping helpers,
 * extracted from `backfill.ts` to keep source files ≤600 lines.
 */

import { getLocalizedString } from '../../constants/languages.js';
import { SEO_CONTEXT_LABELS } from '../../aggregator/metadata/template-fallback.js';
import type { LanguageCode } from '../../types/index.js';

/**
 * Remove a trailing **truncated** copy of the localized reader label
 * (`SEO_CONTEXT_LABELS[lang].reader`) from a candidate description.
 *
 * Earlier backfill passes appended the reader label and then clamped the
 * whole buffer to the per-script `metaDescription` budget, hard-cutting
 * the label mid-word (e.g. zh `…政策后果的读` instead of `…政策后果的读者`,
 * ja `…追跡する読`, ko dangling `…추적하는.`). Those mangled fragments were
 * persisted to `<meta description>` and survive a plain prefix/date-label
 * strip, so re-feeding them to the resolver re-emits the broken tail.
 *
 * A trailing copy that matches the label **in full** is left intact — it
 * is a complete, reader-facing clause we want to preserve. Only a partial
 * (truncated) prefix of the label is dropped, leaving the clean body for
 * the resolver to re-enrich with a budget-aware (whole-label-or-nothing)
 * reader clause.
 *
 * @param description - Candidate description (prefix/date-label removed)
 * @param langCode - Article language code
 * @returns Description with any truncated trailing reader label removed
 */
export function stripTruncatedReaderLabel(description: string, langCode: LanguageCode): string {
  const text = description.trim();
  const cut = findTruncatedReaderLabelCut(text, langCode);
  if (cut < 0) return text;
  return text
    .replace(/[.。！？!?…]+$/u, '')
    .slice(0, cut)
    .replace(/[\s,;:—\-–·。、]+$/u, '')
    .trim();
}

/**
 * Locate a trailing **truncated** copy of the localized reader label and
 * return the index at which the description body ends (i.e. where the
 * partial label begins). Returns -1 when no partial label is present or
 * when the label is present in full (a complete clause we keep).
 *
 * @param text - Trimmed candidate description
 * @param langCode - Article language code
 * @returns Cut index for the partial label, or -1 when none applies
 */
export function findTruncatedReaderLabelCut(text: string, langCode: LanguageCode): number {
  const labels = getLocalizedString(SEO_CONTEXT_LABELS, langCode);
  const reader = (labels.reader ?? '').trim();
  // Require a reasonably long label so we never strip on a coincidental
  // short suffix match; real labels are 40+ chars (Latin) / 11+ (CJK).
  if (reader.length < 8 || text.length < 8) return -1;
  // Tolerate a terminator the resolver/healer appended after the cut.
  const core = text.replace(/[.。！？!?…]+$/u, '');
  const maxK = Math.min(core.length, reader.length);
  for (let k = maxK; k >= 8; k -= 1) {
    if (core.slice(core.length - k) === reader.slice(0, k)) {
      // Full label present at the tail — keep it (not a truncation).
      if (k === reader.length) return -1;
      return core.length - k;
    }
  }
  return -1;
}

/**
 * Detect whether a legacy `<meta description>` ends with a **truncated**
 * reader label once its dateline prefix and redundant date-label clause
 * are removed. Long, unique legacy descriptions otherwise bypass
 * `shouldBackfillDescription`, leaving a persisted mid-word cut
 * (e.g. zh `…政策后果的读`, ja `…追跡する読`, ko `…추적하는.`) in place.
 *
 * @param body - Stripped description body (prefix/date-label removed)
 * @param langCode - Article language code
 * @returns True when a truncated reader label remains in the body
 */
export function hasTruncatedReaderLabelInBody(body: string, langCode: LanguageCode): boolean {
  return findTruncatedReaderLabelCut(body, langCode) >= 0;
}
