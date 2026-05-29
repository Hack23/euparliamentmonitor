// SPDX-FileCopyrightText: 2024-2026 Hack23 AB
// SPDX-License-Identifier: Apache-2.0
import { budgetFor, classifyScript, clampForBudget } from './seo-budgets.js';
import { composeContextualDescription, composeContextualExtendedDescription, composeContextualTitle, deriveHeadlineFromSummary, ensureDescriptionTerminator, hasLeakySeoToken, isUsableResolvedTitle, manifestOverrideFor, padDescriptionToFloor, padTitleToFloor, pickFirstNonEmpty, sanitizeDescriptionCandidate, sanitizeTitleCandidate, scrubTrailingEllipsis, } from './resolve-helpers.js';
import { ASCII_ONLY_RE, appendRunNumberSuffix, composeNonLatinDistinctiveTitle, contentMatchesLocaleScript, pickResolvedTitle, pickResolvedTitleCandidate, shouldEnrichDescription, } from './resolve-script-utils.js';
import { buildSeoKeywords } from './seo-keywords.js';
import { synthesizeFallbackDescription, synthesizeFallbackTitle } from './fallback-synth.js';
import { ENRICHMENT_TRIGGER_LENGTH, truncateDescription, truncateExtendedDescription, truncateTitle, } from './text-utils.js';
// `appendRunNumberSuffix` is re-exported for the dedicated unit test
// (`test/unit/per-language-resolver-suffix.test.js`) that imports it from
// this module's compiled output.
export { appendRunNumberSuffix } from './resolve-script-utils.js';
const LOCALIZED_BRIEF_SOURCE = 'localized-brief';
const ENGLISH_BRIEF_SOURCE = 'english-brief';
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
export function resolvePerLanguageEditorial(input) {
    if (input.lang !== 'en' && input.runDir && input.resolveLocalizedBrief) {
        const localized = input.resolveLocalizedBrief(input.runDir, input.lang, input.articleType, input.date);
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
 * Resolve `{title, description, keywords, source}` for one language.
 *
 * @param input - Per-language inputs
 * @returns One resolved metadata entry
 */
export function resolveOneLanguage(input) {
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
    const fallbackTitleAllowed = perLanguage.source === ENGLISH_BRIEF_SOURCE && classifyScript(input.lang) === 'latin';
    const englishFallbackTitle = fallbackTitleAllowed
        ? manifestOverrideFor(input.manifest.title, 'en')
        : '';
    const englishFallbackDescription = perLanguage.source === ENGLISH_BRIEF_SOURCE
        ? manifestOverrideFor(input.manifest.description, 'en')
        : '';
    // Token-level sanitization rescues editorial H1s such as
    // `Run 180, 17 April 2026` → `17 April 2026` instead of falling
    // through to a duplicate template title.
    const sanitizedEditorialHeadline = sanitizeTitleCandidate(editorial.headline);
    const contextualTitle = composeContextualTitle(input.template.title, sanitizedEditorialHeadline, input.runId, input.date, input.lang);
    const title = pickFirstNonEmpty([
        manifestTitle,
        englishFallbackTitle,
        contextualTitle,
        input.template.title,
    ]);
    const rawDescription = sanitizeDescriptionCandidate(pickFirstNonEmpty([
        manifestDescription,
        englishFallbackDescription,
        editorial.summary,
        input.template.subtitle,
    ]));
    const safeEditorial = {
        headline: isUsableResolvedTitle(editorial.headline) ? editorial.headline.trim() : '',
        summary: sanitizeDescriptionCandidate(editorial.summary),
        extendedSummary: sanitizeDescriptionCandidate(editorial.extendedSummary),
    };
    const normalizedRawDescription = rawDescription || sanitizeDescriptionCandidate(input.template.subtitle);
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
        ? composeContextualDescription(input.lang, normalizedRawDescription, safeEditorial, input.date, input.runId)
        : normalizedRawDescription;
    const clippedTitle = truncateTitle(title).trim();
    // Manifest-derived explicit titles are intentional operator overrides —
    // respect them even for non-Latin locales (the operator chose them).
    const explicitTitle = manifestTitle && !hasLeakySeoToken(manifestTitle) ? truncateTitle(manifestTitle).trim() : '';
    const allowShortResolvedTitle = perLanguage.source === LOCALIZED_BRIEF_SOURCE;
    // Gate 4a defense-in-depth: reject resolved title candidates for
    // non-Latin locales when they lack locale-script glyphs — prevents
    // English editorial H1s from leaking into CJK/RTL pages.
    const nonLatinFamily = classifyScript(input.lang) !== 'latin';
    // Track whether the editorial headline was contaminated (had leaky
    // run tokens that sanitizeTitleCandidate refused to salvage). When
    // contaminated, the resolvedTitleCandidate path is skipped so the
    // summary-derived title wins in pickResolvedTitle — matching the
    // pre-existing semantics where a leaky H1 forced summary fallback.
    const headlineWasContaminated = !!editorial.headline && !sanitizedEditorialHeadline;
    const resolvedTitleCandidate = pickResolvedTitleCandidate({
        clippedTitle,
        headlineWasContaminated,
        nonLatinFamily,
        allowShortResolvedTitle,
        lang: input.lang,
    });
    const summaryDerivedTitle = deriveHeadlineFromSummary(safeEditorial.summary || normalizedRawDescription);
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
    // {@link composeContextualTitle} (with an empty editorial headline) so it
    // appends an ISO date suffix (plus an `(EP)` SERP-floor pad when needed)
    // for cross-date uniqueness. It never appends a run-number or "Edition N"
    // disambiguator: `scripts/validate-article-seo.js` forbids run-number /
    // edition tokens in reader-facing titles. Two same-date / same-articleType
    // runs (republish, hot-fix re-run) are expected to differ through
    // editorial / content-based differentiation (distinct headlines derived
    // from the day's findings), not through a synthetic title suffix.
    const contextualFallback = composeContextualTitle(input.template.title, '', input.runId, input.date, input.lang);
    let truncatedTitle = pickResolvedTitle(input.lang, {
        explicitTitle,
        resolvedTitleCandidate,
        summaryDerivedTitle,
        contextualFallback,
    });
    // Content-based differentiator for non-Latin English-brief fallback.
    // When the picked title is the date-suffixed template fallback (no
    // manifest override, no usable resolved/summary candidate) two same-date
    // re-runs collide on an identical localized `<title>`. Run-number /
    // edition qualifiers are forbidden, so splice the run's own distinctive
    // English topic into the localized template label (Gate 4a-safe mixed
    // script). Falls back silently to the date-suffixed title when no clean,
    // budget-fitting fragment can be derived. See
    // {@link composeNonLatinDistinctiveTitle}.
    const usedContextualFallback = truncatedTitle === truncateTitle(contextualFallback) ||
        truncatedTitle === contextualFallback;
    if (nonLatinFamily &&
        perLanguage.source === ENGLISH_BRIEF_SOURCE &&
        !explicitTitle &&
        usedContextualFallback) {
        const distinctiveTitle = composeNonLatinDistinctiveTitle({
            lang: input.lang,
            templateTitle: input.template.title,
            englishCandidates: [
                input.englishEditorial.headline,
                input.englishEditorial.summary,
                input.englishEditorial.extendedSummary,
            ],
        });
        if (distinctiveTitle)
            truncatedTitle = distinctiveTitle;
    }
    if (hasLeakySeoToken(truncatedTitle)) {
        truncatedTitle = synthesizeFallbackTitle(input, safeEditorial.summary || normalizedRawDescription, contextualFallback);
    }
    // Per-script SEO title clamp + ellipsis scrub + run-number disambiguation.
    // See `clampForBudget` (seo-budgets.ts), `scrubTrailingEllipsis`
    // (resolve-helpers.ts), and `appendRunNumberSuffix` (above) for the
    // rationale on each transform.
    const seoTitleClamped = clampForBudget(truncatedTitle, input.lang, 'title');
    let seoTitle = scrubTrailingEllipsis(seoTitleClamped);
    seoTitle = appendRunNumberSuffix(seoTitle, input.lang, input.runId ?? '');
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
    const asciiOnlyEnrichment = family !== 'latin' &&
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
    let truncatedDescription = padDescriptionToFloor(ensureDescriptionTerminator(input.lang, clampedDescription, terminatorBudget), input.lang);
    if (hasLeakySeoToken(truncatedDescription)) {
        truncatedDescription = synthesizeFallbackDescription(input);
    }
    const extendedSource = sanitizeDescriptionCandidate(manifestDescription || safeEditorial.extendedSummary || normalizedRawDescription);
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
        truncatedExtendedDescription = composeContextualExtendedDescription(input.lang, extendedSource || normalizedRawDescription, safeEditorial, input.date);
    }
    const source = manifestTitle || manifestDescription ? 'manifest' : perLanguage.source;
    return {
        title: seoTitle,
        description: truncatedDescription,
        extendedDescription: truncatedExtendedDescription,
        keywords: buildSeoKeywords(input.lang, input.articleType, input.date, input.runId, seoTitle, truncatedDescription),
        source,
    };
}
//# sourceMappingURL=per-language-resolver.js.map