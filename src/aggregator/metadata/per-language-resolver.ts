// SPDX-FileCopyrightText: 2024-2026 Hack23 AB
// SPDX-License-Identifier: Apache-2.0

/**
 * @module Aggregator/Metadata/PerLanguageResolver
 * @description Per-language `{title, description, keywords, source}` resolver
 * extracted from `article-metadata.ts` to keep that orchestrator below the
 * 600-line drift-guard cap (see `test/unit/source-file-size.test.js`).
 *
 * This module owns three closely-coupled concerns that are tedious to keep
 * coherent across separate files:
 *
 *   1. {@link resolvePerLanguageEditorial} — the Tier-1/Tier-2/Tier-3 editorial
 *      selection (localized brief → English brief → empty/template) with the
 *      script-aware safety net that strips English headlines from non-Latin
 *      locales so RTL/CJK pages never ship pure-ASCII `<title>` text.
 *   2. {@link resolveOneLanguage} — the actual `{title, description}` composer
 *      that picks across (manifest override → editorial headline →
 *      summary-derived → contextual fallback), clamps to the per-script SEO
 *      budgets, and stitches localized SEO labels into both surfaces.
 *   3. {@link appendRunNumberSuffix} — preserved as a no-op for backward
 *      compatibility. Run numbers never appear in user-facing titles.
 *
 * SEO-fidelity contracts enforced here:
 *
 *  - **Non-Latin locales never ship pure-ASCII descriptions** (Gate 4b in
 *    `executive-brief-seo-extraction.test.js`). When the English editorial
 *    falls through to ar/he/ja/ko/zh and the description would otherwise be
 *    Latin-only, enrichment is forced so localized `Date:` / `Context:` /
 *    `reader` labels are spliced in. The base content stays for SEO topical
 *    relevance; the localized framing makes the snippet locale-correct.
 *  - **Non-Latin titles always carry a locale-script glyph** (Gate 4a). The
 *    English-summary-derived title candidate is rejected for non-Latin
 *    locales when its content is pure ASCII, forcing fall-through to the
 *    localized template title from {@link buildTemplateFallback}.
 *  - **Per-script SERP-fill clamp** (Gate "OPTIMAL_DESC SERP-fill ratio"):
 *    descriptions are clamped to `SEO_BUDGETS.metaDescription` (155 Latin /
 *    78 CJK / 150 RTL) whenever the source content actually matches the
 *    locale's script. English-content fallbacks keep the universal 180-char
 *    cap so the article-metadata.test.js ≥100 / ≥120 reader-floor
 *    assertions remain satisfiable for cross-lingual content reuse.
 */

import type { LangTitleSubtitle, LanguageCode } from '../../types/index.js';
import { budgetFor, classifyScript, clampForBudget } from './seo-budgets.js';
import {
  composeContextualDescription,
  composeContextualExtendedDescription,
  composeContextualTitle,
  appendEditionQualifier,
  deriveHeadlineFromSummary,
  ensureDescriptionTerminator,
  hasLeakySeoToken,
  isUsableResolvedTitle,
  manifestOverrideFor,
  padDescriptionToFloor,
  padTitleToFloor,
  pickFirstNonEmpty,
  sanitizeDescriptionCandidate,
  sanitizeTitleCandidate,
  scrubTrailingEllipsis,
} from './resolve-helpers.js';
import { buildSeoKeywords } from './seo-keywords.js';
import {
  ENRICHMENT_TRIGGER_LENGTH,
  truncateDescription,
  truncateExtendedDescription,
  truncateTitle,
} from './text-utils.js';
import type { MetadataManifest, ResolvedMetadataEntry } from './types.js';

/**
 * Inputs to {@link resolveOneLanguage}. Extracting this struct keeps the
 * resolver's per-language loop body free of long argument lists.
 */
export interface PerLanguageInputs {
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
  /** Injected dependency — resolves localized brief highlight for a language. */
  readonly resolveLocalizedBrief?: (
    runDir: string,
    lang: LanguageCode,
    articleType: string,
    date: string
  ) => { headline: string; summary: string; extendedSummary: string } | null;
}

const LOCALIZED_BRIEF_SOURCE: ResolvedMetadataEntry['source'] = 'localized-brief';
const ENGLISH_BRIEF_SOURCE: ResolvedMetadataEntry['source'] = 'english-brief';

