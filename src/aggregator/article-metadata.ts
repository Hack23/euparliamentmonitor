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
 * Priority ladder (per language, highest wins):
 *
 * 1. **Manifest override** — `manifest.title` / `manifest.description` on
 *    the analysis-run manifest, either as a plain string (applied to every
 *    language) or a `LanguageMap<string>` object for explicit per-language
 *    values. Authored by Stage-B agents when they have an editorial
 *    headline for the day.
 * 2. **Artefact editorial H1** — first `# …` heading from the first
 *    substantive artefact under the run directory (e.g.
 *    `intelligence/synthesis-summary.md`, `breaking-news-analysis.md`).
 *    Accepted only when the heading is not a generic
 *    `${humanize(articleType)} — ${date}` form.
 * 3. **Aggregated-markdown H1** — the first `# …` heading in the aggregator
 *    output, accepted under the same non-generic rule. In practice this
 *    tier rarely fires because the aggregator itself writes the generic
 *    default, but it covers hand-edited or historic aggregates.
 * 4. **First strong prose paragraph** — the first line of the aggregated
 *    Markdown that survives {@link shouldSkipDescriptionLine}. Used for
 *    `description`; also used for `title` as a last editorial-content
 *    resort when every heading-level source is generic.
 * 5. **Localized template** — the per-article-type `*_TITLES` generator
 *    from `src/constants/language-articles.ts`. Always parameterised by
 *    date (or derived values), so the title changes from run to run even
 *    when this last tier fires — but still the "boring repeated" option.
 *
 * English highlights (tiers 2–4) are reserved for the `en` language
 * variant; non-English variants skip them and drop to the localized
 * template (tier 5) unless an explicit `manifest.title.<lang>` /
 * `manifest.description.<lang>` override is present. This guarantees
 * every variant's `<title>` and `<meta description>` are in the correct
 * locale even while the article body itself is still rendered from an
 * English source (until per-language body translations ship).
 */

import fs from 'fs';
import path from 'path';
import { ALL_LANGUAGES, getLocalizedString } from '../constants/language-core.js';
import {
  BREAKING_NEWS_TITLES,
  COMMITTEE_REPORTS_TITLES,
  ELECTION_CYCLE_TITLES,
  MONTH_AHEAD_TITLES,
  MONTHLY_REVIEW_TITLES,
  MOTIONS_TITLES,
  PROPOSITIONS_TITLES,
  QUARTER_AHEAD_TITLES,
  QUARTER_IN_REVIEW_TITLES,
  TERM_OUTLOOK_TITLES,
  WEEK_AHEAD_TITLES,
  WEEKLY_REVIEW_TITLES,
  YEAR_AHEAD_TITLES,
  YEAR_IN_REVIEW_TITLES,
} from '../constants/language-articles.js';
import type { LangTitleSubtitle, LanguageCode, LanguageMap } from '../types/index.js';

/** One resolved `(title, description)` pair for a single language. */
export interface ResolvedMetadataEntry {
  readonly title: string;
  readonly description: string;
}

/** Fully resolved metadata — one entry per supported language. */
export type ResolvedMetadata = LanguageMap<ResolvedMetadataEntry>;

/**
 * Raw manifest subset consumed by the resolver. Deliberately narrower
 * than the full {@link import('./manifest/types.js').Manifest} shape so
 * the resolver stays usable for backport (which only has the manifest in
 * text form) and for callers that don't need the full typed structure.
 */
export interface MetadataManifest {
  readonly articleType?: string;
  readonly date?: string;
  readonly runId?: string;
  /**
   * Optional editorial-title override. `string` is applied to every
   * language; an object allows explicit per-language overrides.
   */
  readonly title?: string | Partial<Record<LanguageCode, string>>;
  /**
   * Optional editorial-description override. Same shape rules as
   * {@link title}.
   */
  readonly description?: string | Partial<Record<LanguageCode, string>>;
  /**
   * Optional committee code (e.g. `ENVI`) used by
   * {@link COMMITTEE_REPORTS_TITLES} when the template fallback fires.
   */
  readonly committee?: string;
}

