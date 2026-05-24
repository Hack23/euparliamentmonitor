// SPDX-FileCopyrightText: 2024-2026 Hack23 AB
// SPDX-License-Identifier: Apache-2.0

/**
 * @module Aggregator/Metadata/HeadingRules
 * @description Heading-classification helpers used by the article
 * metadata resolver. Owns:
 *
 *   - {@link isGenericHeading} — the resolver's master generic-heading
 *     predicate (drives title-tier selection).
 *   - Internal helpers for institutional-noun, category-noun, and
 *     `<label><sep><date>` boilerplate detection.
 *
 * The editorial-lede whitelist, artifact-category prefix list, and the
 * {@link isArtifactCategoryHeading} / {@link stripArtifactCategoryAffix}
 * helpers were extracted to `./artifact-category-heading.ts` in May 2026
 * to keep this file under the 600-raw-line drift-guard. They are
 * **re-exported here** so existing call sites (`lede-extractor.ts`,
 * `artifact-walker.ts`, `article-metadata.ts`) keep working unchanged.
 *
 * Pure leaf module. The only runtime dependencies are
 * {@link humanizeSlug} (slug) and the helpers re-exported from
 * `./artifact-category-heading.js`.
 */

import { humanizeSlug } from './slug.js';
import {
  isArtifactCategoryHeading,
} from './artifact-category-heading.js';

// Re-export the artifact-category surface so existing imports continue
// to work without touching consumers.
export {
  EDITORIAL_LEDE_HEADINGS,
  ARTIFACT_CATEGORY_PREFIXES,
  normaliseHeadingText,
  isLedeHeadingMatch,
  isArtifactCategoryHeading,
  stripArtifactCategoryAffix,
} from './artifact-category-heading.js';

/**
 * Article-type aliases that author-templates use interchangeably with
 * the humanized slug. `breaking` runs in particular alternate between
 * `Breaking` and `Breaking News` in brief H1s. The aliases are matched
 * alongside the canonical `humanizeSlug(articleType)` value so the
 * downstream pattern + trailing-date regex pick them all up.
 */
const ARTICLE_TYPE_ALIASES: Record<string, readonly string[]> = {
  breaking: ['Breaking News'],
};

/**
 * Separators observed in the wild for brief H1s mixing the
 * article-type label with a single ISO or human-friendly date.
 */
const GENERIC_HEADING_SEPARATORS: readonly string[] = [
  ' — ',
  ' - ',
  ' – ',
  ': ',
  ' ',
  ' | ',
  ', ',
];

/**
 * Date-shape character class: digits, dashes (ISO) plus letters and
 * single spaces (human-friendly forms like `8 April 2026`). Single-day
 * only — date *ranges* are preserved as editorial scope-window content.
 */
const GENERIC_HEADING_DATE_SHAPE = '[\\d][\\d\\-]*|\\d{1,2}\\s+[A-Za-z]+\\s+\\d{4}';

/**
 * Aliases used for one article-type slug, including the canonical
 * humanised slug plus any registered aliases.
 *
 * @param articleType - Article-type slug
 * @returns Ordered list of label aliases
 */
function resolveLabelAliases(articleType: string): readonly string[] {
  const human = humanizeSlug(articleType);
  return [human, ...(ARTICLE_TYPE_ALIASES[articleType] ?? [])];
}

/**
 * Match an exact `<prefix?><label><sep><date>` shape, including the
 * `EU Parliament ` / `EP ` prefix variants and the redundant
 * `<label> <label> — <date>` form occasionally emitted by same-day
 * collision runs.
 *
 * @param normalized - Heading text after whitespace collapse
 * @param label - Article-type label to test against
 * @param date - ISO date string
 * @returns `true` when the heading matches a known literal shape
 */
function matchesLiteralLabelDateShape(
  normalized: string,
  label: string,
  date: string
): boolean {
  for (const sep of GENERIC_HEADING_SEPARATORS) {
    const p = `${label}${sep}${date}`;
    if (normalized === p) return true;
    if (normalized === `EU Parliament ${p}`) return true;
    if (normalized === `EP ${p}`) return true;
  }
  const labelRedundant = `${label} ${label}`;
  return normalized === `${labelRedundant} — ${date}`;
}

/**
 * Match `<prefix?><label><sep-or-space><any-date>` patterns where the
 * date token can be any ISO / human / single-day-range shape. Anchored
 * to end-of-string so it cannot fire on editorial sentences that
 * happen to contain a date token mid-clause.
 *
 * @param normalized - Heading text after whitespace collapse
 * @param label - Article-type label to test against
 * @returns `true` when the heading matches the trailing-date shape
 */
function matchesTrailingDateShape(normalized: string, label: string): boolean {
  const trailingDateOnly = new RegExp(
    `^(?:EU Parliament |EP )?${escapeRegex(label)}\\s*[—–\\-|,:]\\s*(?:${GENERIC_HEADING_DATE_SHAPE})$`,
    'u'
  );
  if (trailingDateOnly.test(normalized)) return true;
  // Same shape but label followed directly by a date with whitespace only
  // (e.g. `Breaking News 2026-04-01`).
  const labelSpaceDate = new RegExp(
    `^(?:EU Parliament |EP )?${escapeRegex(label)}\\s+(?:${GENERIC_HEADING_DATE_SHAPE})$`,
    'u'
  );
  return labelSpaceDate.test(normalized);
}

/**
 * Return `true` when the supplied heading matches the generic
 * `${humanize(articleType)} — ${date}` form that the aggregator writes as
 * its default document title. Accepts em-dash, en-dash, and ASCII hyphen
 * separators, and matches the `breaking-breaking` variant that some
 * same-day collision runs produce.
 *
 * @param heading - Plain-text heading (post-`stripInlineMarkdown`)
 * @param articleType - Article type slug
 * @param date - ISO date string
 * @returns `true` when the heading carries no editorial information
 */
export function isGenericHeading(heading: string, articleType: string, date: string): boolean {
  const normalized = heading.trim().replace(/\s+/g, ' ');
  if (normalized === '') return true;
  if (isArtifactCategoryHeading(normalized)) return true;

  for (const label of resolveLabelAliases(articleType)) {
    if (matchesLiteralLabelDateShape(normalized, label, date)) return true;
    if (matchesTrailingDateShape(normalized, label)) return true;
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