/**
 * Unicode glyph probes used to detect whether resolved SEO copy actually
 * matches the publishing locale's expected script. The CJK range covers
 * Hiragana / Katakana (Japanese), Han ideographs (Chinese + Japanese kanji)
 * and Hangul (Korean). The RTL range covers Hebrew (U+0590–U+05FF) and
 * Arabic + supplements (U+0600–U+06FF).
 *
 * These probes drive the script-aware description clamp and the
 * English-summary-derived title rejection gate below.
 */
const CJK_GLYPH_RE = /[\u3040-\u30FF\u3400-\u9FFF\uAC00-\uD7AF]/u;
const RTL_GLYPH_RE = /[\u0590-\u05FF\u0600-\u06FF]/u;
// eslint-disable-next-line no-control-regex
const ASCII_ONLY_RE = /^[\x00-\x7F]*$/u;

/**
 * Test whether `text` contains a glyph in the script family expected for
 * `lang`. Latin locales return `true` unconditionally — their content is
 * always Latin glyphs by definition.
 *
 * @param text - SEO copy under inspection
 * @param lang - Publishing locale
 * @returns True when `text` carries at least one glyph in the locale's script
 */
function contentMatchesLocaleScript(text: string, lang: LanguageCode): boolean {
  const family = classifyScript(lang);
  if (family === 'latin') return true;
  if (family === 'cjk') return CJK_GLYPH_RE.test(text);
  return RTL_GLYPH_RE.test(text);
}

/**
 * No-op: run numbers must never appear in user-facing article titles.
 * Titles should always be readable article headlines without workflow
 * identifiers. This function is preserved for callsite backward
 * compatibility.
 *
 * @param seoTitle - SEO title (returned unchanged)
 * @param _lang - Language code (ignored)
 * @param _runId - Manifest run identifier (ignored)
 * @returns The unchanged input title
 */
export function appendRunNumberSuffix(seoTitle: string, _lang: LanguageCode, _runId: string): string {
  // Run numbers must never appear in user-facing article titles.
  // Titles should always be readable article headlines without
  // workflow identifiers. This function is preserved as a no-op
  // for callsite backward compatibility.
  return seoTitle;
}

/**
 * Build the editorial source object for one language. Prefers a translated
 * `executive-brief_<lang>.md` sibling, falls through to the English brief
 * with a script-aware safety net (English headline stripped for non-Latin
 * locales so titles fall through to the localized template).
 *
 * For **non-Latin script locales** (`ar`, `he`, `ja`, `ko`, `zh`), if no
 * translated sibling exists we DROP the English `headline` and fall
 * through to the empty pair so the locale-aware template fallback in
 * {@link buildTemplateFallback} can supply localised `<title>` text. The
 * English `summary` / `extendedSummary` are kept so
 * {@link composeContextualDescription} can wrap them in localized
 * `Date:` / `Context:` / `reader` labels and produce a description that
 * still carries locale-script glyphs (Gate 4b of
 * `executive-brief-seo-extraction.test.js`).
 *
 * For Latin non-EN locales (sv/da/no/fi/de/fr/es/nl) we keep the existing
 * `english-brief` fallback because (a) most users with that publishing
 * locale read English, and (b) the localised brief is usually present so
 * this path is rare.
 *
 * @param input - Per-language inputs
 * @returns Editorial pair plus the tier that produced it
 */
export function resolvePerLanguageEditorial(input: PerLanguageInputs): {
  readonly editorial: {
    readonly headline: string;
    readonly summary: string;
    readonly extendedSummary: string;
  };
  readonly source: ResolvedMetadataEntry['source'];
} {
  if (input.lang !== 'en' && input.runDir && input.resolveLocalizedBrief) {
    const localized = input.resolveLocalizedBrief(
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
      source: input.lang === 'en' ? 'english-editorial' : ENGLISH_BRIEF_SOURCE,
    };
  }
  return {
    editorial: { headline: '', summary: '', extendedSummary: '' },
    source: 'template',
  };
}

/**
 * Decide whether to push the raw description through
 * {@link composeContextualDescription}'s enrichment path. Triggers when
 * the raw description is below {@link ENRICHMENT_TRIGGER_LENGTH} (the
 * historical "too short" gate) **or** when the locale is non-Latin and
 * the raw description is pure ASCII (the English-fallback all-ASCII
 * description failure mode reported by Gate 4b in
 * `executive-brief-seo-extraction.test.js`).
 *
 * The second branch is the key fix for ar/he descriptions that fell
 * through from the English brief without any localized labels — even
 * though the raw English summary cleared the 100-char trigger, leaving
 * it untouched produced a pure-ASCII snippet that the SEO regression
 * suite (correctly) rejects as a resolver leak.
 *
 * @param rawDescription - Composed description before enrichment
 * @param lang - Publishing locale
 * @returns True when enrichment must run
 */