/** Inputs to {@link resolveArticleMetadata}. */
export interface ResolveMetadataOptions {
  /** Article type slug (e.g. `breaking`, `motions`, `week-ahead`). */
  readonly articleType: string;
  /** ISO date of the run (`YYYY-MM-DD`). */
  readonly date: string;
  /** Aggregated Markdown document body (after provenance/header). */
  readonly markdown: string;
  /** Parsed analysis manifest (may be empty for historic/backport callers). */
  readonly manifest?: MetadataManifest;
  /**
   * Absolute path to the analysis run directory so the resolver can
   * peek at individual artefact files. Omit for callers that only have
   * the aggregated Markdown (the artefact-H1 tier is then skipped).
   */
  readonly runDir?: string;
}

/** Maximum `<meta description>` length we will emit. */
const DESCRIPTION_MAX_LENGTH = 300;

/** Maximum `<title>` length — anything longer is truncated with an ellipsis. */
const TITLE_MAX_LENGTH = 140;

/** Ordered list of artefact filenames that typically carry the editorial H1. */
const EDITORIAL_ARTEFACT_CANDIDATES: readonly string[] = [
  'intelligence/synthesis-summary.md',
  'intelligence/executive-summary.md',
  'intelligence/intelligence-briefing.md',
  'executive-summary.md',
  'intelligence-briefing.md',
  'synthesis-summary.md',
  'breaking-news-analysis.md',
  'committee-activity-report.md',
  'legislative-pipeline-analysis.md',
  'weekly-outlook.md',
  'monthly-outlook.md',
  'week-in-review.md',
  'month-in-review.md',
  'motions-analysis.md',
  'propositions-analysis.md',
];

/**
 * Emoji-banner prefixes that Stage-B agents use to decorate metadata rows
 * (e.g. `📋 Analysis Owner:`). Any line starting with one of these is
 * metadata, never prose.
 */
const EMOJI_BANNER_CHARS = [
  '📋',
  '📅',
  '🔍',
  '🏛',
  '📰',
  '📊',
  '🏷',
  '📈',
  '📉',
  '⚠',
  '🔔',
  '🎯',
  '🗳',
  '🏢',
  '📄',
];

/**
 * Label prefixes that a prose description must never start with. Every
 * entry matches case-insensitively at the start of a trimmed line, followed
 * by optional space and a colon.
 */
const METADATA_LINE_PREFIXES: readonly string[] = [
  'Analysis Date',
  'Analysis Owner',
  'Article Type',
  'Assessment Date',
  'Classification',
  'Classification Date',
  'Confidence',
  'Data Sources',
  'Document Type',
  'Generated',
  'Last Updated',
  'Parliamentary Status',
  'Parliamentary Term',
  'Period',
  'Run',
  'Run ID',
  'Series',
  'Series Run',
  'SPDX-FileCopyrightText',
  'SPDX-License-Identifier',
  'Type',
  'Window',
];

/**
 * Return `true` when a line cannot serve as a prose description. Rejects
 * Markdown structural lines (headings, blockquotes, tables, HTML),
 * mermaid/chart directives, emoji-banner metadata rows, and the known
 * `Key: value` banners that Stage-B agents emit as artefact preamble.
 *
 * @param line - Trimmed line from the aggregated Markdown source
 * @returns `true` when the line is not prose and should be skipped
 */
export function shouldSkipDescriptionLine(line: string): boolean {
  if (line.length === 0) return true;

  // Markdown structural openers
  if (line.startsWith('#')) return true;
  if (line.startsWith('>')) return true;
  if (line.startsWith('<')) return true;
  if (line.startsWith('|')) return true;
  if (line.startsWith('---') || line.startsWith('===')) return true;
  if (line.startsWith('```') || line.startsWith('~~~')) return true;

  // Mermaid / chart init blocks and the `title <text>` directive inside them
  if (line.startsWith('%%')) return true;
  if (/^title\s/i.test(line)) return true;

  // Emoji-banner metadata rows
  if (EMOJI_BANNER_CHARS.some((char) => line.startsWith(char))) return true;

  // `Key: value` metadata banners. Match plain text, bold `**Key**`,
  // and italic `*Key*` variants.
  const labelSource = line.replace(/^\*+/, '').replace(/^\*\*/, '').replace(/^_+/, '').trim();
  for (const prefix of METADATA_LINE_PREFIXES) {
    const lower = labelSource.toLowerCase();
    const prefixLower = prefix.toLowerCase();
    if (
      lower.startsWith(`${prefixLower}:`) ||
      lower.startsWith(`${prefixLower} :`) ||
      lower.startsWith(`${prefixLower}**:`) ||
      lower.startsWith(`${prefixLower}*:`)
    ) {
      return true;
    }
  }

  // Pure punctuation / decorative separators
  if (/^[-*_=~.]{3,}$/.test(line)) return true;

  return false;
}

