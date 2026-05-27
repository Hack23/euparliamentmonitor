// SPDX-FileCopyrightText: 2024-2026 Hack23 AB
// SPDX-License-Identifier: Apache-2.0

/**
 * @module Aggregator/Metadata/TextUtilsConstants
 * @description Shared byte-budget constants and vocabularies used by
 * the metadata text helpers. Extracted from `text-utils.ts` so the
 * truncation/extraction helpers can live in `text-truncate.ts`
 * without creating a circular import — both modules import from
 * here, and `text-utils.ts` re-exports the truncators for back-compat
 * with existing call-sites.
 *
 * **No imports.** This is a pure leaf module: only constants and
 * vocabularies, no functions, no I/O.
 */

// ────────────────────────────────────────────────────────────────────────
// Length budgets — meta description / title size envelopes
// ────────────────────────────────────────────────────────────────────────

/** Maximum `<meta description>` length we will emit. */
export const DESCRIPTION_MAX_LENGTH = 180;

/**
 * Maximum `og:description` / `twitter:description` length we will
 * emit. Facebook truncates at ~300 characters in the preview card;
 * Twitter at ~200. We aim for the longer cap so LinkedIn / Slack
 * (which use the full OG payload) get the full BLUF context, then
 * let Twitter clip naturally. Below this length the extended
 * description is emitted verbatim; above it we sentence-boundary
 * truncate.
 */
export const EXTENDED_DESCRIPTION_MAX_LENGTH = 300;

/** Target minimum extended-description length before we even emit it. */
export const EXTENDED_DESCRIPTION_MIN_LENGTH = 200;

/** Target minimum `<meta description>` length before we append context. */
export const DESCRIPTION_MIN_LENGTH = 140;

/**
 * Length below which a raw description is considered too short to stand
 * on its own and gets enriched with date/context. Independent from
 * {@link DESCRIPTION_MIN_LENGTH} (which controls sentence-boundary
 * truncation behaviour). Set lower than DESCRIPTION_MIN_LENGTH so a
 * clean 100-140 char prose lede is preserved verbatim instead of being
 * padded with date/context boilerplate.
 */
export const ENRICHMENT_TRIGGER_LENGTH = 100;

/** Maximum `<title>` length — anything longer is truncated with an ellipsis. */
export const TITLE_MAX_LENGTH = 140;

/**
 * Soft target for headline-style titles produced as a fallback from
 * BLUF/lede prose. When the candidate exceeds `TITLE_MAX_LENGTH`, the
 * truncator first looks for a natural clause boundary
 * (`.`, `:`, `—`, `;`) inside the `[HEADLINE_SOFT_MIN, TITLE_MAX_LENGTH]`
 * window and breaks there instead of mid-clause-with-ellipsis. This
 * turns a 137-character truncated prose paragraph into a complete
 * journalistic clause, which scans much better in news cards and SERP
 * snippets without sacrificing the keyword-rich opening.
 */
export const HEADLINE_SOFT_MIN = 60;

/**
 * Lower floor for clause-boundary acceptance when the soft-min window
 * returns nothing. Used by {@link truncateTitle} as a second-tier
 * fallback: when a long prose paragraph has its only natural clause
 * boundaries (`: `, ` — `) clustered in the opening 30-60 characters
 * (typical of Reader-Briefing-style ledes like `Immediate priority:
 * DMA enforcement — …`), accept the strongest such boundary rather
 * than fall through to template-fallback composition. This keeps
 * scan-friendly editorial fragments intact while still rejecting
 * fragments shorter than a typical news-card title.
 */
export const HEADLINE_HARD_MIN = 30;

/**
 * Punctuation marks that signal a natural clause boundary inside a
 * BLUF / lede paragraph. Listed in preferred-break order: a colon or
 * em-dash that introduces a list of consequences is the best break,
 * full stops are next, and semicolons last. Single ASCII space is
 * always a fallback boundary handled separately.
 *
 * The CJK / Arabic / Hebrew terminators at the tail (no trailing space)
 * preserve sentence breaks in `executive-brief_<ja|ko|zh|ar|he>.md`
 * where Western `. ` never appears. CJK uses `。！？`, Arabic uses
 * `؟؛،`, Hebrew uses plain `.` without trailing space (rare; the
 * primary marker is the same Latin set).
 */