function shouldEnrichDescription(rawDescription: string, lang: LanguageCode): boolean {
  if (rawDescription.length < ENRICHMENT_TRIGGER_LENGTH) return true;
  if (lang === 'en') return false;
  if (classifyScript(lang) === 'latin') return false;
  return ASCII_ONLY_RE.test(rawDescription);
}

/**
 * Pick the SEO `<title>` from the candidate ladder. Skips the
 * summary-derived candidate for non-Latin locales when its content is
 * pure ASCII so we never leak an English summary-derived title (e.g.
 * `*Q1 2026 is the master-synthe`) into a CJK / RTL page (Gate 4a in
 * `executive-brief-seo-extraction.test.js`).
 *
 * @param input - Per-language inputs (for locale)
 * @param candidates - Title candidate inputs (in priority order)
 * @param candidates.explicitTitle - Manifest operator override title
 * @param candidates.resolvedTitleCandidate - H1/document-derived title
 * @param candidates.summaryDerivedTitle - Summary-first-sentence title
 * @param candidates.contextualFallback - Final fallback title
 * @returns Picked title (always non-empty when the contextual fallback fires)
 */
function pickResolvedTitle(
  input: PerLanguageInputs,
  candidates: {
    readonly explicitTitle: string;
    readonly resolvedTitleCandidate: string;
    readonly summaryDerivedTitle: string;
    readonly contextualFallback: string;
  }
): string {
  const family = classifyScript(input.lang);
  const summaryTitleAllowed =
    candidates.summaryDerivedTitle &&
    isUsableResolvedTitle(candidates.summaryDerivedTitle, { allowFullSentence: true }) &&
    !(
      family !== 'latin' && !contentMatchesLocaleScript(candidates.summaryDerivedTitle, input.lang)
    );
  return pickFirstNonEmpty([
    candidates.explicitTitle,
    candidates.resolvedTitleCandidate,
    summaryTitleAllowed ? candidates.summaryDerivedTitle : '',
    truncateTitle(candidates.contextualFallback),
    candidates.contextualFallback,
  ]);
}

/**
 * Resolve `{title, description, keywords, source}` for one language.
 *
 * @param input - Per-language inputs
 * @returns One resolved metadata entry
 */
