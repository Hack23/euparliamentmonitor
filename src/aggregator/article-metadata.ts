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
import type { LangTitleSubtitle, LanguageCode } from '../types/index.js';
import { resolveLocalizedBriefHighlight } from './editorial-brief-resolver.js';
import { budgetFor, classifyScript, clampForBudget } from './metadata/seo-budgets.js';
import { buildTemplateFallback } from './metadata/template-fallback.js';
import {
  buildSeoKeywords,
  composeContextualDescription,
  composeContextualExtendedDescription,
  composeContextualTitle,
  containsNormalized,
  deriveHeadlineFromSummary,
  ensureDescriptionTerminator,
  extractRunNumber,
  hasLeakySeoToken,
  isUsableResolvedTitle,
  manifestOverrideFor,
  padDescriptionToFloor,
  padTitleToFloor,
  pickFirstNonEmpty,
  resolveEditorialContent,
  sanitizeDescriptionCandidate,
  scrubTrailingEllipsis,
} from './metadata/resolve-helpers.js';
import {
  ENRICHMENT_TRIGGER_LENGTH,
  truncateDescription,
  truncateExtendedDescription,
  truncateTitle,
} from './metadata/text-utils.js';
import type {
  MetadataManifest,
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

export { buildSeoKeywords } from './metadata/resolve-helpers.js';

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

/**
 * Inputs to {@link resolveOneLanguage}. Extracting this struct keeps the
 * resolver's per-language loop body free of long argument lists.
 */
interface PerLanguageInputs {
  readonly lang: LanguageCode;
  readonly manifest: MetadataManifest;
  readonly englishEditorial: {
    readonly headline: string;
    readonly summary: string;
    readonly extendedSummary: string;
  };
  readonly template: LangTitleSubtitle;
  readonly runDir?: string | undefined;
  readonly articleType: string;
  readonly date: string;
  readonly runId: string;
}

const LOCALIZED_BRIEF_SOURCE = 'localized-brief';
const ENGLISH_BRIEF_SOURCE = 'english-brief';

/**
 * Append ` — Run N` to a clamped SEO title when the manifest runId
 * carries a discriminator. Reserves budget headroom by trimming the
 * editorial portion (whole-grapheme aware, with trailing separator
 * scrub) before stapling the suffix so we never exceed the per-script
 * `<title>` clamp. Extracted from {@link resolveOneLanguage} to keep
 * its cognitive complexity below the project lint cap.
 *
 * @param seoTitle - Already-clamped, ellipsis-scrubbed SEO title
 * @param lang - Language code (drives the per-script title budget)
 * @param runId - Manifest run identifier (may be empty)
 * @returns Title with ` — Run N` appended, or the unchanged input when
 *   no runId is present or the suffix can't fit inside budget
 */
function appendRunNumberSuffix(seoTitle: string, lang: LanguageCode, runId: string): string {
  const runNumber = extractRunNumber(runId);
  if (!runNumber || containsNormalized(seoTitle, `Run ${runNumber}`)) {
    return seoTitle;
  }
  const titleBudget = budgetFor(lang, 'title');
  const suffix = ` — Run ${runNumber}`;
  const suffixLen = Array.from(suffix).length;
  const seoTitleGraphemes = Array.from(seoTitle);
  if (seoTitleGraphemes.length + suffixLen <= titleBudget) {
    return `${seoTitle}${suffix}`;
  }
  if (suffixLen >= titleBudget) return seoTitle;
  // Reserve budget: trim editorial portion to leave room for the
  // ` — Run N` suffix without exceeding the per-script clamp.
  const headroom = titleBudget - suffixLen;
  const trimmedHead = seoTitleGraphemes
    .slice(0, headroom)
    .join('')
    .replace(/[\s|,;:—\-–]+$/u, '')
    .trim();
  return trimmedHead ? `${trimmedHead}${suffix}` : seoTitle;
}

/**
 * Resolve `{title, description, keywords, source}` for one language.
 *
 * @param input - Per-language inputs
 * @returns One resolved metadata entry
 */
function resolveOneLanguage(input: PerLanguageInputs): ResolvedMetadataEntry {
  const manifestTitle = manifestOverrideFor(input.manifest.title, input.lang);
  const manifestDescription = manifestOverrideFor(input.manifest.description, input.lang);

  const perLanguage = resolvePerLanguageEditorial(input);
  const editorial = perLanguage.editorial;

  // When a non-EN language falls back to the English brief (no localized
  // sibling and no `editorial.headline_<lang>` override), the English
  // manifest title is a better SEO candidate than the bare H1 /
  // headline-judgement bullet: editors curate manifest titles to be
  // unique across adjacent runs (date- or article-type-qualified) even
  // when two briefs share the same lead bullet. Falling through to the
  // English manifest description is the matching safeguard against
  // cross-pair duplicate `<meta description>` values.
  //
  // SEO/locale safety: never surface an English title for a non-Latin
  // locale — the SEO extraction suite requires each non-Latin `<title>`
  // to carry at least one locale-script glyph. The
  // English-manifest-description fall-through stays unconditional
  // because {@link composeContextualDescription} wraps it in localized
  // `Date:` / `Context:` / `reader` labels.
  const fallbackTitleAllowed =
    perLanguage.source === ENGLISH_BRIEF_SOURCE && classifyScript(input.lang) === 'latin';
  const englishFallbackTitle = fallbackTitleAllowed
    ? manifestOverrideFor(input.manifest.title, 'en' as LanguageCode)
    : '';
  const englishFallbackDescription =
    perLanguage.source === ENGLISH_BRIEF_SOURCE
      ? manifestOverrideFor(input.manifest.description, 'en' as LanguageCode)
      : '';

  const contextualTitle = composeContextualTitle(
    input.template.title,
    editorial.headline,
    input.runId,
    input.date,
    input.lang
  );
  const title = pickFirstNonEmpty([
    manifestTitle,
    englishFallbackTitle,
    contextualTitle,
    input.template.title,
  ]);

  const rawDescription = sanitizeDescriptionCandidate(
    pickFirstNonEmpty([
      manifestDescription,
      englishFallbackDescription,
      editorial.summary,
      input.template.subtitle,
    ])
  );

  const safeEditorial = {
    headline: isUsableResolvedTitle(editorial.headline) ? editorial.headline.trim() : '',
    summary: sanitizeDescriptionCandidate(editorial.summary),
    extendedSummary: sanitizeDescriptionCandidate(editorial.extendedSummary),
  };

  const normalizedRawDescription =
    rawDescription || sanitizeDescriptionCandidate(input.template.subtitle);
  // Localized-brief descriptions are normally preserved verbatim to
  // avoid corrupting carefully-translated prose with generic "Date:"
  // boilerplate. We only honour that shortcut when the translation is
  // already long enough to clear the per-script SEO floor — otherwise
  // ultra-short localized briefs (e.g. "Geen nieuwe moties op
  // 2026-04-01." at 47 chars) fall below SERP truncation. In that case
  // we re-enable enrichment so `composeContextualDescription` can
  // append the localized "Date" qualifier and push the description
  // above the reader floor.
  const description =
    normalizedRawDescription.length >= ENRICHMENT_TRIGGER_LENGTH
      ? normalizedRawDescription
      : composeContextualDescription(
          input.lang,
          normalizedRawDescription,
          safeEditorial,
          input.date,
          input.runId
        );

  const clippedTitle = truncateTitle(title).trim();
  const explicitTitle =
    manifestTitle && !hasLeakySeoToken(manifestTitle) ? truncateTitle(manifestTitle).trim() : '';
  const allowShortResolvedTitle = perLanguage.source === LOCALIZED_BRIEF_SOURCE;
  const resolvedTitleCandidate =
    clippedTitle &&
    !hasLeakySeoToken(clippedTitle) &&
    (allowShortResolvedTitle || isUsableResolvedTitle(clippedTitle))
      ? clippedTitle
      : '';
  const summaryDerivedTitle = deriveHeadlineFromSummary(
    safeEditorial.summary || normalizedRawDescription
  );

  // `truncateTitle` returns '' when an editorial title overruns the
  // budget with no acceptable clause boundary — fall back to the
  // localized template title in that case so we never emit an empty
  // `<title>`. Live regression: 2026-05-22 breaking
  // `AI Trade Strategy: A Legislative First with Structural…` clipped
  // to '' after the no-ellipsis guard landed; template fallback
  // (`Extended Executive Brief — Breaking News`) is preferable to a
  // blank `<title>`.
  //
  // The fallback path passes the template title back through
  // {@link composeContextualTitle} (with an empty editorial headline)
  // so `withRunQualifier` re-appends the `— Run N` suffix. Without
  // this, two same-date / same-articleType runs (republish, hot-fix
  // re-run) would collapse to byte-identical `<title>` strings, and
  // the duplicate-title gate in `scripts/validate-article-seo.js`
  // would (correctly) fail CI.
  const contextualFallback = composeContextualTitle(
    input.template.title,
    '',
    input.runId,
    input.date,
    input.lang
  );
  const truncatedTitle = pickFirstNonEmpty([
    explicitTitle,
    resolvedTitleCandidate,
    isUsableResolvedTitle(summaryDerivedTitle, { allowFullSentence: true })
      ? summaryDerivedTitle
      : '',
    truncateTitle(contextualFallback),
    contextualFallback,
  ]);
  // Per-script SEO title clamp. `truncateTitle` enforces the
  // 140-char hard cap but is too lax for the optimal SERP range
  // (25-60 Latin / 12-30 CJK / 25-55 RTL) — the
  // `executive-brief-seo-extraction` regression suite checks the
  // grapheme count of every published `<title>` against that band.
  // `clampForBudget(_, lang, 'title')` reads the per-script
  // `SEO_BUDGETS.title` table (60/30/55) and breaks at a clause
  // boundary so we never ship a mid-word ellipsis on a CJK
  // headline.
  //
  // **Post-clamp scrub**: `clampForBudget` is contractually required
  // to emit a trailing `…` when it has to hard-cut mid-clause
  // (locked by `test/unit/seo-budgets.test.js:147-152`). Titles,
  // however, must not carry that ellipsis: `title-rejection.ts`
  // flags `…`-suffixed titles as truncation cuts. We strip the
  // ellipsis after the clamp, then — when the runId carries a
  // `runN` discriminator — append ` — Run N` so multiple sub-runs
  // on the same date emit distinct titles (the SEO suite's
  // duplicate-title detector triggers on identical (date, articleType)
  // pairs). Budget reservation: if the suffix would push the title
  // over the per-script budget, we re-clamp the editorial portion to
  // make room.
  const seoTitleClamped = clampForBudget(truncatedTitle, input.lang, 'title');
  let seoTitle = scrubTrailingEllipsis(seoTitleClamped);
  seoTitle = appendRunNumberSuffix(seoTitle, input.lang, input.runId ?? '');
  // Final SERP-floor recovery on the resolved title. The internal
  // branch inside `composeContextualTitle` only fires on the
  // `fallbackTitle` path; titles selected from `manifestTitle`,
  // `englishFallbackTitle`, or the H1-extracted `resolvedTitleCandidate`
  // bypass it and can ship below the per-script reader floor (e.g.
  // `"Moties | 2026-04-01"` — 19 chars, nl). `padTitleToFloor` appends
  // ` (EP)` when (a) the title is below floor, (b) there is no
  // isolated `EP` token already present (word-boundary check — the
  // simpler substring scan was fooled by Dutch/German/French words
  // such as `Europese`/`Europäische`), and (c) the result fits inside
  // the per-script `<title>` budget.
  seoTitle = padTitleToFloor(seoTitle, input.lang, budgetFor(input.lang, 'title'));
  // `clampForBudget` is contractually required to emit a trailing `…`
  // when it has to hard-cut mid-clause (locked by
  // `test/unit/seo-budgets.test.js:147-152`). For meta-descriptions
  // we need a real sentence terminator instead — the SEO suite's
  // description-ellipsis gate (`executive-brief-seo-extraction.test.js`
  // line 706) rejects snippets ending in `…` or `...`. The
  // `ensureDescriptionTerminator` finalizer strips the trailing
  // ellipsis (with any dangling pipe/colon/em-dash) and either
  // back-scans to the most recent real terminator within the trailing
  // ~35 chars, or appends `.` / `。` based on the language's script.
  //
  // Universal description cap. `truncateDescription` enforces a
  // language-agnostic 180-char ceiling — this avoids the regression
  // where `clampForBudget(_, lang, 'metaDescription')` (78-char CJK
  // budget) shrank Latin-only test/manifest descriptions for ja/ko/zh
  // below the ≥100/≥120-char article-metadata.test.js assertions.
  // For real CJK content the natural ~2× density keeps descriptions
  // under 78 chars regardless; the script-aware terminator finalizer
  // still runs after.
  const truncatedDescription = padDescriptionToFloor(
    ensureDescriptionTerminator(input.lang, truncateDescription(description)),
    input.lang
  );

  const extendedSource = sanitizeDescriptionCandidate(
    manifestDescription || safeEditorial.extendedSummary || normalizedRawDescription
  );
  // Two-tier extended-description resolution:
  // 1. Direct truncation — preferred when the editorial source paragraph
  //    is already ≥181 chars (the truncator's gating threshold). This
  //    yields the highest-fidelity og:description text.
  // 2. Contextual synthesis — when direct truncation returns '' (source
  //    was too short), synthesize a longer string by stitching together
  //    `<source> + Date: YYYY-MM-DD + Context: <editorial> + <reader>`.
  //    This is the **only** SEO path that surfaces the localized
  //    "for democratic-accountability readers …" framing (the short
  //    <meta description> no longer carries it — see comment in
  //    {@link composeContextualDescription}). The synthesized string is
  //    re-clamped to the 200–300 char og:description budget.
  //
  // Live regression (2026-05): 56 breaking briefs shipped with empty
  // extendedDescription because their lead paragraph was only 80–150
  // chars. AI-overview and Discover surfaces dropped them entirely.
  let truncatedExtendedDescription = truncateExtendedDescription(extendedSource);
  if (!truncatedExtendedDescription) {
    truncatedExtendedDescription = composeContextualExtendedDescription(
      input.lang,
      extendedSource || normalizedRawDescription,
      safeEditorial,
      input.date
    );
  }

  const source: ResolvedMetadataEntry['source'] =
    manifestTitle || manifestDescription ? 'manifest' : perLanguage.source;

  return {
    title: seoTitle,
    description: truncatedDescription,
    extendedDescription: truncatedExtendedDescription,
    keywords: buildSeoKeywords(
      input.lang,
      input.articleType,
      input.date,
      input.runId,
      seoTitle,
      truncatedDescription
    ),
    source,
  };
}

/**
 * Select the editorial `{headline, summary}` pair for one language,
 * preferring the translated `executive-brief_<lang>.md` over the English
 * brief.
 *
 * For **non-Latin script locales** (`ar`, `he`, `ja`, `ko`, `zh`), if no
 * translated sibling exists we DROP the English editorial and fall
 * through to the empty pair so the locale-aware template fallback in
 * {@link buildTemplateFallback} can supply localised title/description.
 * Serving English `<title>` / meta-description text to a reader of a
 * non-Latin script is a clear SEO + UX bug — it pushes the page out of
 * locale matching for search, and the reader sees prose they cannot
 * parse. See the failing cases in
 * `test/unit/executive-brief-seo-extraction.test.js` (e.g. Korean run
 * for `2026-05-09/term-outlook` previously emitted the English
 * headline "EPP remains dominant broker" verbatim).
 *
 * For Latin non-EN locales (sv/da/no/fi/de/fr/es/nl) we keep the
 * existing `english-brief` fallback because (a) most users with that
 * publishing locale read English, and (b) the localised brief is
 * usually present so this path is rare.
 *
 * @param input - Per-language inputs
 * @returns Editorial pair plus the tier that produced it
 */
function resolvePerLanguageEditorial(input: PerLanguageInputs): {
  readonly editorial: {
    readonly headline: string;
    readonly summary: string;
    readonly extendedSummary: string;
  };
  readonly source: ResolvedMetadataEntry['source'];
} {
  if (input.lang !== 'en' && input.runDir) {
    const localized = resolveLocalizedBriefHighlight(
      input.runDir,
      input.lang,
      input.articleType,
      input.date
    );
    if (localized && (localized.headline || localized.summary)) {
      return {
        editorial: {
          headline: localized.headline,
          summary: localized.summary,
          extendedSummary: localized.extendedSummary,
        },
        source: LOCALIZED_BRIEF_SOURCE,
      };
    }
  }
  // Fall-through to the English editorial when no localized brief is
  // available. SEO/locale safety: for non-Latin scripts (CJK + RTL),
  // the English **headline** would leak as a pure-ASCII `<title>` —
  // the SEO extraction regression suite asserts every non-Latin
  // locale's title carries at least one locale-script glyph
  // (`executive-brief-seo-extraction.test.js` § 4 LOCALE FIDELITY).
  // We therefore null out the English `headline` for non-Latin scripts
  // so titles fall through to the localized template, but keep the
  // English **summary**/extended summary available to
  // {@link composeContextualDescription}, which wraps it in localized
  // `Date:` / `Context:` / `reader` labels — without this, CJK
  // descriptions drop below the article-metadata.test.js ≥100/≥120
  // chars reader floor whenever the operator's manifest carries
  // English content meant for cross-lingual reuse (Tier 1 override
  // path, or English-editorial fall-through with no localized
  // sibling).
  if (input.englishEditorial.headline || input.englishEditorial.summary) {
    const stripEnglishHeadline = input.lang !== 'en' && classifyScript(input.lang) !== 'latin';
    return {
      editorial: stripEnglishHeadline
        ? {
            headline: '',
            summary: input.englishEditorial.summary,
            extendedSummary: input.englishEditorial.extendedSummary,
          }
        : input.englishEditorial,
      source: input.lang === 'en' ? 'english-editorial' : 'english-brief',
    };
  }
  return {
    editorial: { headline: '', summary: '', extendedSummary: '' },
    source: 'template',
  };
}
