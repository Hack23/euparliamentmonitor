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
 *    fall-through when a locale has no translated brief yet. Recorded in
 *    `metadataFallback[<lang>] = "en"` so editors can audit which locales
 *    fell through.
 * 4. **Artefact editorial H1** — first `# …` heading from the first
 *    substantive artefact under the run directory (e.g.
 *    `intelligence/synthesis-summary.md`, `breaking-news-analysis.md`).
 *    Accepted only when the heading is not a generic
 *    `${humanize(articleType)} — ${date}` form.
 * 5. **Aggregated-markdown H1** — the first `# …` heading in the aggregator
 *    output, accepted under the same non-generic rule.
 * 6. **First strong prose paragraph** — the first line of the aggregated
 *    Markdown that survives {@link shouldSkipDescriptionLine}.
 * 7. **Localized template** — the per-article-type `*_TITLES` generator
 *    from `src/constants/language-articles.ts`. Last resort.
 *
 * Tiers 2–6 produce the same shape ({headline, summary}); the resolver
 * picks the highest-available tier per language. When a localized brief
 * (tier 2) is present, the headline replaces the localized template
 * verbatim — no concatenation. Locales without a translated brief inherit
 * the English brief content (tier 3) so SEO surfaces never fall back to
 * boring type-level templates while real editorial content exists.
 */

