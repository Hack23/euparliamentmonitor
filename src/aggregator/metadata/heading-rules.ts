// SPDX-FileCopyrightText: 2024-2026 Hack23 AB
// SPDX-License-Identifier: Apache-2.0

/**
 * @module Aggregator/Metadata/HeadingRules
 * @description Heading-classification helpers extracted from
 * `article-metadata.ts`. Owns the editorial-lede whitelist, the artefact
 * category prefix list, the institutional-noun whitelist, and the
 * `isGenericHeading` / `stripArtifactCategoryAffix` predicates that
 * drive title-tier selection in the resolver.
 *
 * Pure leaf module — the only runtime dependencies are
 * {@link stripInlineMarkdown} (text-utils) and {@link humanizeSlug}
 * (slug). Re-exported through `article-metadata.ts` for back-compat
 * with existing call sites.
 */

import { stripInlineMarkdown } from './text-utils.js';
import { humanizeSlug } from './slug.js';

/**
 * Headings inside an editorial artefact that carry the journalist's lede
 * paragraph (a one-paragraph summary of "what happened, why it matters").
 * When the resolver sees one of these as a `## …` heading inside the
 * editorial artefact, it prefers the first prose paragraph that follows
 * it as the description (and as a title fallback) over a generic line
 * walk. Names are matched case-insensitively against the heading text
 * (after stripping inline Markdown).
 */
export const EDITORIAL_LEDE_HEADINGS: readonly string[] = [
  '60-second read',
  '60 second read',
  'sixty-second read',
  'lede',
  'lead',
  'tl;dr',
  'tldr',
  'synopsis',
  'in brief',
  'at a glance',
  'bottom line',
  'bluf',
  'bluf — bottom line up front',
  'bottom line up front',
  'executive summary',
  'executive briefing',
  'master narrative',
  'overview',
  'headline judgement',
  'headline judgment',
  'key findings',
  'key judgements',
  'key judgments',
  'situation summary',
  'situation report',
  'situation update',
  // ── Editorial-brief specific headings introduced in the May-2026
  //    executive-brief style guide. These sections carry the most
  //    publishable journalism in the brief and are the user-visible
  //    source of the title / description after this refactor.
  'reader briefing',
  'strategic intelligence summary',
  'strategic assessment',
  'top-line summary',
  'top line summary',
  'headline intelligence',
  'key intelligence judgment',
  'key intelligence judgement',
  'key intelligence judgments',
  'key intelligence judgements',
  'key intelligence judgements summary',
  'key intelligence judgments summary',
  'intelligence assessment',
  'intelligence assessment summary',
  'priority intelligence items',
  'lead intelligence assessment',
  // ── May-2026 executive-brief "FOR IMMEDIATE ACTION" pattern. Every
  //    14-language brief in `analysis/daily/**/propositions/` opens
  //    the post-banner body with this H2 (translated per locale), and
  //    its first row is the BLUF (`**Issue:** …` / `**Fråga:** …` /
  //    `**主題:** …` / `**الموضوع:** …` …). The English header is
  //    whitelisted here so the extractor catches it directly; the 13
  //    translated equivalents fall through to the generic strong-prose
  //    walker, which now strips the localized bold label via
  //    {@link stripLeadingBoldLabel} so the same BLUF copy lands in
  //    `<meta description>` regardless of locale.
  'for immediate action',
];

/**
 * Artifact-category prefixes that appear inside editorial-artefact H1s as
 * a structural label rather than an editorial headline (e.g. `# Synthesis
 * Summary — Week in Review (3 Apr – 1 May 2026)`). When a candidate H1
 * starts with one of these prefixes followed by a separator (em/en dash,
 * hyphen, or colon), the resolver treats it as **generic** so it does
 * not leak into the article `<title>`. Compared lower-case, with leading
 * punctuation stripped.
 */
