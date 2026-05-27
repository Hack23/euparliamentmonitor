// SPDX-FileCopyrightText: 2024-2026 Hack23 AB
// SPDX-License-Identifier: Apache-2.0

/**
 * @module Aggregator/ArticleMetadata
 * @description Resolve per-language `{title, description}` for an article
 * rendered by the aggregator pipeline. The resolver follows a strict
 * priority ladder that prefers *real editorial highlights* over boring,
 * repeated templates — satisfying the core SEO requirement that every
 * published article carry a unique, content-reflective headline and
 * description in every language variant.
 *
 * Priority ladder (per language, highest wins) — matches the editorial
 * contract documented in
 * [`.github/prompts/04-article-generation.md`](../../.github/prompts/04-article-generation.md) § 6.2:
 *
 * 1. **Manifest override** — `manifest.title` / `manifest.description` on
 *    the analysis-run manifest, either as a plain string (applied to every
 *    language) or a `LanguageMap<string>` object for explicit per-language
 *    values.
 * 2. **Localized executive brief** — for non-English `<lang>`, the
 *    translated sibling `executive-brief_<lang>.md` (or
 *    `extended/executive-brief_<lang>.md`) under the run directory.
 *    Resolved via `editorial-brief-resolver.ts`. This is the authoritative
 *    localized source produced by the `news-translate` workflow.
 * 3. **English executive brief, verbatim** — the English brief
 *    (`executive-brief.md` / `extended/executive-brief.md`) used as a
 *    fall-through when a locale has no translated brief yet.
 * 4. **Artefact editorial H1** — first `# …` heading from the first
 *    substantive artefact under the run directory.
 * 5. **Aggregated-markdown H1** — the first `# …` heading in the aggregator
 *    output, accepted under the same non-generic rule.
 * 6. **First strong prose paragraph** — the first line of the aggregated
 *    Markdown that survives {@link shouldSkipDescriptionLine}.
 * 7. **Localized template** — the per-article-type `*_TITLES` generator
 *    from `src/constants/language-articles.ts`. Last resort.
 *
 * --- IMPLEMENTATION NOTE ---
 *
 * Following Refactor 6/8 (issue #2034) this file holds the resolver
 * orchestrator (`resolveArticleMetadata`) plus per-language dispatch
 * (`resolveOneLanguage`, `resolvePerLanguageEditorial`) that depend on
 * `resolveLocalizedBriefHighlight` from `editorial-brief-resolver.ts`.
 * Pure leaf helpers live in `src/aggregator/metadata/`:
 *
 *   - `metadata/types.ts` — `ResolvedMetadata{Entry}`, `MetadataManifest`,
 *     `ResolveMetadataOptions`.
 *   - `metadata/h1-extractor.ts` — first-H1 extraction.
 *   - `metadata/lede-extractor.ts` — strong-prose + lede-after-heading.
 *   - `metadata/heading-rules.ts` — generic/category/lede heading rules.
 *   - `metadata/slug.ts` — `humanizeSlug`.
 *   - `metadata/artifact-highlight.ts` — editorial-artefact highlight
 *     ladder + priority-finding extractor.
 *   - `metadata/template-fallback.ts` — `buildTemplateFallback` +
 *     `SEO_CONTEXT_LABELS`.
 *   - `metadata/text-utils.ts` — truncation + skip filters.
 *   - `metadata/date-labels.ts` — week/month/quarter/year/term labels.
 *   - `metadata/resolve-helpers.ts` — pure resolver helpers
 *     (manifest override, editorial-content, contextual title/description,
 *     SEO keywords).
 *
 * New code should import directly from the leaf modules. This barrel is
 * preserved for backward compatibility with existing call sites.
 */

