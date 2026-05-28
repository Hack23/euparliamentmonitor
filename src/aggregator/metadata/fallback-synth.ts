// SPDX-FileCopyrightText: 2024-2026 Hack23 AB
// SPDX-License-Identifier: Apache-2.0

/**
 * @file Hard fallback metadata synthesizers for the per-language SEO
 * resolver. These run only when every resolved title/description candidate is
 * contaminated with pipeline jargon, producing reader-facing, search-safe copy
 * from article context instead of leaking internal pipeline artifacts.
 */

import { budgetFor, classifyScript, clampForBudget } from './seo-budgets.js';
import {
  composeContextualDescription,
  deriveHeadlineFromSummary,
  ensureDescriptionTerminator,
  hasLeakySeoToken,
  padDescriptionToFloor,
  sanitizeDescriptionCandidate,
  sanitizeTitleCandidate,
} from './resolve-helpers.js';
import { truncateTitle } from './text-utils.js';
import type { PerLanguageInputs } from './per-language-resolver.js';

/**
 * Humanize an article-type slug for fallback metadata synthesis.
 *
 * @param articleType - Canonical article-type slug
 * @returns Title-cased label with spaces instead of hyphens
 */
export function humanizeArticleTypeLabel(articleType: string): string {
  return articleType
    .split('-')
    .filter(Boolean)
    .map((token) => token.charAt(0).toUpperCase() + token.slice(1))
    .join(' ');
}

/**
 * Format `YYYY-MM-DD` into `Mon YYYY`; falls back to the raw date when invalid.
 *
 * Formats with the target language (falling back to `en`) so the synthesized
 * fallback title stays locale-appropriate for Latin non-EN locales (e.g.
 * `sv`/`fr`) instead of emitting an English month label on every page.
 *
 * @param date - ISO article date
 * @param lang - Target language code driving the month-label locale
 * @returns Month/year label suitable for fallback titles
 */
export function formatMonthYear(date: string, lang: string): string {
  const parsed = new Date(`${date}T00:00:00Z`);
  if (Number.isNaN(parsed.getTime())) return date;
  return new Intl.DateTimeFormat([lang, 'en'], {
    month: 'short',
    year: 'numeric',
    timeZone: 'UTC',
  }).format(parsed);
}

/**
 * Hard fallback title synthesizer when all resolved candidates are contaminated.
 * Shape: `EP <Article Type>: <Top Finding> — <Mon YYYY>`.
 *
 * @param input - Per-language resolver inputs
 * @param topFindingSource - Best available finding/summary source text
 * @param contextualFallback - Last-resort contextual fallback title
 * @returns Reader-facing synthesized fallback title
 */
export function synthesizeFallbackTitle(
  input: PerLanguageInputs,
  topFindingSource: string,
  contextualFallback: string
): string {
  // The synthesized shape (`EP <Article Type>: <Top Finding> — <Mon YYYY>`)
  // is Latin/English by construction (the `EP <Article Type>` lead-in and
  // colon punctuation). Emitting it on a non-Latin locale would ship a
  // pure-ASCII `<title>`, violating the locale-glyph contract (Gate 4a). For
  // those locales we defer to the localized contextual fallback instead.
  if (classifyScript(input.lang) !== 'latin') return contextualFallback;
  const topFinding = sanitizeTitleCandidate(deriveHeadlineFromSummary(topFindingSource));
  const articleTypeLabel = humanizeArticleTypeLabel(input.articleType);
  const monthYear = formatMonthYear(input.date, input.lang);
  const synthesized = topFinding
    ? `EP ${articleTypeLabel}: ${topFinding} — ${monthYear}`
    : `EP ${articleTypeLabel} — ${input.date}`;
  const candidate = truncateTitle(synthesized) || synthesized;
  return !candidate || hasLeakySeoToken(candidate) ? contextualFallback : candidate;
}

/**
 * Hard fallback description synthesizer when the resolved description leaks
 * pipeline jargon.
 *
 * @param input - Per-language resolver inputs
 * @returns Reader-facing synthesized fallback description
 */
export function synthesizeFallbackDescription(input: PerLanguageInputs): string {
  const templateSubtitle = sanitizeDescriptionCandidate(input.template.subtitle);
  const articleTypeLabel = humanizeArticleTypeLabel(input.articleType);
  const base =
    templateSubtitle && !hasLeakySeoToken(templateSubtitle)
      ? templateSubtitle
      : `EP ${articleTypeLabel} update for ${input.date}.`;
  const synthesized = composeContextualDescription(
    input.lang,
    base,
    { headline: '', summary: '' },
    input.date,
    ''
  );
  const clamped = clampForBudget(synthesized, input.lang, 'metaDescription');
  return padDescriptionToFloor(
    ensureDescriptionTerminator(input.lang, clamped, budgetFor(input.lang, 'metaDescription')),
    input.lang
  );
}