export const ARTIFACT_CATEGORY_PREFIXES: readonly string[] = [
  'actor mapping',
  'analytical quality',
  'breaking news analysis',
  'coalition dynamics',
  'commission wp alignment',
  'committee activity report',
  'cross run continuity',
  'data availability assessment',
  'deep analysis',
  'economic context',
  'executive brief',
  'executive briefing',
  'executive intelligence brief',
  'executive intelligence briefing',
  'executive summary',
  'forward indicators',
  'historical baseline',
  'impact matrix',
  'intelligence assessment',
  'intelligence briefing',
  'intelligence synthesis summary',
  'legislative output analysis',
  'legislative pipeline analysis',
  'legislative pipeline forecast',
  'mandate fulfilment scorecard',
  'master intelligence synthesis',
  'mcp reliability audit',
  'methodology reflection',
  'monthly outlook',
  'motions analysis',
  'parliamentary calendar projection',
  'pestle analysis',
  'political intelligence brief',
  'political risk',
  'political threat landscape',
  'presidency trio context',
  'propositions analysis',
  'quantitative swot',
  'risk assessment',
  'risk matrix',
  'risk scoring',
  'scenario forecast',
  'seat projection',
  'significance classification',
  'situation report',
  'situation summary',
  'stakeholder analysis',
  'stakeholder impact',
  'stakeholder map',
  'swot analysis',
  'synthesis summary',
  'threat assessment',
  'threat model',
  'voting patterns',
  'weekly outlook',
  'wildcards blackswans',
];

/**
 * Normalise a Markdown heading's text for comparison against the
 * editorial-lede heading whitelist. Strips inline Markdown decorations
 * (`*`, `_`, `` ` ``, `#`), then strips any leading non-alphanumeric
 * characters (emoji, punctuation, spaces) so a heading like
 * `🎯 Headline Judgement` compares equal to `headline judgement`.
 *
 * @param raw - Raw heading text (no leading hashes)
 * @returns Lower-cased, decoration-stripped heading text
 */