import fs from 'fs';
import path from 'path';
import { ALL_LANGUAGES, getLocalizedString } from '../constants/language-core.js';
import {
  BREAKING_NEWS_TITLES,
  COMMITTEE_REPORTS_TITLES,
  ELECTION_CYCLE_TITLES,
  LOCALIZED_KEYWORDS,
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
import { resolveLocalizedBriefHighlight } from './editorial-brief-resolver.js';

/** One resolved `(title, description)` pair for a single language. */
export interface ResolvedMetadataEntry {
  readonly title: string;
  readonly description: string;
  readonly keywords: readonly string[];
  /**
   * `"localized-brief"` when the title/description came from a translated
   * `executive-brief_<lang>.md`; `"english-brief"` when the locale fell
   * through to the English brief; `"english-editorial"` when the locale
   * used an aggregated-Markdown / artefact source; `"template"` when only
   * the localized type/date template was available. For `lang === 'en'`
   * the value is always `"english-brief"` or `"english-editorial"` or
   * `"template"` (no fall-through). Lets downstream consumers — the
   * news-index, the static-site fallback note, the manifest-SEO
   * validator — record the asymmetry called out in
   * [`.github/prompts/04-article-generation.md`](../../.github/prompts/04-article-generation.md) § 6.2 priority 3.
   */
  readonly source:
    | 'manifest'
    | 'localized-brief'
    | 'english-brief'
    | 'english-editorial'
    | 'template';
}

/** Fully resolved metadata — one entry per supported language. */
export type ResolvedMetadata = LanguageMap<ResolvedMetadataEntry>;

/**
 * Raw manifest subset consumed by the resolver. Deliberately narrower
 * than the full `Manifest` shape (see `./manifest/types.ts`) so
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

/** Inputs to `resolveArticleMetadata`. */
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
const DESCRIPTION_MAX_LENGTH = 180;

/** Target minimum `<meta description>` length before we append context. */
const DESCRIPTION_MIN_LENGTH = 140;

/**
 * Length below which a raw description is considered too short to stand
 * on its own and gets enriched with date/context. Independent from
 * {@link DESCRIPTION_MIN_LENGTH} (which controls sentence-boundary
 * truncation behaviour). Set lower than DESCRIPTION_MIN_LENGTH so a
 * clean 100-140 char prose lede is preserved verbatim instead of being
 * padded with date/context boilerplate.
 */
const ENRICHMENT_TRIGGER_LENGTH = 100;

/** Maximum `<title>` length — anything longer is truncated with an ellipsis. */
const TITLE_MAX_LENGTH = 140;

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
const HEADLINE_SOFT_MIN = 60;

/**
 * Punctuation marks that signal a natural clause boundary inside a
 * BLUF / lede paragraph. Listed in preferred-break order: a colon or
 * em-dash that introduces a list of consequences is the best break,
 * full stops are next, and semicolons last. Single ASCII space is
 * always a fallback boundary handled separately.
 */
const HEADLINE_CLAUSE_BOUNDARIES: readonly string[] = [': ', ' — ', ' – ', '. ', '; '];

/** Localized labels used to enrich short or duplicate-prone meta descriptions. */
const SEO_CONTEXT_LABELS: LanguageMap<{
  readonly context: string;
  readonly date: string;
  readonly run: string;
  readonly evidence: string;
  readonly reader: string;
}> = {
  en: {
    context: 'Context',
    date: 'Published',
    run: 'analysis run',
    evidence: 'with source-linked voting, committee and legislative intelligence',
    reader: 'for democratic-accountability readers tracking EU institutional consequences',
  },
  sv: {
    context: 'Kontext',
    date: 'Publicerad',
    run: 'analyskörning',
    evidence: 'med källänkad röstnings-, utskotts- och lagstiftningsanalys',
    reader: 'för läsare som följer EU-institutionernas demokratiska konsekvenser',
  },
  da: {
    context: 'Kontekst',
    date: 'Udgivet',
    run: 'analysekørsel',
    evidence: 'med kildebelagt afstemnings-, udvalgs- og lovgivningsindblik',
    reader: 'for læsere, der følger EU-institutionernes demokratiske konsekvenser',
  },
  no: {
    context: 'Kontekst',
    date: 'Publisert',
    run: 'analysekjøring',
    evidence: 'med kildekoblet innsikt om avstemninger, komiteer og lovgivning',
    reader: 'for lesere som følger EU-institusjonenes demokratiske konsekvenser',
  },
  fi: {
    context: 'Konteksti',
    date: 'Julkaistu',
    run: 'analyysiajo',
    evidence: 'lähdelinkitetyllä äänestys-, valiokunta- ja lainsäädäntöanalyysillä',
    reader: 'lukijoille, jotka seuraavat EU-instituutioiden demokraattisia vaikutuksia',
  },
  de: {
    context: 'Kontext',
    date: 'Veröffentlicht',
    run: 'Analyselauf',
    evidence: 'mit quellengestützter Abstimmungs-, Ausschuss- und Gesetzgebungsanalyse',
    reader: 'für Leser, die demokratische Folgen der EU-Institutionen verfolgen',
  },
  fr: {
    context: 'Contexte',
    date: 'Publié',
    run: 'cycle d’analyse',
    evidence: 'avec analyse sourcée des votes, commissions et dossiers législatifs',
    reader: 'pour suivre les conséquences démocratiques des institutions de l’UE',
  },
  es: {
    context: 'Contexto',
    date: 'Publicado',
    run: 'ejecución de análisis',
    evidence: 'con inteligencia enlazada sobre votos, comisiones y legislación',
    reader: 'para lectores que siguen consecuencias democráticas de las instituciones de la UE',
  },
  nl: {
    context: 'Context',
    date: 'Gepubliceerd',
    run: 'analyserun',
    evidence: 'met brongekoppelde stem-, commissie- en wetgevingsanalyse',
    reader: 'voor lezers die democratische gevolgen van EU-instellingen volgen',
  },
  ar: {
    context: 'السياق',
    date: 'نُشر',
    run: 'تشغيل التحليل',
    evidence: 'مع تحليل موثق للتصويت واللجان والتشريع',
    reader: 'للقراء الذين يتابعون آثار مؤسسات الاتحاد الأوروبي على المساءلة الديمقراطية',
  },
  he: {
    context: 'הקשר',
    date: 'פורסם',
    run: 'הרצת ניתוח',
    evidence: 'עם מודיעין מקושר מקורות על הצבעות, ועדות וחקיקה',
    reader: 'לקוראים העוקבים אחר השלכות מוסדות האיחוד האירופי על אחריות דמוקרטית',
  },
  ja: {
    context: '文脈',
    date: '公開日',
    run: '分析実行',
    evidence: '投票、委員会、立法に関する出典付きインテリジェンス',
    reader: 'EU機関の民主的説明責任への影響を追跡する読者向け',
  },
  ko: {
    context: '맥락',
    date: '게시일',
    run: '분석 실행',
    evidence: '투표, 위원회, 입법에 대한 출처 연결 인텔리전스',
    reader: 'EU 기관의 민주적 책임 영향을 추적하는 독자를 위해',
  },
  zh: {
    context: '背景',
    date: '发布日期',
    run: '分析运行',
    evidence: '附来源链接的投票、委员会、立法程序、政治联盟和政策影响情报',
    reader: '面向跟踪欧盟机构民主问责、透明度和成员国政策后果的读者',
  },
};

/** Ordered list of artefact filenames that typically carry the editorial H1. */
const EDITORIAL_ARTEFACT_CANDIDATES: readonly string[] = [
  // `executive-brief.md` is the canonical Riksdagsmonitor-aligned editorial
  // artefact (see `analysis/methodologies/ai-driven-analysis-guide.md`).
  // It always carries the journalist's BLUF and a `## 60-Second Read`
  // paragraph that is the lede — preferring it over `synthesis-summary.md`
  // keeps Stage-B internal vocabulary ("Purpose: This artifact provides …")
  // out of the SEO-critical `<title>` and `<meta description>` surfaces.
  'executive-brief.md',
  'extended/executive-brief.md',
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
 * Headings inside an editorial artefact that carry the journalist's lede
 * paragraph (a one-paragraph summary of "what happened, why it matters").
 * When the resolver sees one of these as a `## …` heading inside the
 * editorial artefact, it prefers the first prose paragraph that follows
 * it as the description (and as a title fallback) over a generic line
 * walk. Names are matched case-insensitively against the heading text
 * (after stripping inline Markdown).
 */
const EDITORIAL_LEDE_HEADINGS: readonly string[] = [
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
const ARTIFACT_CATEGORY_PREFIXES: readonly string[] = [
  'actor mapping',
  'analytical quality',
  'breaking news analysis',
  'coalition dynamics',
  'commission wp alignment',
  'committee activity report',
  'cross run continuity',
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
  'WEP Band',
  'WEP Grade',
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

  if (line.startsWith('#')) return true;
  if (line.startsWith('>')) return true;
  if (line.startsWith('<')) return true;
  if (line.startsWith('|')) return true;
  if (line.startsWith('---') || line.startsWith('===')) return true;
  if (line.startsWith('```') || line.startsWith('~~~')) return true;

  if (line.startsWith('%%')) return true;
  if (/^title\s/i.test(line)) return true;

  if (EMOJI_BANNER_CHARS.some((char) => line.startsWith(char))) return true;

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

  if (/^[-*_=~.]{3,}$/.test(line)) return true;

  if (isLocalizedBannerRow(line)) return true;

  return false;
}

/**
 * Language-agnostic banner-row detector. Stage-B artefacts open with a
 * metadata banner of the shape
 *   `**Date:** 2026-05-15 | **Type:** Breaking | **Run:** breaking-run-001`
 * and its localized siblings — notably Japanese / Chinese / Korean briefs
 * which place the full-width colon `：` **inside** the bold span
 * (`**日付：**`) rather than after it. The `METADATA_LINE_PREFIXES` table
 * only covers the English vocabulary; this helper catches the structural
 * shape directly: a line that starts with `**`, contains at least one
 * `|` separator, and carries two-or-more bold key markers that end with
 * — or are followed by — an ASCII colon `:` or full-width colon `：`.
 * Banner rows look identical in every language we publish, so detecting
 * them here keeps localized briefs from leaking their first banner line
 * into the `<meta description>`.
 *
 * @param line - Trimmed source line
 * @returns `true` when the line is a banner row in any locale
 */
function isLocalizedBannerRow(line: string): boolean {
  if (!line.startsWith('**')) return false;
  if (!line.includes('|')) return false;
  const inside = (line.match(/\*\*[^*]+[:：]\s*\*\*/g) ?? []).length;
  const after = (line.match(/\*\*[^*]+\*\*\s*[:：]/g) ?? []).length;
  return inside + after >= 2;
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
/**
 * Strip a leading all-caps prose label (e.g. `SITUATION:`, `KEY MOTION:`,
 * `BLUF:`, `BOTTOM LINE:`, `TIER-1:`) from a prose line. These labels
 * are common in BLUF-style editorial writing — they survive
 * {@link stripInlineMarkdown} (which strips the `**bold**` wrapper but
 * keeps the literal text) and would otherwise leak into the SEO
 * description as a confusing all-caps shout.
 *
 * Matches up to 4 hyphenated all-caps tokens, optionally followed by a
 * digit suffix (`TIER-1`), terminating at a colon. Returns the original
 * line when no opener is present.
 *
 * @param line - Plain prose line (post-{@link stripInlineMarkdown})
 * @returns Line with the all-caps opener removed
 */
export function stripLeadingProseLabel(line: string): string {
  const colonIdx = line.indexOf(': ');
  if (colonIdx < 2 || colonIdx > 80) return line;
  const label = line.slice(0, colonIdx);
  const rest = line.slice(colonIdx + 2).trim();
  if (rest.length < 20) return line;
  if (!/^[A-Z][A-Z0-9 -]{1,79}$/.test(label)) return line;
  if (label.length < 3) return line;
  return rest;
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
  return raw
    .replace(/!\[([^\]\n]{0,500})\]\(([^)\n]{0,500})\)/g, '$1')
    .replace(/\[([^\]\n]{1,500})\]\(([^)\n]{0,500})\)/g, '$1')
    .replace(/`([^`\n]{1,500})`/g, '$1')
    .replace(/\*\*([^*\n]{1,500})\*\*/g, '$1')
    .replace(/__([^_\n]{1,500})__/g, '$1')
    .replace(/\*([^*\n]{1,500})\*/g, '$1')
    .replace(/_([^_\n]{1,500})_/g, '$1')
    .replace(/~~([^~\n]{1,500})~~/g, '$1')
    .replace(/\s+/g, ' ')
    .trim();
}

/** Connector / determiner words that read as broken copy when they are
 *  the final token before a truncation ellipsis. */
const TRAILING_STOP_WORDS = new Set([
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
const TRAILING_PUNCT = /[.,;:—\-…\s]/u;

/**
 * Repeatedly strip trailing stop-words (separated by a single space) and
 * trailing punctuation (including any pre-existing ellipsis). Implemented
 * imperatively to avoid super-linear regex backtracking on the
 * `(?:\s+stop-word)+$` pattern flagged by `security/detect-unsafe-regex`.
 *
 * @param input - Pre-clipped string to clean up
 * @returns Cleaned string with no trailing stop-words or punctuation
 */
function stripTrailingStopWordsAndPunctuation(input: string): string {
  let result = input;
  let changed = true;
  while (changed) {
    changed = false;
    while (result.length > 0 && TRAILING_PUNCT.test(result.charAt(result.length - 1))) {
      result = result.slice(0, -1);
      changed = true;
    }
    const lastSpace = result.lastIndexOf(' ');
    if (lastSpace >= 0) {
      const tail = result.slice(lastSpace + 1).toLowerCase();
      if (TRAILING_STOP_WORDS.has(tail)) {
        result = result.slice(0, lastSpace);
        changed = true;
      }
    }
  }
  return result;
}

/**
 * Clamp a string to `DESCRIPTION_MAX_LENGTH` characters, appending
 * an ellipsis when truncation actually happens. Does not break words if
 * avoidable — a trailing partial word is trimmed back to the previous
 * space first.
 *
 * @param text - Raw description text
 * @returns Truncated description with trailing ellipsis when clipped
 */
export function truncateDescription(text: string): string {
  if (text.length <= DESCRIPTION_MAX_LENGTH) return text;
  const cut = text.slice(0, DESCRIPTION_MAX_LENGTH - 1);
  // Prefer the last full sentence terminator within the cut so we don't
  // end on a dangling determiner ("…year. The"). Period/!/? followed by
  // a space marks a clean boundary. Only honour the boundary when it
  // sits past the soft minimum so we keep enough body text to be useful.
  const sentenceEnd = Math.max(cut.lastIndexOf('. '), cut.lastIndexOf('! '), cut.lastIndexOf('? '));
  if (sentenceEnd >= DESCRIPTION_MIN_LENGTH) {
    return cut.slice(0, sentenceEnd + 1).replace(/\s+$/, '');
  }
  const lastSpace = cut.lastIndexOf(' ');
  let safe = lastSpace > DESCRIPTION_MAX_LENGTH - 60 ? cut.slice(0, lastSpace) : cut;
  // Drop dangling stop-words and trailing punctuation/ellipsis so we
  // never emit broken copy ("…year. The" → "…year.") or double-ellipsis
  // ("The……") when the upstream input already carried an ellipsis.
  safe = stripTrailingStopWordsAndPunctuation(safe);
  return `${safe}…`;
}

/**
 * Clamp a title to `TITLE_MAX_LENGTH` characters in the same
 * word-boundary-preserving fashion as {@link truncateDescription}.
 *
 * @param text - Raw title text
 * @returns Truncated title with trailing ellipsis when clipped
 */
export function truncateTitle(text: string): string {
  if (text.length <= TITLE_MAX_LENGTH) return text;
  // Prefer ending at a natural clause boundary inside the
  // `[HEADLINE_SOFT_MIN, TITLE_MAX_LENGTH]` window so the truncated
  // title reads as a complete journalistic clause rather than a
  // mid-sentence prose snippet. Iterate boundaries in priority order;
  // when a candidate falls in the window, break there and drop the
  // ellipsis since the result is grammatically complete.
  const search = text.slice(0, TITLE_MAX_LENGTH);
  for (const boundary of HEADLINE_CLAUSE_BOUNDARIES) {
    const idx = search.lastIndexOf(boundary);
    if (idx >= HEADLINE_SOFT_MIN) {
      const clean = stripTrailingStopWordsAndPunctuation(text.slice(0, idx));
      if (clean.length >= HEADLINE_SOFT_MIN) return clean;
    }
  }
  const cut = text.slice(0, TITLE_MAX_LENGTH - 1);
  const lastSpace = cut.lastIndexOf(' ');
  let safe = lastSpace > TITLE_MAX_LENGTH - 40 ? cut.slice(0, lastSpace) : cut;
  safe = stripTrailingStopWordsAndPunctuation(safe);
  return `${safe}…`;
}

/**
 * Return the first complete sentence from a prose paragraph, suitable
 * for use as a fallback editorial title when the artefact H1 is
 * categorical (e.g. `# EU Parliament Committee Reports`) and the
 * resolver must derive `<title>` from the BLUF / lede summary instead.
 *
 * A "sentence" is the prefix up to the first sentence-terminator
 * (`. `, `! `, `? `, `; `) inside the `[HEADLINE_SOFT_MIN,
 * TITLE_MAX_LENGTH]` window. Common abbreviations (`Q1.`, `Q2.`,
 * `H1.`, `H2.`, `Mr.`, `Mrs.`, `e.g.`, `i.e.`, `vs.`) are skipped
 * so they don't terminate the sentence prematurely. When no
 * acceptable terminator exists in the window, returns the entire
 * input unchanged so {@link truncateTitle} can handle clause-boundary
 * truncation downstream.
 *
 * This produces journalistically clean titles even for the
 * propositions / committee-reports cases where the BLUF paragraph
 * opens with a single long sentence that exceeds 140 chars —
 * `truncateTitle` then breaks on a clause boundary, and the result is
 * still grammatical because the input was a sentence prefix rather
 * than an arbitrary paragraph slice.
 *
 * @param paragraph - Prose paragraph (post-{@link stripInlineMarkdown})
 * @returns First sentence, or the original paragraph when none can be
 *   identified within the soft-min window
 */