import { ALL_LANGUAGES } from '../constants/language-core.js';
import type { LanguageCode } from '../types/index.js';
import { resolveOneLanguage } from './metadata/per-language-resolver.js';
import { buildTemplateFallback } from './metadata/template-fallback.js';
import { resolveEditorialContent } from './metadata/resolve-helpers.js';
import type {
  ResolvedMetadata,
  ResolvedMetadataEntry,
  ResolveMetadataOptions,
} from './metadata/types.js';

// --- Public re-exports (leaf modules) ---

export type {
  MetadataManifest,
  ResolvedMetadata,
  ResolvedMetadataEntry,
  ResolveMetadataOptions,
} from './metadata/types.js';

export {
  shouldSkipDescriptionLine,
  stripLeadingProseLabel,
  stripInlineMarkdown,
  truncateDescription,
  truncateExtendedDescription,
  truncateTitle,
  extractFirstSentence,
} from './metadata/text-utils.js';

export {
  isArtifactCategoryHeading,
  stripArtifactCategoryAffix,
  isGenericHeading,
} from './metadata/heading-rules.js';

export { humanizeSlug } from './metadata/slug.js';

export { extractFirstH1 } from './metadata/h1-extractor.js';
export {
  extractStrongProseLine,
  extractLedeAfterHeading,
  extractExtendedLedeAfterHeading,
} from './metadata/lede-extractor.js';

export {
  extractArtifactHighlight,
  extractPriorityFindingHighlight,
  isTranslatedSiblingBrief,
} from './metadata/artifact-highlight.js';

export { buildTemplateFallback } from './metadata/template-fallback.js';

export {
  deriveWeekRange,
  deriveReportingWindowForWeekInReview,
  deriveMonthLabel,
  deriveQuarterLabel,
  deriveYearLabel,
  deriveTermLabel,
  deriveElectionCycleLabel,
} from './metadata/date-labels.js';

export { buildSeoKeywords } from './metadata/seo-keywords.js';

// --- Resolver orchestrator ---

/**
 * Resolve per-language `{title, description}` for one article following
 * the priority ladder documented at the top of this module.
 *
 * @param opts - Resolver inputs ({@link ResolveMetadataOptions})
 * @returns One `{title, description}` entry per supported language
 */
export function resolveArticleMetadata(opts: ResolveMetadataOptions): ResolvedMetadata {
  const manifest = opts.manifest ?? {};
  const englishEditorial = resolveEditorialContent(opts);
  const template = buildTemplateFallback(opts.articleType, opts.date, manifest.committee);
  // Manifests may carry runId as a string (UUID) or a number (incrementing counter).
  // Coerce to string before trimming to avoid `runId?.trim is not a function` on numeric IDs.
  // When runId is a UUID (no embedded `runN` token), fall back to `articleTypeSlug`
  // (e.g. "committee-reports-run50") which carries the run number we need for
  // disambiguating same-date sub-runs.
  const rawRunId =
    manifest.runId === undefined || manifest.runId === null ? '' : String(manifest.runId).trim();
  const slugForRun =
    typeof (manifest as { articleTypeSlug?: unknown }).articleTypeSlug === 'string'
      ? String((manifest as { articleTypeSlug?: string }).articleTypeSlug).trim()
      : '';
  const runId =
    /(?:^|-)run\d+/u.test(rawRunId) || /^\d+$/u.test(rawRunId)
      ? rawRunId
      : slugForRun && /-run\d+$/u.test(slugForRun)
        ? slugForRun
        : rawRunId;

  const result: Record<LanguageCode, ResolvedMetadataEntry> = Object.create(null) as Record<
    LanguageCode,
    ResolvedMetadataEntry
  >;

  for (const lang of ALL_LANGUAGES) {
    const entry = resolveOneLanguage({
      lang,
      manifest,
      englishEditorial,
      template: template[lang],
      runDir: opts.runDir,
      articleType: opts.articleType,
      date: opts.date,
      runId,
    });
    Object.defineProperty(result, lang, {
      value: entry,
      enumerable: true,
      writable: true,
      configurable: true,
    });
  }

  return result;
}