export function normaliseHeadingText(raw: string): string {
  return stripInlineMarkdown(raw)
    .replace(/[*_`#]+/g, '')
    .replace(/^[^A-Za-z0-9]+/, '')
    .trim()
    .toLowerCase();
}

/**
 * Word-boundary match against an editorial-lede whitelist entry. Matches
 * when the normalised heading equals the whitelist entry exactly, or when
 * the entry is followed by any non-alphanumeric character — covering
 * localized parenthetical glosses written with ASCII or full-width
 * punctuation (e.g. `bluf (bottom line up front)`, `bluf（結論先出し）`,
 * `bluf — 핵심 결론`, `60-second read — what happened`).
 *
 * @param headingText - Normalised heading text (lower-case, decoration-stripped)
 * @param whitelistEntry - Lower-case whitelist entry from
 *                        {@link EDITORIAL_LEDE_HEADINGS}
 * @returns `true` when `headingText` begins with `whitelistEntry` at a
 *          word boundary
 */
export function isLedeHeadingMatch(headingText: string, whitelistEntry: string): boolean {
  if (headingText === whitelistEntry) return true;
  if (!headingText.startsWith(whitelistEntry)) return false;
  const next = headingText.charAt(whitelistEntry.length);
  // Word boundary — anything that is not an ASCII letter/digit is a
  // separator we accept. This works uniformly across ASCII parentheses,
  // CJK full-width brackets `（`, dashes `— – -`, colons `:`, and the
  // ideographic full-width colon `：`.
  return next === '' || !/[a-z0-9]/.test(next);
}

/**
 * Return `true` when an artefact-H1 begins with one of the
 * `ARTIFACT_CATEGORY_PREFIXES` followed by a separator. Such H1s
 * carry the artefact's structural label rather than a journalist's
 * headline (e.g. `# Synthesis Summary — Week in Review (3 Apr – 1 May
 * 2026)`) and must not leak into the article `<title>`.
 *
 * @param heading - Plain-text H1 (after `stripInlineMarkdown`)
 * @returns `true` when the heading is an artefact-category label
 */
export function isArtifactCategoryHeading(heading: string): boolean {
  const normalized = normaliseCategoryHeading(heading);
  if (normalized === '') return false;
  for (const prefix of ARTIFACT_CATEGORY_PREFIXES) {
    if (normalized === prefix) return true;
    if (
      normalized.startsWith(`${prefix} —`) ||
      normalized.startsWith(`${prefix} –`) ||
      normalized.startsWith(`${prefix} -`) ||
      normalized.startsWith(`${prefix}:`)
    ) {
      return true;
    }
    if (
      normalized.endsWith(` — ${prefix}`) ||
      normalized.endsWith(` – ${prefix}`) ||
      normalized.endsWith(` - ${prefix}`) ||
      normalized.endsWith(`: ${prefix}`)
    ) {
      return true;
    }
  }
  return false;
}

/**
 * Strip a leading or trailing artifact-category label from a heading and
 * return the editorial-topic core. When neither end carries a category
 * label, the heading is returned unchanged. When the category label is
 * the **entire** heading (e.g. `# Executive Brief`) the result is the
 * empty string.
 *
 * Examples:
 * - `Executive Brief — EU Parliament Motions` → `EU Parliament Motions`
 * - `EU Parliament Propositions — Executive Brief` → `EU Parliament Propositions`
 * - `EP10 Term Outlook — Executive Brief` → `EP10 Term Outlook`
 * - `Key Legislative Developments — Deep Analysis (2026-05-08)` → `Key Legislative Developments`
 * - `Synthesis Summary — EP Motions & Adopted Texts` → `EP Motions & Adopted Texts`
 *
 * Trailing parenthesised metadata (`(2026-05-08)`, `(May 2026)`) is also
 * stripped because it functions as a date stamp rather than editorial
 * copy. The returned core is trimmed of whitespace and trailing
 * punctuation.
 *
 * @param heading - Raw heading text (post-{@link stripInlineMarkdown})
 * @returns Editorial-topic core, or empty string when only the category survived
 */
export function stripArtifactCategoryAffix(heading: string): string {
  const trimmed = heading.trim();
  if (trimmed === '') return '';
  const sortedPrefixes = [...ARTIFACT_CATEGORY_PREFIXES].sort((a, b) => b.length - a.length);
  const normalized = normaliseCategoryHeading(trimmed);
  const skip = trimmed.length - normalized.length;
  const visible = trimmed.slice(skip < 0 ? 0 : skip);
  const visibleClean = visible.replace(/\s*\([^)]{1,80}\)\s*$/u, '').trim();
  const normalizedClean = normaliseCategoryHeading(visibleClean);

  for (const prefix of sortedPrefixes) {
    for (const sep of [' — ', ' – ', ' - ', ': ']) {
      const candidate = `${prefix}${sep}`;
      if (normalizedClean.startsWith(candidate)) {
        const core = visibleClean.slice(candidate.length).trim();
        return cleanupAffixCore(core);
      }
    }
    for (const sep of [' — ', ' – ', ' - ', ': ']) {
      const candidate = `${sep}${prefix}`;
      if (normalizedClean.endsWith(candidate)) {
        const core = visibleClean.slice(0, visibleClean.length - candidate.length).trim();
        return cleanupAffixCore(core);
      }
    }
    if (normalizedClean === prefix) return '';
  }
  return trimmed;
}

/**
 * Tidy the editorial-topic core returned by
 * {@link stripArtifactCategoryAffix}: drop trailing parenthesised
 * metadata (`(2026-05-08)`, `(May 2026)`) and trailing punctuation. When
 * stripping leaves the string too short to be meaningful (<5 chars),
 * return the empty string so callers fall through to lower tiers.
 *
 * @param core - Heading with the category label already stripped
 * @returns Cleaned editorial-topic core, or empty string when too short
 */
function cleanupAffixCore(core: string): string {
  const withoutTrailingParens = core.replace(/\s*\([^)]{1,80}\)\s*$/u, '').trim();
  const withoutTrailingPunct = withoutTrailingParens.replace(/[—–:;,.\s-]+$/u, '').trim();
  if (withoutTrailingPunct.length < 5) return '';
  return withoutTrailingPunct;
}