/**
 * Strip inline Markdown decorations so we can use the remaining text as
 * plain-text meta-tag content. Removes link syntax, emphasis, inline code
 * backticks, and HTML-entity fragments that the Markdown source sometimes
 * smuggles in. Keeps the visible text readable.
 *
 * @param raw - Trimmed Markdown line
 * @returns Plain-text variant
 */
export function stripInlineMarkdown(raw: string): string {
  // All inner character classes are length-bounded to eliminate the
  // polynomial-regex worst case that CodeQL flags on uncontrolled input —
  // none of these decorations are legitimately longer than 500 chars.
  return raw
    .replace(/!\[([^\]\n]{0,500})\]\(([^)\n]{0,500})\)/g, '$1') // ![alt](img) — must precede [text](url)
    .replace(/\[([^\]\n]{1,500})\]\(([^)\n]{0,500})\)/g, '$1') // [text](url) → text
    .replace(/`([^`\n]{1,500})`/g, '$1') // inline code
    .replace(/\*\*([^*\n]{1,500})\*\*/g, '$1') // **bold**
    .replace(/__([^_\n]{1,500})__/g, '$1') // __bold__
    .replace(/\*([^*\n]{1,500})\*/g, '$1') // *italic*
    .replace(/_([^_\n]{1,500})_/g, '$1') // _italic_
    .replace(/~~([^~\n]{1,500})~~/g, '$1') // ~~strike~~
    .replace(/\s+/g, ' ')
    .trim();
}

/**
 * Clamp a string to {@link DESCRIPTION_MAX_LENGTH} characters, appending
 * an ellipsis when truncation actually happens. Does not break words if
 * avoidable — a trailing partial word is trimmed back to the previous
 * space first.
 *
 * @param text - Raw description text
 * @returns Truncated description with trailing ellipsis when clipped
 */
export function truncateDescription(text: string): string {
  if (text.length <= DESCRIPTION_MAX_LENGTH) return text;
  const cut = text.slice(0, DESCRIPTION_MAX_LENGTH - 3);
  const lastSpace = cut.lastIndexOf(' ');
  const safe = lastSpace > DESCRIPTION_MAX_LENGTH - 60 ? cut.slice(0, lastSpace) : cut;
  return `${safe.replace(/[.,;:—-]+$/, '')}…`;
}

/**
 * Clamp a title to {@link TITLE_MAX_LENGTH} characters in the same
 * word-boundary-preserving fashion as {@link truncateDescription}.
 *
 * @param text - Raw title text
 * @returns Truncated title with trailing ellipsis when clipped
 */
export function truncateTitle(text: string): string {
  if (text.length <= TITLE_MAX_LENGTH) return text;
  const cut = text.slice(0, TITLE_MAX_LENGTH - 3);
  const lastSpace = cut.lastIndexOf(' ');
  const safe = lastSpace > TITLE_MAX_LENGTH - 40 ? cut.slice(0, lastSpace) : cut;
  return `${safe.replace(/[.,;:—-]+$/, '')}…`;
}

/**
 * Return the first Markdown H1 (`# …`) in the supplied text, stripped of
 * the leading `#` and trailing anchor syntax. Returns an empty string when
 * no H1 is present.
 *
 * @param markdown - Markdown source
 * @returns Plain-text H1, or empty string when none found
 */