export function resolveOneLanguage(input: PerLanguageInputs): ResolvedMetadataEntry {
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

  // Token-level sanitization rescues editorial H1s such as
  // `Run 180, 17 April 2026` → `17 April 2026` instead of falling
  // through to a duplicate template title.
  const sanitizedEditorialHeadline = sanitizeTitleCandidate(editorial.headline);
  const contextualTitle = composeContextualTitle(
    input.template.title,
    sanitizedEditorialHeadline,
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
  //
  // Non-Latin all-ASCII override: when the English brief falls through
  // for ar/he/ja/ko/zh the raw description is long English prose that
  // clears the 100-char trigger but reads as a pure-ASCII snippet on
  // the SERP — the SEO regression suite (Gate 4b) (correctly) rejects
  // those as locale leaks. Force enrichment in that case so the
  // composer splices localized `Date:` / `Context:` / `reader` labels
  // into the snippet and the script-content match below clamps it to
  // the per-script SEO budget.
  const description = shouldEnrichDescription(normalizedRawDescription, input.lang)
    ? composeContextualDescription(
        input.lang,
        normalizedRawDescription,
        safeEditorial,
        input.date,
        input.runId
      )
    : normalizedRawDescription;

  const clippedTitle = truncateTitle(title).trim();
  // Manifest-derived explicit titles are intentional operator overrides —
  // respect them even for non-Latin locales (the operator chose them).
  const explicitTitle =
    manifestTitle && !hasLeakySeoToken(manifestTitle) ? truncateTitle(manifestTitle).trim() : '';
  const allowShortResolvedTitle = perLanguage.source === LOCALIZED_BRIEF_SOURCE;
  // Gate 4a defense-in-depth: reject resolved title candidates for
  // non-Latin locales when they lack locale-script glyphs — prevents
  // English editorial H1s from leaking into CJK/RTL pages.
  const nonLatinFamily = classifyScript(input.lang) !== 'latin';
  const resolvedTitleCandidate =
    clippedTitle &&
    !hasLeakySeoToken(clippedTitle) &&
    !(nonLatinFamily && !contentMatchesLocaleScript(clippedTitle, input.lang)) &&
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
  const truncatedTitle = pickResolvedTitle(input, {
    explicitTitle,
    resolvedTitleCandidate,
    summaryDerivedTitle,
    contextualFallback,
  });
  // Per-script SEO title clamp + ellipsis scrub + run-number disambiguation.
  // See `clampForBudget` (seo-budgets.ts), `scrubTrailingEllipsis`
  // (resolve-helpers.ts), and `appendRunNumberSuffix` (above) for the
  // rationale on each transform.
  const seoTitleClamped = clampForBudget(truncatedTitle, input.lang, 'title');
  let seoTitle = scrubTrailingEllipsis(seoTitleClamped);
  seoTitle = appendRunNumberSuffix(seoTitle, input.lang, input.runId ?? '');
  // Cross-run uniqueness: append compact edition qualifier (#N) post-clamping
  // Budget-aware: only append when it fits within the per-script title budget
  seoTitle = appendEditionQualifier(seoTitle, input.runId ?? '', budgetFor(input.lang, 'title'));
  // Final SERP-floor recovery on the resolved title (see `padTitleToFloor`
  // in resolve-helpers.ts for the (EP) suffix rationale).
  seoTitle = padTitleToFloor(seoTitle, input.lang, budgetFor(input.lang, 'title'));
  // Script-aware description clamp + floor recovery.
  //
  // Latin locales always clamp to `metaDescription` (155) so their copy
  // lands inside the 110-155 SERP-fill band — without this Latin briefs
  // sat at 156-180 chars and only ~30 % of samples were in band, well
  // below the 40 % floor enforced by the SEO regression suite.
  //
  // CJK / RTL locales tighten to 78 / 150 only when the resolved
  // description carries locale-script glyphs (translated content or
  // enrichment-injected labels). English-content fallbacks keep the
  // universal 180-char cap so the article-metadata.test.js ≥100/≥120
  // reader-floor assertions still hold for synthetic English manifests
  // routed to non-Latin locales.
  //
  // `ensureDescriptionTerminator` runs **after** the clamp with the same
  // budget so the script-appropriate sentence terminator (`.` / `。`) is
  // never knocked off by the second clamp in the HTML shell — see the
  // regression note inside `ensureDescriptionTerminator` for the live
  // 2026-05-26 breaking-fr.html failure that motivated the budget
  // hand-off.
  // Script-match check determines which description budget to apply.
  //
  // Three scenarios for non-Latin locales:
  //
  // 1. Source content has locale-script glyphs (real translated brief)
  //    → tight budget (55-78 CJK / 115-150 RTL) so it lands in SERP band.
  //
  // 2. Source is English AND enrichment fired because it's pure-ASCII for
  //    a non-Latin locale (the `ASCII_ONLY_RE` gate in
  //    `shouldEnrichDescription`). The enriched output now carries locale
  //    labels → tight budget so the SERP-fill band assertion holds.
  //
  // 3. Source is short English (< ENRICHMENT_TRIGGER_LENGTH) and enrichment
  //    padded it UP with locale labels. In this case the universal 180-char
  //    cap preserves the article-metadata.test.js ≥100/≥120 reader-floor
  //    for synthetic English manifests routed to non-Latin locales.
  //
  // Latin locales: always use the tight budget (155) since their content
  // is Latin by definition.
  const sourceMatchesLocale = contentMatchesLocaleScript(normalizedRawDescription, input.lang);
  const family = classifyScript(input.lang);
  const asciiOnlyEnrichment =
    family !== 'latin' &&
    normalizedRawDescription.length >= ENRICHMENT_TRIGGER_LENGTH &&
    ASCII_ONLY_RE.test(normalizedRawDescription);
  const useTightBudget = sourceMatchesLocale || family === 'latin' || asciiOnlyEnrichment;
  const clampedDescription = useTightBudget
    ? clampForBudget(description, input.lang, 'metaDescription')
    : truncateDescription(description);
  // Only hand the per-script budget to `ensureDescriptionTerminator` when
  // the tight budget was used — for English-content fallbacks in non-Latin
  // locales the clamp is the universal 180-char cap (preserves the
  // article-metadata.test.js ≥100/≥120 reader floor) and budget reservation
  // must use that ceiling, not the 78/150 tight budget, or the terminator
  // step would over-trim the description.
  const terminatorBudget = useTightBudget ? budgetFor(input.lang, 'metaDescription') : undefined;
  const truncatedDescription = padDescriptionToFloor(
    ensureDescriptionTerminator(input.lang, clampedDescription, terminatorBudget),
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