/**
 * Lower-case, decoration-stripped form used by the artifact-category
 * matchers. Strips inline Markdown, leading non-alphanumeric runs (emoji,
 * decoration), and collapses whitespace to a single space.
 *
 * @param raw - Raw heading text
 * @returns Lower-case normalised form
 */
function normaliseCategoryHeading(raw: string): string {
  return stripInlineMarkdown(raw)
    .trim()
    .toLowerCase()
    .replace(/^[^a-z0-9]+/, '')
    .replace(/\s+/g, ' ');
}

/**
 * Return `true` when the supplied heading matches the generic
 * `${humanize(articleType)} — ${date}` form that the aggregator writes as
 * its default document title. Accepts em-dash, en-dash, and ASCII hyphen
 * separators, and matches the `breaking-breaking` variant that some
 * same-day collision runs produce.
 *
 * @param heading - Plain-text heading (post-{@link stripInlineMarkdown})
 * @param articleType - Article type slug
 * @param date - ISO date string
 * @returns `true` when the heading carries no editorial information
 */
export function isGenericHeading(heading: string, articleType: string, date: string): boolean {
  const normalized = heading.trim().replace(/\s+/g, ' ');
  if (normalized === '') return true;

  if (isArtifactCategoryHeading(normalized)) return true;

  // Article-type aliases that author-templates use interchangeably with
  // the humanized slug. `breaking` runs in particular alternate between
  // `Breaking` and `Breaking News` in brief H1s. The aliases are matched
  // alongside the canonical `humanizeSlug(articleType)` value so the
  // downstream pattern + trailing-date regex pick them all up. Keep
  // the list tight — only attest real, observed brief-H1 wordings, not
  // every plausible synonym.
  const ARTICLE_TYPE_ALIASES: Record<string, readonly string[]> = {
    breaking: ['Breaking News'],
  };
  const human = humanizeSlug(articleType);
  const aliases = [human, ...(ARTICLE_TYPE_ALIASES[articleType] ?? [])];

  // Separators observed in the wild for brief H1s mixing the article-type
  // label with a single ISO or human-friendly date. The pipe character
  // (`|`) and ASCII comma (`,`) were missing from earlier passes, leaving
  // bare-stub titles like `Breaking | 2026-03-27` (21 chars) and
  // `Motions, 8 April 2026` (22 chars) flagged as too short by the SEO
  // dump.
  const SEPARATORS = [' — ', ' - ', ' – ', ': ', ' ', ' | ', ', '];
  // Date-shape character class: digits, dashes (ISO) plus letters and
  // single spaces (human-friendly forms like `8 April 2026`). Single-day
  // only — date *ranges* (`19–22 May 2026`, `22-23 May 2026`) are
  // preserved as editorial scope-window content, matching the
  // {@link isCategoryNounHeading} contract.
  const DATE_SHAPE = '[\\d][\\d\\-]*|\\d{1,2}\\s+[A-Za-z]+\\s+\\d{4}';

  for (const label of aliases) {
    for (const sep of SEPARATORS) {
      const p = `${label}${sep}${date}`;
      if (normalized === p) return true;
      if (normalized === `EU Parliament ${p}`) return true;
      if (normalized === `EP ${p}`) return true;
    }
    const labelRedundant = `${label} ${label}`;
    if (normalized === `${labelRedundant} — ${date}`) return true;

    // Trailing-date-only: `<Label><sep><any date>` — covers ISO dates,
    // human dates, and single-day ranges like `22-23 May 2026`. Anchored
    // to end of string so it cannot fire on editorial sentences that
    // happen to contain a date token mid-clause.
    const trailingDateOnly = new RegExp(
      `^(?:EU Parliament |EP )?${escapeRegex(label)}\\s*[—–\\-|,:]\\s*(?:${DATE_SHAPE})$`,
      'u'
    );
    if (trailingDateOnly.test(normalized)) return true;

    // Same shape but with the label followed directly by a date with no
    // explicit separator other than whitespace (e.g.
    // `Breaking News 2026-04-01`). Anchored, same end-of-string guard.
    const labelSpaceDate = new RegExp(
      `^(?:EU Parliament |EP )?${escapeRegex(label)}\\s+(?:${DATE_SHAPE})$`,
      'u'
    );
    if (labelSpaceDate.test(normalized)) return true;
  }

  if (isCategoryNounHeading(normalized, articleType)) return true;

  if (isBareInstitutionalHeading(normalized)) return true;

  return false;
}