export function extractFirstH1(markdown: string): string {
  for (const raw of markdown.split('\n')) {
    const line = raw.trim();
    if (!line.startsWith('#')) continue;
    // Accept `# Title` but not `## Sub-heading`.
    if (!/^#\s+/.test(line)) continue;
    // Strip the leading `# ` marker, then trim trailing `#` characters
    // without an unbounded `\s*#+\s*$` regex (CodeQL flags that form as
    // polynomial on pathological repeated-`#` input).
    let text = line.replace(/^#\s+/, '').trimEnd();
    while (text.endsWith('#')) text = text.slice(0, -1).trimEnd();
    return stripInlineMarkdown(text);
  }
  return '';
}

/**
 * Walk every line of the Markdown source and return the first line that
 * survives {@link shouldSkipDescriptionLine}. Inline Markdown decorations
 * are stripped and the result is truncated to fit `<meta description>`.
 *
 * @param markdown - Markdown source
 * @returns Prose description, or empty string when nothing qualifies
 */
export function extractStrongProseLine(markdown: string): string {
  for (const raw of markdown.split('\n')) {
    const line = raw.trim();
    if (shouldSkipDescriptionLine(line)) continue;
    const plain = stripInlineMarkdown(line);
    if (plain.length < 40) continue;
    return truncateDescription(plain);
  }
  return '';
}

/**
 * Humanise an `article-type` slug the same way the aggregator does (see
 * `src/aggregator/analysis-aggregator.ts:humanize`). Kept in sync by value
 * — we deliberately do not import the private helper.
 *
 * @param slug - Slug like `week-ahead` or `breaking_news`
 * @returns Title-cased humanised form (`Week Ahead`, `Breaking News`)
 */
export function humanizeSlug(slug: string): string {
  return slug
    .split(/[-_]/g)
    .map((seg) => (seg ? seg.charAt(0).toUpperCase() + seg.slice(1) : seg))
    .join(' ')
    .trim();
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

  const human = humanizeSlug(articleType);
  const patterns = [
    `${human} — ${date}`,
    `${human} - ${date}`,
    `${human} – ${date}`,
    `${human}: ${date}`,
    `${human} ${date}`,
  ];

  // Also accept the collision-suffix pattern (e.g. `Breaking Breaking — …`)
  // and the auto-generated "EU Parliament <Type> — <date>" historic form.
  const humanRedundant = `${human} ${human}`;
  for (const p of patterns) {
    if (normalized === p) return true;
    if (normalized === `EU Parliament ${p}`) return true;
    if (normalized === `${humanRedundant} — ${date}`) return true;
  }

  // The bare `${human} — <anything>` with nothing extra is also generic.
  // eslint-disable-next-line security/detect-non-literal-regexp -- `human` derives from a sanitised slug via escapeRegex
  const trailingDateOnly = new RegExp(`^${escapeRegex(human)}\\s*[—–-]\\s*[\\d-]+$`, 'u');
  if (trailingDateOnly.test(normalized)) {
    return true;
  }

  return false;
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

/**
 * Attempt to read the first H1 and first prose paragraph from the first
 * existing artefact under {@link EDITORIAL_ARTEFACT_CANDIDATES}. Returns
 * `null` when no candidate artefact exists.
 *
 * @param runDir - Absolute run directory path
 * @param articleType - Article type slug (used by {@link isGenericHeading})
 * @param date - ISO run date (used by {@link isGenericHeading})
 * @returns `{headline, summary}` where either field may be empty
 */
export function extractArtifactHighlight(
  runDir: string,
  articleType: string,
  date: string
): { readonly headline: string; readonly summary: string } | null {
  if (!runDir || !fs.existsSync(runDir)) return null;

  // Direct candidate lookup — cheap and deterministic.
  for (const rel of EDITORIAL_ARTEFACT_CANDIDATES) {
    const abs = path.join(runDir, rel);
    if (!fs.existsSync(abs)) continue;
    const body = readArtefactBody(abs);
    const headline = extractFirstH1(body);
    if (!headline) continue;
    if (isGenericHeading(headline, articleType, date)) continue;
    const summary = extractStrongProseLine(body);
    return { headline: truncateTitle(headline), summary };
  }

  // Fallback: walk the top-level `.md` files in the run dir once, looking
  // for any that starts with `#` and has a non-generic headline.
  const topLevel = safeReaddir(runDir).filter((f) => f.endsWith('.md'));
  for (const rel of topLevel) {
    if (rel === 'manifest.json') continue;
    const abs = path.join(runDir, rel);
    const body = readArtefactBody(abs);
    const headline = extractFirstH1(body);
    if (!headline) continue;
    if (isGenericHeading(headline, articleType, date)) continue;
    const summary = extractStrongProseLine(body);
    return { headline: truncateTitle(headline), summary };
  }

  return null;
}

/**
 * Read an artefact file, skipping any SPDX HTML-comment header rows so the
 * first-H1 / first-prose logic is never derailed by the REUSE preamble.
 *
 * @param abs - Absolute file path
 * @returns File contents with SPDX comment lines dropped
 */
function readArtefactBody(abs: string): string {
  let text: string;
  try {
    text = fs.readFileSync(abs, 'utf8');
  } catch {
    return '';
  }
  const lines = text.split('\n');
  // Drop a run of leading `<!--` SPDX/provenance comments plus blank lines.
  let i = 0;
  while (i < lines.length) {
    const line = (lines[i] ?? '').trim();
    if (line === '') {
      i++;
      continue;
    }
    if (line.startsWith('<!--') && line.endsWith('-->')) {
      i++;
      continue;
    }
    break;
  }
  return lines.slice(i).join('\n');
}

/**
 * `fs.readdirSync` wrapped to never throw for missing or unreadable
 * directories.
 *
 * @param dir - Absolute directory path
 * @returns Entries in {@link dir} or `[]` when unreadable
 */
function safeReaddir(dir: string): string[] {
  try {
    return fs.readdirSync(dir);
  } catch {
    return [];
  }
}

/**
 * Build the per-language `{title, description}` pair using the
 * article-type–specific `*_TITLES` generator from
 * `src/constants/language-articles.ts`. This is the last-resort tier and
 * is always parameterised by date (or equivalent), so even when it fires
 * the result is not identical across runs of the same type.
 *
 * @param articleType - Article type slug
 * @param date - ISO run date
 * @param committee - Optional committee code (used by `committee-reports`)
 * @returns Per-language `LangTitleSubtitle`
 */
export function buildTemplateFallback(
  articleType: string,
  date: string,
  committee?: string
): LanguageMap<LangTitleSubtitle> {
  const map: Record<LanguageCode, LangTitleSubtitle> = Object.create(null) as Record<
    LanguageCode,
    LangTitleSubtitle
  >;
  // week-in-review uses the D-36→D-8 reporting window (ADR-006) so that
  // EP roll-call voting data — published 2–6 weeks after the sitting —
  // is always available in the analysis window.
  const weekRange =
    articleType === 'week-in-review'
      ? deriveReportingWindowForWeekInReview(date)
      : deriveWeekRange(date);
  const monthLabel = deriveMonthLabel(date);
  const committeeLabel = committee && committee.trim().length > 0 ? committee : 'Main Committees';
  const quarterLabel = deriveQuarterLabel(date);
  const yearLabel = deriveYearLabel(date);
  const termLabel = deriveTermLabel(date);
  const cycleLabel = deriveElectionCycleLabel(date);

  for (const lang of ALL_LANGUAGES) {
    const entry = templateForType(lang, articleType, {
      date,
      weekStart: weekRange.start,
      weekEnd: weekRange.end,
      month: monthLabel,
      committee: committeeLabel,
      quarter: quarterLabel,
      year: yearLabel,
      term: termLabel,
      cycle: cycleLabel,
    });
    Object.defineProperty(map, lang, {
      value: entry,
      enumerable: true,
      writable: true,
      configurable: true,
    });
  }
  return map;
}

/** Inputs for {@link templateForType}. */
interface TemplateInputs {
  readonly date: string;
  readonly weekStart: string;
  readonly weekEnd: string;
  readonly month: string;
  readonly committee: string;
  readonly quarter: string;
  readonly year: string;
  readonly term: string;
  readonly cycle: string;
}

/**
 * Dispatch an article-type slug to the matching localized template
 * generator. Unknown types get a uniform fallback built from
 * {@link humanizeSlug} and the run date.
 *
 * @param lang - Target language code
 * @param articleType - Article type slug
 * @param inputs - Pre-derived inputs used by the generators
 * @returns `LangTitleSubtitle` for the requested language
 */
function templateForType(
  lang: LanguageCode,
  articleType: string,
  inputs: TemplateInputs
): LangTitleSubtitle {
  switch (articleType) {
    case 'breaking':
    case 'breaking-breaking':
      return getLocalizedString(BREAKING_NEWS_TITLES, lang)(inputs.date);
    case 'committee-reports':
      return getLocalizedString(COMMITTEE_REPORTS_TITLES, lang)(inputs.committee);
    case 'motions':
      return getLocalizedString(MOTIONS_TITLES, lang)(inputs.date);
    case 'propositions':
      return getLocalizedString(PROPOSITIONS_TITLES, lang)();
    case 'week-ahead':
      return getLocalizedString(WEEK_AHEAD_TITLES, lang)(inputs.weekStart, inputs.weekEnd);
    case 'month-ahead':
      return getLocalizedString(MONTH_AHEAD_TITLES, lang)(inputs.month);
    case 'week-in-review':
      return getLocalizedString(WEEKLY_REVIEW_TITLES, lang)(inputs.weekStart, inputs.weekEnd);
    case 'month-in-review':
      return getLocalizedString(MONTHLY_REVIEW_TITLES, lang)(inputs.month);
    case 'quarter-ahead':
      return getLocalizedString(QUARTER_AHEAD_TITLES, lang)(inputs.quarter);
    case 'quarter-in-review':
      return getLocalizedString(QUARTER_IN_REVIEW_TITLES, lang)(inputs.quarter);
    case 'year-ahead':
      return getLocalizedString(YEAR_AHEAD_TITLES, lang)(inputs.year);
    case 'year-in-review':
      return getLocalizedString(YEAR_IN_REVIEW_TITLES, lang)(inputs.year);
    case 'term-outlook':
      return getLocalizedString(TERM_OUTLOOK_TITLES, lang)(inputs.term);
    case 'election-cycle':
      return getLocalizedString(ELECTION_CYCLE_TITLES, lang)(inputs.cycle);
    default:
      return {
        title: `${humanizeSlug(articleType)} — ${inputs.date}`,
        subtitle: `EU Parliament analysis — ${inputs.date}`,
      };
  }
}

/** Milliseconds in one UTC day — used by date-window derivation helpers. */
const MS_PER_DAY = 86_400_000;

/**
 * Parse an ISO date and return the `[start, end]` week range as ISO
 * strings. Week starts on Monday and ends on the following Sunday.
 *
 * @param date - ISO date string (`YYYY-MM-DD`)
 * @returns `{ start, end }` both in `YYYY-MM-DD` form
 */
export function deriveWeekRange(date: string): { readonly start: string; readonly end: string } {
  const parsed = parseIsoDate(date);
  if (!parsed) return { start: date, end: date };
  // getUTCDay(): 0 = Sunday, 1 = Monday, …
  const day = parsed.getUTCDay();
  // Shift so Monday = 0, Sunday = 6.
  const shift = (day + 6) % 7;
  const startMs = parsed.getTime() - shift * MS_PER_DAY;
  const endMs = startMs + 6 * MS_PER_DAY;
  return { start: formatIsoDate(new Date(startMs)), end: formatIsoDate(new Date(endMs)) };
}

/**
 * Return the D-36 → D-8 reporting window for the `week-in-review`
 * article type. EP roll-call voting data is published with a 2–6 week
 * lag, so using the most-recent 7 days structurally produces a
 * vote-empty dataset. Shifting 8 days back and widening to 28 days
 * (start = D-36, end = D-8) ensures the window always contains at
 * least one full EP plenary week with published roll-call data
 * (ADR-006). Direction is consistent with the workflow's
 * `DATE_FROM` (start = D-36) → `DATE_TO` (end = D-8) variables.
 *
 * @param date - ISO article date string (`YYYY-MM-DD`) — typically TODAY
 * @returns `{ start: D-36, end: D-8 }` both as `YYYY-MM-DD` ISO strings
 */
export function deriveReportingWindowForWeekInReview(date: string): {
  readonly start: string;
  readonly end: string;
} {
  const parsed = parseIsoDate(date);
  if (!parsed) return { start: date, end: date };
  return {
    start: formatIsoDate(new Date(parsed.getTime() - 36 * MS_PER_DAY)),
    end: formatIsoDate(new Date(parsed.getTime() - 8 * MS_PER_DAY)),
  };
}

/**
 * Return a human-friendly month label for an ISO date — English month
 * name + four-digit year (e.g. `April 2026`). The non-English template
 * generators accept this same label verbatim because they interpolate it
 * into a localized sentence rather than translating the month itself.
 *
 * @param date - ISO date string
 * @returns Month label, or the input when parsing fails
 */
export function deriveMonthLabel(date: string): string {
  const parsed = parseIsoDate(date);
  if (!parsed) return date;
  const monthNames = [
    'January',
    'February',
    'March',
    'April',
    'May',
    'June',
    'July',
    'August',
    'September',
    'October',
    'November',
    'December',
  ];
  const name = monthNames[parsed.getUTCMonth()] ?? '';
  return `${name} ${parsed.getUTCFullYear()}`.trim();
}

/**
 * Return a quarter label for an ISO date — `Q<n> <YYYY>` (e.g. `Q2 2026`).
 * Used by `quarter-ahead` and `quarter-in-review` title generators.
 *
 * @param date - ISO date string
 * @returns Quarter label, or the input when parsing fails
 */
export function deriveQuarterLabel(date: string): string {
  const parsed = parseIsoDate(date);
  if (!parsed) return date;
  const quarter = Math.floor(parsed.getUTCMonth() / 3) + 1;
  return `Q${quarter} ${parsed.getUTCFullYear()}`;
}

/**
 * Return a four-digit year label for an ISO date. Used by `year-ahead`
 * and `year-in-review` title generators.
 *
 * @param date - ISO date string
 * @returns Year label, or the input when parsing fails
 */
export function deriveYearLabel(date: string): string {
  const parsed = parseIsoDate(date);
  if (!parsed) return date;
  return String(parsed.getUTCFullYear());
}

/**
 * EP-term constants — keep these in sync with
 * {@link analysis/methodologies/electoral-cycle-methodology.md}.
 *  - EP10: 16 Jul 2024 → ~end of June 2029
 *  - EP11: ~Jul 2029 → ~Jun 2034
 */
const EP10_START_YEAR = 2024;
const EP10_END_YEAR = 2029;
const EP11_END_YEAR = 2034;
const EP_ELECTION_MONTH = 6; // June

/**
 * Return the EP-term label for an ISO date — `EP10 → 2029` or `EP11 → 2034`.
 * Used by `term-outlook` title generator.
 *
 * @param date - ISO date string
 * @returns Term label, or the input when parsing fails
 */
export function deriveTermLabel(date: string): string {
  const parsed = parseIsoDate(date);
  if (!parsed) return date;
  const year = parsed.getUTCFullYear();
  if (year < EP10_START_YEAR) return `EP9 → ${EP10_START_YEAR}`;
  if (year < EP10_END_YEAR) return `EP10 → ${EP10_END_YEAR}`;
  if (year < EP11_END_YEAR) return `EP11 → ${EP11_END_YEAR}`;
  // Beyond EP11 — extrapolate by 5-year terms.
  const termIndex = 11 + Math.floor((year - EP11_END_YEAR) / 5);
  const termEnd = EP11_END_YEAR + 5 * Math.ceil((year - EP11_END_YEAR + 1) / 5);
  return `EP${termIndex} → ${termEnd}`;
}

/**
 * Return the election-cycle label for an ISO date — pairs the outgoing
 * and incoming EP terms with the election year (e.g. `EP10 → EP11 (2029)`).
 * Used by the `election-cycle` title generator.
 *
 * @param date - ISO date string
 * @returns Cycle label, or the input when parsing fails
 */
export function deriveElectionCycleLabel(date: string): string {
  const parsed = parseIsoDate(date);
  if (!parsed) return date;
  const year = parsed.getUTCFullYear();
  const month = parsed.getUTCMonth() + 1;
  // Pre- or post-election treatment within ±6 months around June of the election year.
  if (year < EP10_END_YEAR || (year === EP10_END_YEAR && month <= EP_ELECTION_MONTH)) {
    return `EP10 → EP11 (${EP10_END_YEAR})`;
  }
  if (year < EP11_END_YEAR || (year === EP11_END_YEAR && month <= EP_ELECTION_MONTH)) {
    return `EP11 → EP12 (${EP11_END_YEAR})`;
  }
  // Beyond EP11 — extrapolate.
  const elections = EP11_END_YEAR + 5 * Math.ceil((year - EP11_END_YEAR + 1) / 5);
  const out = 11 + Math.floor((year - EP11_END_YEAR) / 5);
  return `EP${out} → EP${out + 1} (${elections})`;
}

/**
 * Parse an ISO date string as UTC midnight. Returns `null` for malformed
 * input so callers can skip month/week derivation gracefully.
 *
 * @param iso - ISO date string
 * @returns Parsed `Date` or `null`
 */
function parseIsoDate(iso: string): Date | null {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(iso)) return null;
  const parsed = new Date(`${iso}T00:00:00Z`);
  return Number.isNaN(parsed.getTime()) ? null : parsed;
}

/**
 * Format a `Date` as `YYYY-MM-DD` in UTC.
 *
 * @param d - Date object
 * @returns ISO date string
 */
function formatIsoDate(d: Date): string {
  const y = d.getUTCFullYear();
  const m = String(d.getUTCMonth() + 1).padStart(2, '0');
  const day = String(d.getUTCDate()).padStart(2, '0');
  return `${y}-${m}-${day}`;
}

/**
 * Extract a manifest override value for a single language. Accepts either
 * a plain string (applied to every language) or a `LanguageMap` object.
 *
 * @param value - Raw manifest value (string or per-lang object)
 * @param lang - Target language code
 * @returns Override string, or empty string when absent
 */
function manifestOverrideFor(
  value: string | Partial<Record<LanguageCode, string>> | undefined,
  lang: LanguageCode
): string {
  // A plain string is a blanket editorial override — the operator is
  // telling the resolver "use this exact text for every language". This
  // is the one path where a single string is applied cross-locale; the
  // operator takes responsibility for its language.
  if (typeof value === 'string') return value.trim();
  if (!value) return '';
  // Per-language object: respect ONLY the explicit entry for `lang`. We
  // deliberately do NOT fall back to the `en` entry for non-English
  // variants — otherwise an EN-only override would leak English into
  // every other locale's <title>. Missing languages fall through to the
  // localized template tier.
  const map = new Map<string, string>();
  for (const key of Object.keys(value)) {
    const v = (value as Record<string, unknown>)[key];
    if (typeof v === 'string') map.set(key, v);
  }
  const entry = map.get(lang);
  return typeof entry === 'string' ? entry.trim() : '';
}

/**
 * Internal: best editorial `{headline, summary}` pair available from the
 * aggregator output and artefacts, independent of language. Used for
 * tiers 2–4.
 *
 * @param opts - Resolver inputs
 * @returns Editorial content derived from English source
 */
function resolveEditorialContent(opts: ResolveMetadataOptions): {
  readonly headline: string;
  readonly summary: string;
} {
  const { articleType, date, markdown, runDir } = opts;

  // Tier 2: first non-generic H1 in the first substantive artefact.
  if (runDir) {
    const highlight = extractArtifactHighlight(runDir, articleType, date);
    if (highlight?.headline) {
      return {
        headline: highlight.headline,
        summary: highlight.summary,
      };
    }
  }

  // Tier 3: first non-generic H1 in the aggregated Markdown itself.
  const aggregatedH1 = extractFirstH1(markdown);
  const aggregatedSummary = extractStrongProseLine(markdown);
  if (aggregatedH1 && !isGenericHeading(aggregatedH1, articleType, date)) {
    return {
      headline: truncateTitle(aggregatedH1),
      summary: aggregatedSummary,
    };
  }

  // Tier 4: first strong prose paragraph (title = same prose clipped).
  if (aggregatedSummary) {
    return { headline: truncateTitle(aggregatedSummary), summary: aggregatedSummary };
  }

  return { headline: '', summary: '' };
}

/**
 * Resolve per-language `{title, description}` for one article following
 * the priority ladder documented at the top of this module.
 *
 * @param opts - Resolver inputs ({@link ResolveMetadataOptions})
 * @returns One `{title, description}` entry per supported language
 */
export function resolveArticleMetadata(opts: ResolveMetadataOptions): ResolvedMetadata {
  const manifest = opts.manifest ?? {};
  const editorial = resolveEditorialContent(opts);
  const template = buildTemplateFallback(opts.articleType, opts.date, manifest.committee);

  const result: Record<LanguageCode, ResolvedMetadataEntry> = Object.create(null) as Record<
    LanguageCode,
    ResolvedMetadataEntry
  >;

  for (const lang of ALL_LANGUAGES) {
    const manifestTitle = manifestOverrideFor(manifest.title, lang);
    const manifestDescription = manifestOverrideFor(manifest.description, lang);
    const fallback = template[lang];

    // Non-English languages must not inherit the English editorial
    // headline/summary — they would render a non-locale title in a
    // localized chrome. We skip tiers 2–4 for non-EN and drop straight to
    // the localized template (or explicit manifest override when provided).
    const useEditorial = lang === 'en';
    const titleCandidates = useEditorial
      ? [manifestTitle, editorial.headline, fallback.title]
      : [manifestTitle, fallback.title];
    const descCandidates = useEditorial
      ? [manifestDescription, editorial.summary, fallback.subtitle]
      : [manifestDescription, fallback.subtitle];

    const title = pickFirstNonEmpty(titleCandidates) || fallback.title;
    const description = pickFirstNonEmpty(descCandidates) || fallback.subtitle;

    Object.defineProperty(result, lang, {
      value: {
        title: truncateTitle(title),
        description: truncateDescription(description),
      },
      enumerable: true,
      writable: true,
      configurable: true,
    });
  }

  return result;
}

/**
 * Return the first non-empty, trimmed entry from a candidate list, or
 * the empty string when every entry is blank.
 *
 * @param candidates - Ordered list of candidate strings
 * @returns First non-empty entry
 */
function pickFirstNonEmpty(candidates: readonly string[]): string {
  for (const c of candidates) {
    if (typeof c === 'string' && c.trim().length > 0) return c.trim();
  }
  return '';
}