export const HEADLINE_CLAUSE_BOUNDARIES: readonly string[] = [
  ': ',
  ' — ',
  ' – ',
  '. ',
  '; ',
  ', ',
  '。',
  '！',
  '？',
  '；',
  '，',
  '،',
  '؛',
  '؟',
];

// ────────────────────────────────────────────────────────────────────────
// Banner / metadata-row vocabularies
// ────────────────────────────────────────────────────────────────────────

/**
 * Emoji-banner prefixes that Stage-B agents use to decorate metadata rows
 * (e.g. `📋 Analysis Owner:`). Any line starting with one of these is
 * metadata, never prose.
 */
export const EMOJI_BANNER_CHARS = [
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
export const METADATA_LINE_PREFIXES: readonly string[] = [
  'Admiralty Grade',
  'Analysis Date',
  'Analysis Owner',
  'Article Type',
  'Article Window',
  'Assessment Date',
  'Briefing',
  'Briefing Date',
  'Classification',
  'Classification Date',
  'Confidence',
  'Confidence in Evidence',
  'Data Sources',
  'Date',
  'Document Type',
  'Filing Date',
  'Generated',
  'Horizon',
  'IMF Status',
  'Last Updated',
  'Parliamentary Status',
  'Parliamentary Term',
  'Period',
  'Prepared',
  'Purpose',
  'Region',
  'Reporting',
  'Reporting Period',
  'Reporting Window',
  'Run',
  'Run ID',
  'Series',
  'Series Run',
  'Source',
  'Sources',
  'SPDX-FileCopyrightText',
  'SPDX-License-Identifier',
  'Topic',
  'Type',
  // Bare `WEP:` (Words of Estimative Probability) lines appear in
  // `intelligence/synthesis-summary.md` between a KJ-N heading and its
  // prose body (e.g. `**WEP: ALMOST CERTAINLY (>95%)** | Admiralty: A1`).
  // The line is grade/confidence metadata, not editorial prose — without
  // this prefix it leaked into `<meta description>` as an all-caps shout
  // (run #26223932441, propositions 2026-05-21).
  'WEP',
  'WEP Band',
  'WEP Grade',
  'Window',
];

// ────────────────────────────────────────────────────────────────────────
// Trailing-cleanup vocabularies (used by truncation helpers)
// ────────────────────────────────────────────────────────────────────────

/** Connector / determiner words that read as broken copy when they are
 *  the final token before a truncation ellipsis. */
export const TRAILING_STOP_WORDS = new Set([
  'the',
  'a',
  'an',
  'of',
  'to',
  'for',
  'in',
  'on',
  'at',
  'by',
  'and',
  'or',
  'with',
  'from',
]);

/** Trailing characters we always strip before appending our own ellipsis,
 *  so we never emit double-ellipsis or stray punctuation. */
export const TRAILING_PUNCT = /[.,;:—\-…\s]/u;

/**
 * Abbreviation tokens (lowercase, including the trailing period) that
 * should NOT count as sentence terminators when `extractFirstSentence`
 * scans for a `.` boundary. Single-letter all-caps initials
 * (`U.S.`, `E.U.`) are handled by the all-caps-initial check.
 */
export const ABBREVIATION_PREFIXES: readonly string[] = [
  'mr.',
  'mrs.',
  'ms.',
  'dr.',
  'st.',
  'no.',
  'vs.',
  'e.g.',
  'i.e.',
  'etc.',
  'cf.',
  'al.',
  // EP fiscal-year and quarter shorthand: Q1., Q2., Q3., Q4., H1., H2., FY.
  'q1.',
  'q2.',
  'q3.',
  'q4.',
  'h1.',
  'h2.',
  'fy.',
];