/**
 * Lower-cased institutional self-references that an executive-brief
 * authoring template sometimes emits as the H1 when the agent forgot to
 * substitute a real headline. They identify the publisher / institution
 * but carry **zero editorial information** — they would produce
 * pathological `<title>EU Parliament</title>` strings if surfaced.
 * Matched after whitespace collapse + lowercase, with any trailing
 * punctuation / single-date qualifier stripped so `EU Parliament ·
 * 2026-05-15` and `Hack23 AB —` both resolve here. Date *ranges*
 * (`(May 2026)`, `: 19–22 May 2026`) are preserved as editorial
 * content, matching the {@link isCategoryNounHeading} contract.
 */
const BARE_INSTITUTIONAL_HEADINGS: readonly string[] = [
  'eu parliament',
  'european parliament',
  'the european parliament',
  'ep',
  'ep10',
  'ep11',
  'hack23',
  'hack23 ab',
  'eu parliament monitor',
  'european parliament monitor',
  'executive brief',
  'briefing',
  'intelligence brief',
  'intelligence briefing',
];

/**
 * Return `true` when the heading is one of {@link BARE_INSTITUTIONAL_HEADINGS}
 * — an institutional self-reference with no editorial content. Strips a
 * trailing single-date qualifier first so `EU Parliament — 2026-05-15`
 * and `Hack23 AB · 2026-05-15` are caught. Date ranges and any token
 * after the institutional noun are preserved (so
 * `EU Parliament Week Ahead: 19–22 May 2026` is *not* flagged here —
 * that path is owned by {@link isCategoryNounHeading} for `week-ahead`).
 *
 * @param normalized - Heading text after whitespace collapse
 * @returns `true` when the heading is bare institutional boilerplate
 */
function isBareInstitutionalHeading(normalized: string): boolean {
  let core = normalized.toLowerCase();
  // Same single-date / parenthetical stripping as isCategoryNounHeading
  // so the same heading shape is recognized via either gate.
  core = core.replace(/\s*[·:—–-]\s*\d{4}-\d{2}-\d{2}\s*$/u, '');
  core = core.replace(/\s*\(\s*[a-z]{3,9}\s+\d{4}\s*\)\s*$/u, '');
  core = core.replace(/\s*\(\s*\d{4}\s*\)\s*$/u, '');
  core = core.replace(/[\s\-—–:·.]+$/u, '').trim();
  return BARE_INSTITUTIONAL_HEADINGS.includes(core);
}

/**
 * Curated category-noun whitelist per article-type slug. These are the
 * boring "EU Parliament &lt;Type&gt;" / "EP10 &lt;Type&gt;" headings that the
 * executive-brief authoring conventions allow as decorative H1s but
 * which carry **no editorial information** — they merely restate the
 * article category. When such a heading reaches the metadata resolver
 * it must be flagged generic so the resolver falls through to the
 * BLUF / lede summary instead of using the category noun as `<title>`.
 *
 * Keys are slugs (`article-type` form). Values are lowercase category
 * cores, matched after stripping institutional prefixes
 * (`eu parliament `, `european parliament `, `ep `, `ep10 `, `ep11 `)
 * and trailing date qualifiers (`· 2026-05-15`, `— 2026-05-15`,
 * `(May 2026)`, `: 19–22 May 2026` is **kept** because date ranges
 * carry editorial info — only single-date suffixes are stripped).
 */