export function extractFirstSentence(paragraph: string): string {
  const trimmed = paragraph.trim();
  if (trimmed.length <= HEADLINE_SOFT_MIN) return trimmed;
  // Limit terminator search to TITLE_MAX_LENGTH * 1.5 — beyond that
  // we'd rather let truncateTitle clause-truncate the original
  // paragraph than return a too-long first sentence.
  const window = trimmed.slice(0, Math.floor(TITLE_MAX_LENGTH * 1.5));
  // Skip common abbreviations that contain a period inside a token
  // (Q1., e.g., i.e., vs., Mr., Mrs., No., U.S., E.U.). We walk
  // candidate terminator positions; a position counts only when the
  // char before it is *not* part of a known abbreviation token.
  const terminators = ['. ', '! ', '? ', '; '];
  let bestIdx = -1;
  for (const t of terminators) {
    let from = HEADLINE_SOFT_MIN;
    let idx: number;
    while ((idx = window.indexOf(t, from)) !== -1) {
      if (!isAbbreviationBoundary(window, idx) && idx < window.length - 1) {
        if (bestIdx === -1 || idx < bestIdx) bestIdx = idx;
        break;
      }
      from = idx + t.length;
    }
  }
  if (bestIdx >= HEADLINE_SOFT_MIN) {
    return trimmed.slice(0, bestIdx + 1).trim();
  }
  return trimmed;
}

/**
 * Abbreviation tokens (lowercase, including the trailing period) that
 * should NOT count as sentence terminators when {@link extractFirstSentence}
 * scans for a `.` boundary. Single-letter all-caps initials
 * (`U.S.`, `E.U.`) are handled by the all-caps-initial check below.
 */