const CATEGORY_NOUN_CORES: Readonly<Record<string, readonly string[]>> = {
  breaking: ['breaking', 'breaking news'],
  'week-in-review': ['week in review'],
  'week-ahead': ['week ahead'],
  'month-in-review': ['month in review'],
  'month-ahead': ['month ahead'],
  'quarter-in-review': ['quarter in review'],
  'quarter-ahead': ['quarter ahead'],
  'year-in-review': ['year in review'],
  'year-ahead': ['year ahead'],
  'committee-reports': [
    'committee reports',
    'committee activity',
    'committee activity report',
    'committee activity reports',
  ],
  motions: [
    'motions',
    'motions and adopted texts',
    'plenary votes and resolutions',
    'plenary votes resolutions',
  ],
  propositions: ['propositions', 'legislative propositions', 'legislative procedures'],
  'election-cycle': ['election cycle'],
  'term-outlook': ['term outlook'],
};

/**
 * Return `true` when the heading is a bare category-noun string for the
 * supplied `articleType` slug, regardless of the institutional prefix
 * (`EU Parliament `, `European Parliament `, `EP `, `EP10 `, `EP11 `).
 * Strips a trailing single-date qualifier (` · YYYY-MM-DD`,
 * ` — YYYY-MM-DD`, `(May 2026)`, `(2026)`) before matching; date-range
 * qualifiers (`: 19–22 May 2026`) carry editorial information and are
 * NOT stripped, so headings like `EP Week Ahead: 19–22 May 2026` are
 * preserved as legitimate editorial headlines.
 *
 * @param normalized - Heading text after whitespace collapse
 * @param articleType - Article-type slug
 * @returns `true` when the heading is category-noun boilerplate
 */
function isCategoryNounHeading(normalized: string, articleType: string): boolean {
  const cores = CATEGORY_NOUN_CORES[articleType];
  if (!cores || cores.length === 0) return false;

  let core = normalized.toLowerCase();

  // Strip institutional prefix (longest-first match).
  const prefixes = [
    "the european parliament's ",
    'european parliament ',
    'eu parliament ',
    'ep11 ',
    'ep10 ',
    'ep ',
  ];
  for (const p of prefixes) {
    if (core.startsWith(p)) {
      core = core.slice(p.length);
      break;
    }
  }

  // Strip trailing single-date qualifier. We deliberately do NOT strip
  // date *ranges* (`19–22 may 2026`, `28-30 april 2026`) because those
  // identify a specific reporting window — that IS editorial content.
  // Patterns stripped:
  //   ` · 2026-05-15`, ` — 2026-05-15`, ` - 2026-05-15`, `: 2026-05-15`
  //   ` (may 2026)`, ` (2026)`
  core = core.replace(/\s*[·:—–-]\s*\d{4}-\d{2}-\d{2}\s*$/u, '');
  core = core.replace(/\s*\(\s*[a-z]{3,9}\s+\d{4}\s*\)\s*$/u, '');
  core = core.replace(/\s*\(\s*\d{4}\s*\)\s*$/u, '');
  // Trailing punctuation residue.
  core = core.replace(/[\s\-—–:·]+$/u, '').trim();

  return cores.includes(core);
}

/**
 * Escape regex metacharacters so a dynamic string can be embedded safely
 * in a pattern built at runtime.
 *
 * @param input - Raw string
 * @returns Regex-safe form of {@link input}
 */
function escapeRegex(input: string): string {
  return input.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}