const ABBREVIATION_PREFIXES: readonly string[] = [
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

/**
 * Check whether the character preceding the `.` at `idx` in `text`
 * indicates an abbreviation (so the `.` is not a sentence terminator).
 * Matches the {@link ABBREVIATION_PREFIXES} table and the all-caps
 * single-letter initials pattern (`U.S.`, `E.U.`).
 *
 * @param text - Source text (lowercased segment + original mixed-case)
 * @param idx - Index of the `.` character in `text`
 * @returns `true` when the period at `idx` is part of an abbreviation
 */
function isAbbreviationBoundary(text: string, idx: number): boolean {
  // All-caps single-letter initial like `U.S.` or `E.U.` — char at
  // idx-1 is a capital letter, and idx-2 is either start of string,
  // whitespace, or another single-letter+period pair.
  if (idx >= 1) {
    const prev = text.charCodeAt(idx - 1);
    const isUpperLetter = prev >= 65 && prev <= 90;
    if (isUpperLetter && (idx === 1 || text[idx - 2] === ' ' || text[idx - 2] === '.')) {
      return true;
    }
  }
  // ABBREVIATION_PREFIXES lookup — scan backwards from `.` to find the
  // start of the word, then compare lowercased.
  let start = idx;
  while (start > 0 && /[a-zA-Z]/u.test(text[start - 1] ?? '')) start--;
  const token = text.slice(start, idx + 1).toLowerCase();
  return ABBREVIATION_PREFIXES.includes(token);
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
    if (!/^#\s+/.test(line)) continue;
    let text = line.replace(/^#\s+/, '').trimEnd();
    while (text.endsWith('#')) text = text.slice(0, -1).trimEnd();
    return stripInlineMarkdown(text);
  }
  return '';
}

/**
 * Internal paragraph-collector state shared between
 * {@link extractStrongProseLine} and {@link extractLedeAfterHeading}.
 * Both walk Markdown line-by-line and concatenate consecutive prose
 * lines into a single description-sized paragraph, terminating on a
 * blank line, a skip-line, or the cap.
 */
interface ParagraphBuffer {
  lines: string[];
  byteCount: number;
}

/**
 * Process one Markdown line against the in-progress paragraph buffer.
 * Returns the desired loop control: `'continue'` (skip silently),
 * `'break'` (paragraph terminated — emit), or `'collected'` (line was
 * pushed into the buffer; caller checks the cap separately).
 *
 * Factored out of the two extractors to reduce cognitive complexity.
 *
 * @param line - Trimmed Markdown line
 * @param buf - In-progress paragraph buffer (mutated on `'collected'`)
 * @returns Loop control directive
 */
function collectProseLine(line: string, buf: ParagraphBuffer): 'continue' | 'break' | 'collected' {
  const hasBuffer = buf.lines.length > 0;
  if (hasBuffer && line === '') return 'break';
  if (line === '') return 'continue';
  if (shouldSkipDescriptionLine(line)) return hasBuffer ? 'break' : 'continue';
  const plain = stripLeadingProseLabel(stripInlineMarkdown(line));
  if (!hasBuffer && plain.length < 40) return 'continue';
  buf.lines.push(plain);
  buf.byteCount += plain.length + 1;
  return 'collected';
}

/**
 * Walk every line of the Markdown source and return the first paragraph
 * that survives {@link shouldSkipDescriptionLine}. Consecutive non-blank
 * prose lines are joined with a single space so hard-wrapped ledes
 * (column-95 conventional wrap) produce a clean 140-180-character
 * description rather than just the first 60-90-char line.
 *
 * Inline Markdown decorations are stripped and the result is truncated
 * to fit `<meta description>`.
 *
 * @param markdown - Markdown source
 * @returns Prose description, or empty string when nothing qualifies
 */
export function extractStrongProseLine(markdown: string): string {
  let inFence = false;
  const buf: ParagraphBuffer = { lines: [], byteCount: 0 };
  for (const raw of markdown.split('\n')) {
    const line = raw.trim();
    if (line.startsWith('```') || line.startsWith('~~~')) {
      inFence = !inFence;
      continue;
    }
    if (inFence) continue;
    const directive = collectProseLine(line, buf);
    if (directive === 'continue') continue;
    if (directive === 'break') break;
    if (buf.byteCount >= DESCRIPTION_MAX_LENGTH) break;
  }
  if (buf.lines.length === 0) return '';
  return truncateDescription(buf.lines.join(' '));
}

/**
 * Walk the body of an editorial artefact and, when it contains a `## …`
 * heading whose text matches one of `EDITORIAL_LEDE_HEADINGS`,
 * return the first prose paragraph that follows that heading. Consecutive
 * non-blank lines are paragraph-joined (see {@link extractStrongProseLine}).
 *
 * Returns the empty string when no lede heading is found or no qualifying
 * prose follows it. Inline Markdown is stripped and the result is
 * truncated to fit `<meta description>`.
 *
 * @param markdown - Editorial artefact source
 * @returns Lede paragraph, or empty string when none matched
 */
/**
 * Loop-state directive emitted by {@link advanceLedeState} for one
 * line of a `## 60-Second Read`-style block. `'enter'` and `'leave'`
 * adjust the in-lede flag; `'collect'` defers to {@link collectProseLine};
 * `'skip-fence'` toggles the fence flag; `'break-buffer-has-content'`
 * stops the walk because we hit the next heading mid-paragraph.
 */
type LedeDirective =
  | { kind: 'fence' }
  | { kind: 'heading'; inLede: boolean }
  | { kind: 'collect' }
  | { kind: 'pause' };

/**
 * Classify one Markdown line for the {@link extractLedeAfterHeading}
 * walker. The returned directive is then applied to walker state by
 * {@link applyLedeDirective}.
 *
 * @param line - Trimmed Markdown line
 * @param isInFence - True when the previous line opened a fenced block
 * @param inLede - True when the previous line was inside a lede heading block
 * @param hasBuffered - True when at least one prose line has been collected
 * @returns Directive describing how the walker should treat this line
 */
function classifyLedeLine(
  line: string,
  isInFence: boolean,
  inLede: boolean,
  hasBuffered: boolean
): LedeDirective {
  if (line.startsWith('```') || line.startsWith('~~~')) return { kind: 'fence' };
  if (isInFence) return { kind: 'pause' };
  if (/^#{2,3}\s+/.test(line)) {
    if (hasBuffered) return { kind: 'pause' };
    const headingText = normaliseHeadingText(line.replace(/^#{2,3}\s+/, ''));
    const match = EDITORIAL_LEDE_HEADINGS.some((h) => isLedeHeadingMatch(headingText, h));
    return { kind: 'heading', inLede: match };
  }
  return inLede ? { kind: 'collect' } : { kind: 'pause' };
}

/**
 * Apply one directive emitted by {@link classifyLedeLine} to the walk
 * state. Returns `'break'` to stop the walk, `'continue'` to skip to
 * the next line, or `'collect'` when the caller should now run
 * {@link collectProseLine}. Mutates `state` for fence/in-lede toggles.
 *
 * @param directive - Classification of the current line
 * @param state - Walk state (mutated in place)
 * @param state.inFence - True when the current line is inside a fenced block
 * @param state.inLede - True when the current line is inside a lede heading block
 * @param hasBuffered - Whether any prose has already been collected
 * @returns Loop control directive
 */
function applyLedeDirective(
  directive: LedeDirective,
  state: { inFence: boolean; inLede: boolean },
  hasBuffered: boolean
): 'break' | 'continue' | 'collect' {
  if (directive.kind === 'fence') {
    state.inFence = !state.inFence;
    return 'continue';
  }
  if (directive.kind === 'heading') {
    if (hasBuffered) return 'break';
    state.inLede = directive.inLede;
    return 'continue';
  }
  if (directive.kind === 'pause') return 'continue';
  return 'collect';
}

export function extractLedeAfterHeading(markdown: string): string {
  const state = { inFence: false, inLede: false };
  const buf: ParagraphBuffer = { lines: [], byteCount: 0 };
  for (const raw of markdown.split('\n')) {
    const line = raw.trim();
    const directive = classifyLedeLine(line, state.inFence, state.inLede, buf.lines.length > 0);
    const action = applyLedeDirective(directive, state, buf.lines.length > 0);
    if (action === 'break') break;
    if (action === 'continue') continue;
    const collect = collectProseLine(line, buf);
    if (collect === 'continue') continue;
    if (collect === 'break') break;
    if (buf.byteCount >= DESCRIPTION_MAX_LENGTH) break;
  }
  if (buf.lines.length === 0) return '';
  return truncateDescription(buf.lines.join(' '));
}

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
function normaliseHeadingText(raw: string): string {
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
function isLedeHeadingMatch(headingText: string, whitelistEntry: string): boolean {
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

  if (isArtifactCategoryHeading(normalized)) return true;

  const human = humanizeSlug(articleType);
  const patterns = [
    `${human} — ${date}`,
    `${human} - ${date}`,
    `${human} – ${date}`,
    `${human}: ${date}`,
    `${human} ${date}`,
  ];

  const humanRedundant = `${human} ${human}`;
  for (const p of patterns) {
    if (normalized === p) return true;
    if (normalized === `EU Parliament ${p}`) return true;
    if (normalized === `${humanRedundant} — ${date}`) return true;
  }

  const trailingDateOnly = new RegExp(`^${escapeRegex(human)}\\s*[—–-]\\s*[\\d-]+$`, 'u');
  if (trailingDateOnly.test(normalized)) {
    return true;
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

/**
 * Attempt to read the first H1 and first prose paragraph from the first
 * existing artefact under `EDITORIAL_ARTEFACT_CANDIDATES`. Returns
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

  const direct = scanCandidatesForHighlight(
    runDir,
    EDITORIAL_ARTEFACT_CANDIDATES,
    articleType,
    date
  );
  if (direct.headline) return { headline: direct.headline, summary: direct.summary };

  // Top-level fallback scan — used only when none of the canonical
  // editorial artefacts produced a non-generic H1. We must NOT pick up
  // translated sibling briefs (`executive-brief_<lang>.md`,
  // `synthesis-summary_<lang>.md`, …) here, because their H1s are
  // legitimate localized headlines that the English-only
  // {@link isGenericHeading} detector cannot recognise as boilerplate.
  // Letting them through poisoned the English `<title>` and
  // `<meta description>` for the 2026-05-15 batch with Arabic content
  // from `executive-brief_ar.md`. See {@link isTranslatedSiblingBrief}
  // and the regression test in `test/unit/article-metadata.test.js`.
  const topLevel = safeReaddir(runDir).filter(
    (f) => f.endsWith('.md') && f !== 'manifest.json' && !isTranslatedSiblingBrief(f)
  );
  const fallback = scanCandidatesForHighlight(runDir, topLevel, articleType, date);
  if (fallback.headline) return { headline: fallback.headline, summary: fallback.summary };

  const summaryOnly = direct.summary || fallback.summary;
  if (summaryOnly) {
    return { headline: '', summary: summaryOnly };
  }
  return null;
}

/**
 * Filename suffix pattern that identifies a translated sibling brief
 * (e.g. `executive-brief_ar.md`, `synthesis-summary_zh.md`). The
 * `_<lang>` token is matched against {@link ALL_LANGUAGES} so we never
 * exclude a legitimate English artefact whose name happens to end in
 * `_<two-letter-suffix>.md`.
 */
const TRANSLATED_SIBLING_SUFFIX_RE = new RegExp(`_(${ALL_LANGUAGES.join('|')})\\.md$`, 'i');

/**
 * Return `true` when a top-level `.md` filename looks like a translated
 * sibling of a canonical editorial artefact (e.g.
 * `executive-brief_ar.md`). These files must be excluded from the
 * top-level fallback scan in {@link extractArtifactHighlight} because
 * their localized H1s evade the English-only generic-heading detector
 * and would otherwise hijack the English SEO surfaces.
 *
 * @param filename - Run-relative `.md` filename (no path separators)
 * @returns `true` when the file is a translated sibling brief
 */
export function isTranslatedSiblingBrief(filename: string): boolean {
  return TRANSLATED_SIBLING_SUFFIX_RE.test(filename);
}

/**
 * Walk a list of candidate artefact paths and return the first
 * non-generic headline + summary pair, plus the first usable lede
 * summary seen along the way. Extracted from
 * {@link extractArtifactHighlight} to keep its cognitive complexity
 * within the SonarJS budget.
 *
 * @param runDir - Absolute run directory path
 * @param candidates - Run-relative candidate filenames to probe
 * @param articleType - Article-type slug (used by {@link isGenericHeading})
 * @param date - ISO run date (used by {@link isGenericHeading})
 * @returns `{headline, summary}` where either field may be empty
 */
function scanCandidatesForHighlight(
  runDir: string,
  candidates: readonly string[],
  articleType: string,
  date: string
): { readonly headline: string; readonly summary: string } {
  let bestSummaryOnly = '';
  for (const rel of candidates) {
    const probe = probeCandidateForHighlight(runDir, rel, articleType, date);
    if (probe.cleanHighlight) return probe.cleanHighlight;
    if (probe.strippedHeadline) {
      return { headline: probe.strippedHeadline, summary: probe.summary ?? bestSummaryOnly };
    }
    if (!bestSummaryOnly && probe.summary) {
      bestSummaryOnly = probe.summary;
    }
  }
  return { headline: '', summary: bestSummaryOnly };
}

/**
 * Read a single candidate artefact and classify what it can contribute
 * to the highlight resolver. Extracted from
 * {@link scanCandidatesForHighlight} to keep its cognitive complexity
 * within the SonarJS budget.
 *
 * @param runDir - Absolute run directory
 * @param rel - Run-relative artefact path
 * @param articleType - Article-type slug for {@link isGenericHeading}
 * @param date - ISO run date for {@link isGenericHeading}
 * @returns
 *   - `cleanHighlight` when the artefact has a non-generic H1 (caller may
 *     return it directly)
 *   - `strippedHeadline` when the H1 is generic but yields an editorial
 *     core after {@link stripArtifactCategoryAffix}
 *   - `summary` when the artefact carries a usable lede or strong prose
 *     line (independent of the headline outcome)
 */
function probeCandidateForHighlight(
  runDir: string,
  rel: string,
  articleType: string,
  date: string
): {
  readonly cleanHighlight?: { readonly headline: string; readonly summary: string };
  readonly strippedHeadline?: string;
  readonly summary?: string;
} {
  const abs = path.join(runDir, rel);
  if (!fs.existsSync(abs)) return {};
  const body = readArtefactBody(abs);
  const headline = extractFirstH1(body);
  const lede = extractLedeAfterHeading(body);
  const summary = lede || extractStrongProseLine(body);
  if (headline && !isGenericHeading(headline, articleType, date)) {
    return { cleanHighlight: { headline: truncateTitle(headline), summary } };
  }
  // The artefact H1 is generic boilerplate (`Executive Brief — EU Parliament
  // Breaking News`). Before falling back to a stripped category-core
  // headline, try to surface the FIRST NAMED PRIORITY FINDING from the
  // brief's `## Key Developments` / `## Priority Dossiers` /
  // `## Top Findings` block. This is the canonical Stage-B authoring
  // pattern (see `analysis/templates/executive-brief.md`) — every brief
  // lists its top dossiers as `**Name** (procedure-code, date) — paragraph`
  // or `### N. Name (committee)`. Surfacing that name produces a
  // distinctive editorial headline ("Digital Markets Act Enforcement",
  // "Ukraine War Accountability") instead of a stripped category noun.
  const priority = extractPriorityFindingHighlight(body);
  if (priority?.headline) {
    return {
      cleanHighlight: {
        headline: truncateTitle(priority.headline),
        summary: priority.summary || summary,
      },
    };
  }
  if (headline) {
    const stripped = stripArtifactCategoryAffix(headline);
    if (stripped && !isGenericHeading(stripped, articleType, date)) {
      return { strippedHeadline: truncateTitle(stripped), summary };
    }
  }
  return { summary };
}

/**
 * Section headings inside the executive brief that introduce the
 * named-priority-finding block (matched case-insensitively against the
 * decoration-stripped heading text, see {@link normaliseHeadingText}).
 */
const PRIORITY_FINDING_SECTION_HEADINGS: readonly string[] = [
  'key developments',
  'key findings',
  'key intelligence summary',
  'key judgements',
  'key judgments',
  'headline intelligence',
  'headline judgements',
  'headline judgments',
  'lead story',
  'policy intelligence alerts',
  'priority dossiers',
  'priority dossiers under committee scrutiny',
  'priority findings',
  'priority intelligence assessment',
  'priority items',
  'top findings',
  'top developments',
  'top dossiers',
  'top trigger events',
  'top triggers',
  'trigger events',
  'top documents',
  'top procedures',
  'top 3 triggers',
  'wep assessment',
  'high priority',
  'highest priority',
];

/**
 * Mine the FIRST named priority finding from an executive-brief–style
 * artefact body. Looks for a section heading from
 * {@link PRIORITY_FINDING_SECTION_HEADINGS} and returns the first dossier
 * name + descriptive paragraph found inside it. Supports the three
 * canonical Stage-B authoring patterns:
 *
 *   1. **Bold-in-numbered-list** (breaking briefs):
 *      `1. **Digital Markets Act Enforcement** (TA-10-2026-0160, 2026-04-30)`
 *      `   Parliament adopted a resolution …`
 *   2. **Numbered subheading** (committee briefs):
 *      `### 1. Clean Industrial Deal Implementation (ITRE/ENVI)`
 *      `The Clean Industrial Deal framework …`
 *   3. **Bold-leading paragraph** (synthesis variants):
 *      `**Trigger 1: DMA Enforcement Resolution** (TA-10-2026-0160)`
 *      `- Significance: 🟢 HIGH IMPACT …`
 *
 * Trailing parenthesised metadata (`(TA-10-2026-0160, 2026-04-30)`,
 * `(ITRE/ENVI)`) is stripped from the headline so it stays headline-shaped
 * (`Digital Markets Act Enforcement`) rather than boilerplate
 * (`Digital Markets Act Enforcement (TA-10-2026-0160, 2026-04-30)`).
 *
 * @param body - Editorial artefact body
 * @returns `{headline, summary}` when a priority finding was identified;
 *   `null` when the body has no priority section or no usable item inside
 */
export function extractPriorityFindingHighlight(
  body: string
): { readonly headline: string; readonly summary: string } | null {
  if (!body) return null;
  const lines = body.split('\n');
  return scanPrioritySection(lines) ?? scanH2StoryHeadings(lines);
}

/**
 * Strategy 1 — scan inside the first recognised priority-finding
 * section heading for a usable item (Pattern A/B/C/D). Returns `null`
 * when the section is absent or contains no matchable item.
 *
 * @param lines - Body lines (already split on `\n`)
 * @returns `{headline, summary}` when an item was identified
 */
function scanPrioritySection(
  lines: readonly string[]
): { readonly headline: string; readonly summary: string } | null {
  const sectionStart = findPrioritySectionStart(lines);
  if (sectionStart < 0) return null;
  for (let i = sectionStart + 1; i < lines.length; i++) {
    const line = (lines[i] ?? '').trim();
    if (!line) continue;
    // Stop at the next H2 (sibling section) but allow `### …` and
    // `#### …` subheadings inside (e.g. `### 🔴 HIGH PRIORITY` between
    // the section header and the first list item).
    if (/^##(?!#)/.test(line)) return null;
    const candidate = extractPriorityFindingItem(lines, i);
    if (candidate) return candidate;
  }
  return null;
}

/**
 * Story-keyword tokens used by `## Lead Story:` / `## Story N:` /
 * `## Trigger N:` H2 heading detection. Kept as a runtime list so the
 * regex stays bounded and bypasses the unsafe-regex lint by avoiding
 * deep alternation.
 */
const H2_STORY_TOKENS: readonly string[] = [
  'Lead Story',
  'Story',
  'Trigger',
  'Alert',
  'Judgement',
  'Judgment',
];

/**
 * Strategy 2 — walk every `## …` H2 heading and try to recognise a
 * story-style heading (`## 📌 Lead Story: Russia Accountability`,
 * `## Story 1 — DMA Enforcement`). Used as a fallback when no priority
 * section was found, because motions briefs publish each lead story as
 * its own H2 without a parent section.
 *
 * @param lines - Body lines (already split on `\n`)
 * @returns `{headline, summary}` when a story heading was identified
 */
function scanH2StoryHeadings(
  lines: readonly string[]
): { readonly headline: string; readonly summary: string } | null {
  for (let i = 0; i < lines.length; i++) {
    const line = (lines[i] ?? '').trim();
    if (!line.startsWith('## ')) continue;
    const headingText = line.replace(/^##\s+/u, '');
    const storyHeadline = extractH2StoryHeadline(headingText);
    if (!storyHeadline) continue;
    const result = buildPriorityResult(storyHeadline, '', lines, i);
    if (result?.headline) return result;
  }
  return null;
}

/**
 * Recognise the H2-story shape (`📌 Lead Story: Title`, `Story 1 —
 * Title`, `Trigger 2: Title`) and return the residual headline portion.
 * Returns an empty string when the heading does not match a story
 * keyword. Implemented as discrete string operations (rather than one
 * dense regex) to keep the function under the unsafe-regex linter and
 * cognitive-complexity budgets.
 *
 * @param headingText - Heading text with the leading `## ` already removed
 * @returns Residual headline or empty string
 */
function extractH2StoryHeadline(headingText: string): string {
  // Strip a short leading decoration / emoji block (up to 4 non-alphanumerics).
  const stripped = headingText.replace(/^[^A-Za-z0-9]{0,4}\s*/u, '');
  for (const token of H2_STORY_TOKENS) {
    if (!stripped.toLowerCase().startsWith(token.toLowerCase())) continue;
    let rest = stripped.slice(token.length).trim();
    // `Story 1` / `Trigger 2` — accept and consume the trailing digit.
    if (token !== 'Lead Story') {
      const digit = rest.match(/^\d+\b/u);
      if (!digit) continue;
      rest = rest.slice(digit[0].length).trim();
    }
    // Require an explicit `:` / `—` / `–` / `-` / `.` separator before
    // the residual headline so plain prose H2s never match.
    const sep = rest.match(/^[:—–\-.]\s+(.+)$/u);
    if (sep?.[1]) return sep[1].trim();
  }
  return '';
}

/**
 * Locate the line index of the first priority-finding section heading
 * inside an artefact body. Returns `-1` when no such heading exists.
 *
 * @param lines - Body lines (already split on `\n`)
 * @returns Line index of the `## …` heading, or `-1`
 */
function findPrioritySectionStart(lines: readonly string[]): number {
  for (let i = 0; i < lines.length; i++) {
    const line = (lines[i] ?? '').trim();
    const match = line.match(/^#{2,4}\s+(.+)$/u);
    if (!match) continue;
    const text = normaliseHeadingText(match[1] ?? '');
    if (!text) continue;
    if (headingMatchesPriorityProbe(text)) return i;
  }
  return -1;
}

/**
 * Word-boundary substring matcher for the priority-finding section
 * detector. Extracted from {@link findPrioritySectionStart} to keep its
 * cognitive complexity within budget.
 *
 * @param text - Heading text already normalised by {@link normaliseHeadingText}
 * @returns `true` when one of {@link PRIORITY_FINDING_SECTION_HEADINGS}
 *   appears as a word-bounded substring of {@link text}
 */
function headingMatchesPriorityProbe(text: string): boolean {
  for (const probe of PRIORITY_FINDING_SECTION_HEADINGS) {
    if (text === probe) return true;
    const idx = text.indexOf(probe);
    if (idx < 0) continue;
    const before = idx === 0 ? ' ' : (text[idx - 1] ?? ' ');
    const after = text[idx + probe.length] ?? ' ';
    if (!/[A-Za-z0-9]/.test(before) && !/[A-Za-z0-9]/.test(after)) return true;
  }
  return false;
}

/**
 * Try to recognise a priority-finding item starting at {@link i}. Returns
 * the resolved `{headline, summary}` pair when the item matches one of the
 * three authoring patterns; returns `null` otherwise so the caller can
 * advance to the next line.
 *
 * @param lines - Body lines (already split on `\n`)
 * @param i - Index of the candidate line
 * @returns Priority-finding pair when matched, `null` otherwise
 */
function extractPriorityFindingItem(
  lines: readonly string[],
  i: number
): { readonly headline: string; readonly summary: string } | null {
  const line = (lines[i] ?? '').trim();
  // Pattern A — numbered list item with bold title:
  //   `1. **Digital Markets Act Enforcement** (TA-10-2026-0160, 2026-04-30)`
  const numberedBold = line.match(/^\d+\.\s+\*\*([^*]+?)\*\*\s*(.*)$/u);
  if (numberedBold) {
    return buildPriorityResult(numberedBold[1] ?? '', numberedBold[2] ?? '', lines, i);
  }
  // Pattern B — numbered subheading. Requires an explicit separator
  // (`:` / `.` / `)` / `·` / `–` / `—` / `-`) after the number so
  // dotted decimal section labels like `### 2.1 Close to Adoption`
  // do NOT leak into the headline. Examples:
  //   `### 1. Clean Industrial Deal Implementation (ITRE/ENVI)`
  //   `### 1 · Headline Judgements` (middle dot)
  //   `### KJ-1: Digital Regulation Enforcement …`
  //   `### KF-3: Banking Union Completion`
  //   `### T-2: DMA Enforcement Resolution`
  // Two narrow patterns instead of one wide alternation to keep the
  // pattern within the unsafe-regex linter's complexity budget.
  const numericHeading = line.match(/^#{3,4}\s+\d+[:.)·–—\s-]\s*(.+)$/u);
  if (numericHeading) {
    return buildPriorityResult(numericHeading[1] ?? '', '', lines, i);
  }
  const tagHeading = line.match(/^#{3,4}\s+[A-Z]{1,3}-?\d+[:.)·–—\s-]\s*(.+)$/u);
  if (tagHeading) {
    return buildPriorityResult(tagHeading[1] ?? '', '', lines, i);
  }
  // Pattern D — word-prefixed subheading (`### Alert 1 — Title 🔴`,
  // `### Judgement 1 — Title`, `### Trigger 1: DMA Enforcement`):
  const wordTaggedHeading = line.match(
    /^#{3,4}\s+(?:Alert|Judgement|Judgment|Finding|Story|Item|Trigger|Highlight|Dossier|Priority|Top)\s+\d+\s*[:.)·–—\s-]+(.+)$/iu
  );
  if (wordTaggedHeading) {
    return buildPriorityResult(wordTaggedHeading[1] ?? '', '', lines, i);
  }
  // Pattern C — bold-leading paragraph trigger:
  //   `**Trigger 1: DMA Enforcement Resolution** (TA-10-2026-0160)`
  //   `**Digital Markets Act Enforcement**`
  // Rejected when:
  //   - the bold body is longer than a plausible headline (>110 chars) —
  //     that's a bold paragraph lede masquerading as a headline (e.g.
  //     `**This period captures the April 2026 Strasbourg …**`)
  //   - the bold body is a metadata key (`**Admiralty Grade: B/2**`,
  //     `**Reporting Window:** …`, `**Date:** …`) — these are banner
  //     rows, not editorial headlines
  const boldOnly = line.match(/^\*\*([^*]+?)\*\*\s*(.*)$/u);
  if (boldOnly && !line.startsWith('**Confidence') && !isMetadataBoldLine(line)) {
    const candidate = (boldOnly[1] ?? '').trim();
    if (candidate.length > 0 && candidate.length <= 110) {
      return buildPriorityResult(candidate, boldOnly[2] ?? '', lines, i);
    }
  }
  return null;
}

/**
 * Bold prefix tokens that indicate a metadata banner row rather than an
 * editorial headline. The Stage-B brief template uses these consistently
 * as the lede block (`**Reporting Window:** 3 Apr – 1 May 2026`,
 * `**Admiralty Grade:** B/2`, `**Date:** 2026-05-15`); they must never
 * leak into `<title>`.
 */
const PRIORITY_METADATA_BOLD_PREFIXES: readonly string[] = [
  'admiralty',
  'classification',
  'confidence',
  'data sources',
  'data quality',
  'date',
  'generated',
  'lead author',
  'methodology',
  'reporting window',
  'run',
  'session',
  'source',
  'sources',
  'time horizon',
  'wep',
];

/**
 * Recognise a metadata-banner bold line (`**Admiralty Grade: B/2**`,
 * `**Reporting Window:** 3 Apr – 1 May 2026`). The check is
 * deliberately case-insensitive and tolerant of trailing colons inside
 * or outside the bold delimiters.
 *
 * @param line - Trimmed source line (already known to start with `**`)
 * @returns `true` when the line is a metadata banner that must be
 *   skipped by Pattern C
 */
function isMetadataBoldLine(line: string): boolean {
  const inner = line
    .replace(/^\*\*([^*]+?)\*\*.*$/u, '$1')
    .trim()
    .toLowerCase();
  for (const prefix of PRIORITY_METADATA_BOLD_PREFIXES) {
    if (inner === prefix) return true;
    if (inner.startsWith(`${prefix}:`)) return true;
    if (inner.startsWith(`${prefix} `) && inner.includes(':')) return true;
    if (inner.startsWith(`${prefix}—`) || inner.startsWith(`${prefix} —`)) return true;
  }
  return false;
}

/**
 * Compose the `{headline, summary}` pair for one matched priority-finding
 * item. Cleans `Trigger N:` / `N.` prefixes off the headline, strips the
 * trailing `(TA-10-…, …)` / `(ITRE/ENVI)` metadata, and gathers the
 * following prose lines as the summary.
 *
 * @param rawHeadline - Raw bold title or numbered-heading text
 * @param tail - Same-line trailing text (after the bold close / heading)
 * @param lines - Body lines (already split on `\n`)
 * @param i - Index of the matched line
 * @returns Cleaned `{headline, summary}` — headline may be empty when
 *   cleaning collapses it below a minimum length, in which case the
 *   caller falls through
 */
function buildPriorityResult(
  rawHeadline: string,
  tail: string,
  lines: readonly string[],
  i: number
): { readonly headline: string; readonly summary: string } | null {
  const cleaned = cleanPriorityHeadline(rawHeadline);
  if (cleaned.length < 5) return null;
  const summaryLines = collectPrioritySummaryLines(tail, lines, i);
  const summary = truncateDescription(summaryLines.join(' '));
  return { headline: cleaned, summary };
}

/**
 * Decide whether a follow-up line is a hard stop for priority-finding
 * summary gathering (next heading / next list item) — collapses three
 * boolean checks out of {@link buildPriorityResult}'s main loop.
 *
 * @param line - Trimmed follow-up line
 * @returns `true` when the gathering loop must break
 */
function isPrioritySummaryStopper(line: string): boolean {
  if (/^#{1,6}\s/.test(line)) return true;
  if (/^\d+\.\s/.test(line)) return true;
  if (/^[-*]\s/.test(line)) return true;
  return false;
}

/**
 * Gather the summary prose for a priority-finding item — the same-line
 * tail (with leading procedure-code parens stripped) plus subsequent
 * prose lines until a blank line / new heading / new bullet is hit.
 *
 * @param tail - Same-line text that trails the bold/heading
 * @param lines - Full body lines
 * @param i - Index of the matched headline line
 * @returns Ordered list of summary segments (already clean)
 */
function collectPrioritySummaryLines(
  tail: string,
  lines: readonly string[],
  i: number
): readonly string[] {
  const summaryLines: string[] = [];
  // Strip leading parens-metadata (`(TA-10-2026-0160, 2026-04-30)`) and
  // trailing parens-metadata from the tail so the summary starts with
  // editorial prose, not a procedure-code citation.
  let tailText = stripInlineMarkdown(tail).trim();
  tailText = tailText.replace(/^\([^()]{3,80}\)\s*/u, '');
  tailText = stripPriorityTailMetadata(tailText).trim();
  if (tailText) summaryLines.push(tailText);
  for (let j = i + 1; j < lines.length; j++) {
    const next = (lines[j] ?? '').trim();
    if (!next) {
      if (summaryLines.length > 0) break;
      continue;
    }
    if (isPrioritySummaryStopper(next)) break;
    if (next.startsWith('**Confidence') || next.startsWith('- **Confidence')) continue;
    if (shouldSkipDescriptionLine(next)) continue;
    summaryLines.push(stripInlineMarkdown(next));
    if (summaryLines.join(' ').length >= DESCRIPTION_MAX_LENGTH) break;
  }
  return summaryLines;
}

/**
 * Normalise a priority-finding headline: drop the
 * `Trigger N:` / `Dossier N:` / leading-numeric prefix, strip trailing
 * parenthesised metadata (`(TA-10-2026-0160, 2026-04-30)`,
 * `(ITRE/ENVI)`), and trim residual punctuation. The result is a
 * headline-shaped string suitable for `<title>` use.
 *
 * @param raw - Raw bold-title or heading text
 * @returns Cleaned headline (may be empty after stripping)
 */
/**
 * Leading priority-label tokens stripped by {@link cleanPriorityHeadline}
 * (`🔴 CRITICAL — Title` → `Title`). Kept as a list to bypass the
 * unsafe-regex lint by avoiding deep alternation in a single pattern.
 */
const PRIORITY_LABEL_TOKENS: readonly string[] = [
  'CRITICAL',
  'HIGH PRIORITY',
  'HIGH',
  'MEDIUM PRIORITY',
  'MEDIUM',
  'LOW PRIORITY',
  'LOW',
  'URGENT',
  'ALERT',
  'PRIORITY',
];

/**
 * Trailing confidence-marker tokens stripped by
 * {@link cleanPriorityHeadline}. Same rationale as
 * {@link PRIORITY_LABEL_TOKENS}.
 */
const PRIORITY_TRAILING_TOKENS: readonly string[] = [
  'CRITICAL',
  'HIGH PRIORITY',
  'HIGH',
  'MEDIUM PRIORITY',
  'MEDIUM',
  'LOW PRIORITY',
  'LOW',
];

/**
 * Leading editorial-prefix tokens stripped by
 * {@link cleanPriorityHeadline} (`Trigger 1: Title` → `Title`).
 */
const PRIORITY_LEADING_PREFIX_TOKENS: readonly string[] = [
  'Trigger',
  'Dossier',
  'Priority',
  'Finding',
  'Item',
  'Highlight',
  'Top',
  'Story',
  'Alert',
  'Judgement',
  'Judgment',
];

/**
 * Strip a leading priority decoration (`🔴 `, `CRITICAL — `) from a
 * candidate headline. Extracted from {@link cleanPriorityHeadline} to
 * keep cognitive complexity within budget.
 *
 * @param text - Candidate headline (already trimmed)
 * @returns Headline with the leading decoration removed
 */
function stripPriorityLeadingDecoration(text: string): string {
  let out = text;
  for (let pass = 0; pass < 2; pass++) {
    out = out.replace(/^[^\p{L}\p{N}]+/u, '').trim();
    for (const token of PRIORITY_LABEL_TOKENS) {
      if (out.toLowerCase().startsWith(token.toLowerCase())) {
        const rest = out.slice(token.length).trim();
        const sep = rest.match(/^[:—–-]\s*(.+)$/u);
        if (sep?.[1]) {
          out = sep[1].trim();
          break;
        }
      }
    }
  }
  return out;
}

/**
 * Strip a leading editorial prefix (`Trigger 1: `, `Dossier 2: `) and a
 * stray leading ordinal (`1. `, `2.1 `) from a candidate headline.
 *
 * @param text - Candidate headline
 * @returns Headline with the leading editorial decoration removed
 */
function stripPriorityLeadingPrefix(text: string): string {
  let out = text;
  for (const token of PRIORITY_LEADING_PREFIX_TOKENS) {
    if (!out.toLowerCase().startsWith(token.toLowerCase())) continue;
    const rest = out.slice(token.length);
    const match = rest.match(/^\s+\d+\s*[:–—-]\s*(.+)$/u);
    if (match?.[1]) {
      out = match[1];
      break;
    }
  }
  // Drop a stray leading "1. " / "2) " ordinal.
  out = out.replace(/^\d+[.):·\s]\s*/u, '');
  return out;
}

/**
 * Strip a trailing confidence marker (`🔴 CRITICAL`, `🟡 MEDIUM`) from a
 * candidate headline. Single pass — caller invokes inside a fixed-point
 * loop.
 *
 * @param text - Candidate headline
 * @returns Headline with the trailing confidence marker removed
 */
function stripPriorityTrailingMarker(text: string): string {
  let out = text;
  for (const token of PRIORITY_TRAILING_TOKENS) {
    const pattern = new RegExp(`\\s+[^\\p{L}\\p{N}\\s]?\\s*${token}\\s*$`, 'iu');
    const next = out.replace(pattern, '');
    if (next !== out) {
      out = next;
      break;
    }
  }
  return out;
}

function cleanPriorityHeadline(raw: string): string {
  let text = stripInlineMarkdown(raw).trim();
  text = stripPriorityLeadingDecoration(text);
  text = stripPriorityLeadingPrefix(text);
  // Trailing cleanup runs in a fixed-point loop so combined patterns
  // like "Title (Confidence, 80%): 🔴" collapse all the way down to
  // "Title".
  let previous = '';
  while (previous !== text) {
    previous = text;
    text = stripPriorityTrailingMarker(text);
    text = stripPriorityTailMetadata(text);
    // Drop a single trailing emoji left after metadata stripping.
    text = text.replace(/\s+[^\p{L}\p{N}\s]+\s*$/u, '');
    // Drop trailing colons / dashes left over.
    text = text.replace(/[\s:—–-]+$/u, '');
    text = text.trim();
  }
  return text;
}

/**
 * Strip the trailing parenthesised metadata that briefs append to every
 * priority-finding name — procedure codes, dates, committee tags. The
 * regex is intentionally non-greedy so it removes only the LAST
 * parenthesised group on the line.
 *
 * @param text - Headline or paragraph text
 * @returns Text with the trailing `(…)` stripped
 */
function stripPriorityTailMetadata(text: string): string {
  return text.replace(/\s*\([^()]{3,80}\)\s*$/u, '').trim();
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
  const day = parsed.getUTCDay();
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
  const month = parsed.getUTCMonth() + 1;
  if (year < EP10_START_YEAR) return `EP9 → ${EP10_START_YEAR}`;
  if (year < EP10_END_YEAR || (year === EP10_END_YEAR && month <= EP_ELECTION_MONTH)) {
    return `EP10 → ${EP10_END_YEAR}`;
  }
  if (year < EP11_END_YEAR || (year === EP11_END_YEAR && month <= EP_ELECTION_MONTH)) {
    return `EP11 → ${EP11_END_YEAR}`;
  }
  const yearsBeyond = year - EP11_END_YEAR;
  const offset = month <= EP_ELECTION_MONTH ? 0 : 1;
  const termsBeyond = Math.floor((yearsBeyond - 1 + offset) / 5) + 1;
  const termIndex = 11 + termsBeyond;
  const termEnd = EP11_END_YEAR + 5 * termsBeyond;
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
  if (year <= EP10_END_YEAR) return `EP10 → EP11 (${EP10_END_YEAR})`;
  if (year <= EP11_END_YEAR) return `EP11 → EP12 (${EP11_END_YEAR})`;
  const cyclesBeyond = Math.ceil((year - EP11_END_YEAR) / 5);
  const electionYear = EP11_END_YEAR + 5 * cyclesBeyond;
  const out = 11 + cyclesBeyond;
  return `EP${out} → EP${out + 1} (${electionYear})`;
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
  if (typeof value === 'string') return value.trim();
  if (!value) return '';
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

  let artefactSummary = '';
  if (runDir) {
    const highlight = extractArtifactHighlight(runDir, articleType, date);
    if (highlight?.headline) {
      return {
        headline: highlight.headline,
        summary: highlight.summary,
      };
    }
    if (highlight?.summary) {
      artefactSummary = highlight.summary;
    }
  }

  const aggregatedH1 = extractFirstH1(markdown);
  const aggregatedSummary = extractStrongProseLine(markdown);
  if (aggregatedH1 && !isGenericHeading(aggregatedH1, articleType, date)) {
    return {
      headline: truncateTitle(aggregatedH1),
      summary: artefactSummary || aggregatedSummary,
    };
  }

  const summary = artefactSummary || aggregatedSummary;
  if (summary) {
    // The H1 is generic (category-noun, bare-institutional, or
    // template-style) so we have to derive `<title>` from the BLUF/
    // lede paragraph. Extract the first complete sentence so the
    // resulting title is grammatically self-contained — falling back
    // to clause-boundary truncation downstream when the sentence
    // itself overruns TITLE_MAX_LENGTH.
    const firstSentence = extractFirstSentence(summary);
    return { headline: truncateTitle(firstSentence), summary };
  }

  return { headline: '', summary: '' };
}

/**
 * Pick the per-language SEO title from the resolved editorial pair and
 * the localized template fallback. The decision tree mirrors the priority
 * ladder in the module header:
 *
 *   - When an editorial headline exists (either translated brief or
 *     English brief / aggregated source), use it **verbatim** — no
 *     concatenation with the localized type/date template. Concatenation
 *     historically produced strings like
 *     `Senaste Nytt: Betydande Parlamentariska Händelser — 2026-05-15 — Breaking News: EP April 2026 Plenary Outcomes`
 *     which mix two languages in a single `<title>` and are blocked by
 *     `scripts/validate-manifest-seo.js`'s `english-fallthrough` gate.
 *   - When no editorial headline exists at all, fall back to the
 *     localized type/date template plus a run qualifier so same-type pages
 *     remain distinguishable.
 *
 * @param fallbackTitle - Localized article-type template title
 * @param editorialHeadline - Editorial headline (localized or English)
 * @param runId - Optional run id used only when no editorial headline exists
 * @returns SEO title candidate
 */
function composeContextualTitle(
  fallbackTitle: string,
  editorialHeadline: string,
  runId: string
): string {
  if (editorialHeadline) return editorialHeadline;
  return withRunQualifier(fallbackTitle, runId);
}

/**
 * Add localized article context to short or duplicate-prone meta
 * descriptions. This turns generic type-level subtitles into
 * page-specific descriptions suitable for search snippets.
 *
 * Internal artefact identifiers (`runId`) are deliberately NOT included
 * in the description: they leak into Google snippets as opaque tokens
 * like `breaking-run255-1778894853` and provide no value to readers.
 * The verbose `evidence` boilerplate (`with source-linked voting,
 * committee and legislative intelligence`) is also dropped — it pads
 * bytes without adding editorial information and was the dominant
 * source of mid-sentence ellipsis truncation observed in production.
 *
 * The reader-hint suffix (`labels.reader`) is preserved because it
 * supplies a stable localized intent signal even when the lede is
 * very short.
 *
 * @param lang - Target language code
 * @param baseDescription - Best description from manifest/editorial/template
 * @param editorial - Artifact-derived headline and summary
 * @param editorial.headline - Artifact-derived headline
 * @param editorial.summary - Artifact-derived summary
 * @param date - ISO article date
 * @param _runId - Reserved (formerly emitted; no longer used)
 * @returns Description in the target language context, capped for SEO snippets
 */
function composeContextualDescription(
  lang: LanguageCode,
  baseDescription: string,
  editorial: { readonly headline: string; readonly summary: string },
  date: string,
  _runId: string
): string {
  const labels = getLocalizedString(SEO_CONTEXT_LABELS, lang);
  const parts = [baseDescription.trim()];
  parts.push(`${labels.date} ${date}.`);
  const context = pickFirstNonEmpty([editorial.summary, editorial.headline]);
  if (context && !containsNormalized(parts[0] ?? '', context)) {
    parts.push(`${labels.context}: ${context}`);
  }
  parts.push(labels.reader);
  return truncateDescription(parts.join(' '));
}

/**
 * Append a short run qualifier to otherwise duplicate-prone fallback
 * titles. Sanitizes the raw `runId` (which is an internal artefact
 * identifier of the shape `<slug>-run<N>[-<unix-ts>]`) so user-facing
 * `<title>` strings never expose Unix timestamps or the full opaque
 * token. Only the short ordinal `N` is retained.
 *
 * Examples:
 * - `breaking-run255-1778894853` → `Run 255`
 * - `committee-reports-run330-1778735854` → `Run 330`
 * - `breaking-run-001` → `Run 001`
 *
 * When the runId does not match the canonical shape, the qualifier is
 * omitted entirely rather than leak an unknown-format token into SEO
 * surfaces.
 *
 * @param title - Base title
 * @param runId - Optional run id (sanitized before use)
 * @returns Title with short run qualifier, or unchanged when sanitization fails
 */
function withRunQualifier(title: string, runId: string): string {
  if (!runId) return title;
  // Walk segments backwards: find the last `run<digits>` token. The
  // runId shape is `<slug>-run<N>[-<unix-ts>]` — we explicitly avoid a
  // single regex with overlapping `\d+` groups, which the SonarJS
  // unsafe-regex rule flags as catastrophic-backtracking-prone.
  const segments = runId.split('-');
  for (const seg of segments) {
    const m = /^run(\d+)$/u.exec(seg);
    if (m) return `${title} — Run ${m[1]}`;
    const m2 = /^run$/u.exec(seg);
    if (m2) {
      const idx = segments.indexOf(seg);
      const next = segments[idx + 1];
      if (next && /^\d+$/u.test(next)) return `${title} — Run ${next}`;
    }
  }
  return title;
}

/**
 * Case-insensitive containment check after whitespace normalization.
 *
 * @param haystack - Text to search
 * @param needle - Text to locate
 * @returns True when `needle` is already present in `haystack`
 */
function containsNormalized(haystack: string, needle: string): boolean {
  const cleanHaystack = haystack.toLowerCase().replace(/\s+/g, ' ');
  const cleanNeedle = needle.toLowerCase().replace(/\s+/g, ' ');
  return cleanNeedle.length > 0 && cleanHaystack.includes(cleanNeedle);
}

/**
 * Build a stable, localized keyword list from the article type plus the
 * resolved title/description context.
 *
 * @param lang - Target language code
 * @param articleType - Article type slug
 * @param date - ISO article date
 * @param runId - Optional run id
 * @param title - Resolved title
 * @param description - Resolved description
 * @returns De-duplicated keywords for `<meta name="keywords">`
 */
export function buildSeoKeywords(
  lang: LanguageCode,
  articleType: string,
  date: string,
  runId: string,
  title: string,
  description: string
): readonly string[] {
  const localized = getLocalizedString(LOCALIZED_KEYWORDS, lang);
  const base = Object.getOwnPropertyDescriptor(localized, articleType)?.value as
    | readonly string[]
    | undefined;
  const fallback = ['EU Parliament', 'European Parliament', 'political intelligence'];
  const candidates = [
    ...(base ?? fallback),
    humanizeSlug(articleType),
    date,
    ...(runId ? [`run ${runId}`] : []),
    ...extractKeywordTerms(`${title} ${description}`),
  ];
  return dedupeKeywords(candidates).slice(0, 16);
}

/**
 * Extract short keyword terms from resolved SEO copy.
 *
 * @param text - Title and description text
 * @returns Candidate terms
 */
function extractKeywordTerms(text: string): string[] {
  return text
    .split(/[^\p{L}\p{N}]+/u)
    .map((token) => token.trim())
    .filter((token) => token.length >= 4 && !/^\d+$/.test(token))
    .slice(0, 18);
}

/**
 * De-duplicate keywords case-insensitively while preserving original order.
 *
 * @param candidates - Raw keyword candidates
 * @returns De-duplicated keyword list
 */
function dedupeKeywords(candidates: readonly string[]): string[] {
  const seen = new Set<string>();
  const out: string[] = [];
  for (const candidate of candidates) {
    const trimmed = candidate.trim();
    if (!trimmed) continue;
    const key = trimmed.toLowerCase();
    if (seen.has(key)) continue;
    seen.add(key);
    out.push(trimmed);
  }
  return out;
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
  const englishEditorial = resolveEditorialContent(opts);
  const template = buildTemplateFallback(opts.articleType, opts.date, manifest.committee);
  const runId = manifest.runId?.trim() ?? '';

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
 * resolver's per-language loop body free of long argument lists and keeps
 * the SonarJS cognitive-complexity budget for `resolveArticleMetadata`
 * within target.
 */
interface PerLanguageInputs {
  readonly lang: LanguageCode;
  readonly manifest: MetadataManifest;
  readonly englishEditorial: { readonly headline: string; readonly summary: string };
  readonly template: LangTitleSubtitle;
  readonly runDir?: string | undefined;
  readonly articleType: string;
  readonly date: string;
  readonly runId: string;
}

/**
 * Resolve `{title, description, keywords, source}` for one language. The
 * priority ladder is:
 *
 *   1. manifest override (per-language wins, then string fall-through)
 *   2. localized executive brief (`executive-brief_<lang>.md`) headline +
 *      summary — only for non-English `<lang>`
 *   3. English executive brief / aggregated editorial — verbatim for
 *      non-English locales that have no translated brief yet, so the
 *      SEO surfaces never collapse to a boring type/date template while a
 *      real editorial highlight exists
 *   4. localized template fallback
 *
 * @param input - Per-language inputs
 * @returns One resolved metadata entry
 */
function resolveOneLanguage(input: PerLanguageInputs): ResolvedMetadataEntry {
  const manifestTitle = manifestOverrideFor(input.manifest.title, input.lang);
  const manifestDescription = manifestOverrideFor(input.manifest.description, input.lang);

  const perLanguage = resolvePerLanguageEditorial(input);
  const editorial = perLanguage.editorial;

  const contextualTitle = composeContextualTitle(
    input.template.title,
    editorial.headline,
    input.runId
  );
  const title = pickFirstNonEmpty([manifestTitle, contextualTitle, input.template.title]);

  const rawDescription = pickFirstNonEmpty([
    manifestDescription,
    editorial.summary,
    input.template.subtitle,
  ]);

  const description =
    rawDescription.length >= ENRICHMENT_TRIGGER_LENGTH
      ? rawDescription
      : composeContextualDescription(
          input.lang,
          rawDescription,
          editorial,
          input.date,
          input.runId
        );

  const truncatedTitle = truncateTitle(title);
  const truncatedDescription = truncateDescription(description);

  const source: ResolvedMetadataEntry['source'] =
    manifestTitle || manifestDescription ? 'manifest' : perLanguage.source;

  return {
    title: truncatedTitle,
    description: truncatedDescription,
    keywords: buildSeoKeywords(
      input.lang,
      input.articleType,
      input.date,
      input.runId,
      truncatedTitle,
      truncatedDescription
    ),
    source,
  };
}

/**
 * Select the editorial `{headline, summary}` pair for one language,
 * preferring the translated `executive-brief_<lang>.md` over the English
 * brief. Records which tier provided the content so the caller can wire
 * up the editorial fallback note and the manifest-SEO validator without
 * re-scanning the run directory.
 *
 * - For `lang === 'en'`: always returns the English `englishEditorial`
 *   pair (whose source is the canonical English brief / aggregated
 *   Markdown / artefact ladder in {@link resolveEditorialContent}).
 * - For non-English `<lang>`: probes `runDir` for
 *   `executive-brief_<lang>.md` (and the `extended/` sibling) and
 *   prefers its headline + lede. Falls through to the English editorial
 *   when no translated brief exists.
 *
 * @param input - Per-language inputs
 * @returns Editorial pair plus the tier that produced it
 */
function resolvePerLanguageEditorial(input: PerLanguageInputs): {
  readonly editorial: { readonly headline: string; readonly summary: string };
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
      // Prefer the localized headline; if missing, allow the localized
      // summary to drive the title via {@link composeContextualTitle}'s
      // `editorialHeadline || fallbackTitle` path while still feeding the
      // localized summary into the description.
      return {
        editorial: {
          headline: localized.headline,
          summary: localized.summary,
        },
        source: 'localized-brief',
      };
    }
  }
  // No localized brief — fall through to the English editorial pair.
  if (input.englishEditorial.headline || input.englishEditorial.summary) {
    return {
      editorial: input.englishEditorial,
      source: input.lang === 'en' ? 'english-editorial' : 'english-brief',
    };
  }
  // Nothing editorial at all → caller will fall back to the localized
  // template.
  return {
    editorial: { headline: '', summary: '' },
    source: 'template',
  };
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
