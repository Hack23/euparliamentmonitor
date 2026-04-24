// SPDX-FileCopyrightText: 2024-2026 Hack23 AB
// SPDX-License-Identifier: Apache-2.0

/**
 * @module Utils/ContentMetadata
 * @description Content-based metadata analysis for articles.
 *
 * Analyses the **rendered article HTML** to extract insightful titles,
 * descriptions, and keywords.  This runs *after* {@link buildContent}
 * produces the article body so that metadata truly reflects what the
 * reader will see — not mechanical counts from the raw data payload.
 *
 * The analysis extracts:
 * - Headings (h2/h3) as topic indicators
 * - The lede paragraph for a content-based description
 * - Key statistics (numbers, percentages) for title highlights
 * - Entity names (committees, legislation titles) for keywords
 * - Section counts for a structural overview
 */

import type { ArticleMetadata } from '../types/index.js';

/** Maximum length for the enriched description */
const MAX_DESCRIPTION_LENGTH = 200;

/**
 * Minimum position (as fraction of MAX_DESCRIPTION_LENGTH) for a
 * sentence-boundary truncation point.  If the last sentence break
 * is before this threshold, we fall back to hard truncation with `...`.
 * This ensures the truncated description retains at least half its
 * intended content.
 */
const MIN_SENTENCE_TRUNCATION_RATIO = 0.5;

/** Maximum number of keywords to emit */
const MAX_KEYWORDS = 15;

/** Minimum heading length to include as keyword */
const MIN_HEADING_KEYWORD_LENGTH = 4;

/** Maximum heading length to include as keyword */
const MAX_HEADING_KEYWORD_LENGTH = 80;

/**
 * Strip HTML tags and decode common HTML entities to plain text.
 *
 * @param html - HTML string
 * @returns Plain-text string
 */
function stripHtml(html: string): string {
  return html
    .replace(/<[^>]+>/gu, ' ')
    .replace(/&lt;/gu, '<')
    .replace(/&gt;/gu, '>')
    .replace(/&quot;/gu, '"')
    .replace(/&#39;/gu, "'")
    .replace(/&mdash;/gu, '\u2014')
    .replace(/&ndash;/gu, '\u2013')
    .replace(/&amp;/gu, '&')
    .replace(/\s+/gu, ' ')
    .trim();
}

/**
 * Extract all h2 and h3 heading texts from article content.
 *
 * @param content - Article HTML body
 * @returns Array of heading text strings
 */
function extractHeadings(content: string): string[] {
  const headingRegex = /<h([23])\b[^>]*>([\s\S]*?)<\/h\1>/giu;
  const headings: string[] = [];
  let match: RegExpExecArray | null = headingRegex.exec(content);
  while (match) {
    const text = stripHtml(match[2] ?? '').trim();
    if (text.length > 0) headings.push(text);
    match = headingRegex.exec(content);
  }
  return headings;
}

/**
 * Extract the lede from article content as a plain-text description base.
 *
 * Prefers a <p class="lede">...</p>, then a <section class="lede">...</section>
 * (using its first paragraph or full text), and finally falls back to
 * the first <p> in the content if no lede-specific markup is found.
 *
 * @param content - Article HTML body
 * @returns Plain-text lede string, or empty string
 */
function extractLede(content: string): string {
  // Try explicit lede paragraph first: <p class="lede">...</p>
  const ledeParagraphMatch = /<p[^>]*class="[^"]*\blede\b[^"]*"[^>]*>([\s\S]*?)<\/p>/iu.exec(
    content
  );
  if (ledeParagraphMatch?.[1]) {
    const text = stripHtml(ledeParagraphMatch[1]).trim();
    if (text.length > 20) return text;
  }

  // Try section-based lede: <section class="lede"> ... <p>...</p> ... </section>
  const ledeSectionMatch =
    /<section[^>]*class="[^"]*\blede\b[^"]*"[^>]*>([\s\S]*?)<\/section>/iu.exec(content);
  if (ledeSectionMatch?.[1]) {
    const sectionParagraphMatch = /<p[^>]*>([\s\S]*?)<\/p>/iu.exec(ledeSectionMatch[1]);
    if (sectionParagraphMatch?.[1]) {
      const text = stripHtml(sectionParagraphMatch[1]).trim();
      if (text.length > 20) return text;
    }
    const sectionText = stripHtml(ledeSectionMatch[1]).trim();
    if (sectionText.length > 20) return sectionText;
  }

  // Fall back to first paragraph in article-content
  const paraMatch = /<p[^>]*>([\s\S]*?)<\/p>/iu.exec(content);
  if (paraMatch?.[1]) {
    const text = stripHtml(paraMatch[1]).trim();
    if (text.length > 20) return text;
  }

  return '';
}

/**
 * Extract key statistics (numbers with context) from article content.
 * Looks for patterns like "42 adopted texts", "85% pipeline health", etc.
 *
 * @param content - Article HTML body
 * @returns Array of statistic highlight strings
 */
function extractStatistics(content: string): string[] {
  const text = stripHtml(content);
  const stats: string[] = [];

  // Match "N adopted texts" / "N documents" / "N procedures" / "N events" etc.
  // Use a simple alternation list — no nested quantifiers.
  const countWords = [
    'adopted texts',
    'adopted text',
    'documents',
    'document',
    'procedures',
    'procedure',
    'events',
    'event',
    'votes',
    'vote',
    'questions',
    'question',
    'anomalies',
    'anomaly',
    'committees',
    'committee',
    'resolutions',
    'resolution',
    'MEPs',
    'MEP',
    'sessions',
    'session',
    'meetings',
    'meeting',
  ].join('|');
  const countPatterns = new RegExp(`(\\d+)\\s+(${countWords})`, 'giu');
  let match: RegExpExecArray | null = countPatterns.exec(text);
  while (match) {
    stats.push(`${match[1]} ${match[2]}`);
    match = countPatterns.exec(text);
  }

  // Match percentages — integer or decimal followed by %
  const pctPatterns = /(\d[\d.]*\d|\d)%/gu;
  match = pctPatterns.exec(text);
  while (match) {
    stats.push(`${match[1]}%`);
    match = pctPatterns.exec(text);
  }

  // Deduplicate
  return [...new Set(stats)].slice(0, 5);
}

/**
 * Extract content-derived keywords from headings and prominent terms.
 *
 * @param content - Article HTML body
 * @param baseKeywords - Keywords from the strategy (preserved)
 * @returns Deduplicated keyword array
 */
function extractContentKeywords(content: string, baseKeywords: readonly string[]): string[] {
  const keywords: string[] = [...baseKeywords];

  // Add headings as keywords
  const headings = extractHeadings(content);
  for (const h of headings) {
    if (h.length >= MIN_HEADING_KEYWORD_LENGTH && h.length <= MAX_HEADING_KEYWORD_LENGTH) {
      keywords.push(h);
    }
  }

  // Work against plain text for entity extraction to avoid false positives from markup
  const plainText = stripHtml(content);

  // Extract committee abbreviations (ENVI, ECON, AFET, etc.)
  const abbrRegex =
    /\b(ENVI|ECON|AFET|LIBE|AGRI|ITRE|IMCO|TRAN|REGI|PECH|CULT|JURI|BUDG|CONT|EMPL|INTA|DEVE|DROI|SEDE)\b/gu;
  let match: RegExpExecArray | null = abbrRegex.exec(plainText);
  while (match) {
    keywords.push(match[1] ?? '');
    match = abbrRegex.exec(plainText);
  }

  // Extract political group names
  const groupRegex = /\b(EPP|S&D|Renew|Greens\/EFA|ECR|The Left|ID|PfE)\b/gu;
  match = groupRegex.exec(plainText);
  while (match) {
    keywords.push(match[1] ?? '');
    match = groupRegex.exec(plainText);
  }

  return [...new Set(keywords)].slice(0, MAX_KEYWORDS);
}

/**
 * Patterns that indicate a heading is a generic section label (not
 * analytical content suitable for a title suffix).
 */
const GENERIC_HEADING_PATTERN =
  /^(introduction|overview|analysis|conclusion|summary|background|context|key\s+findings|methodology|data\s+sources|voting\s+records|parliamentary\s+questions|about|feed\s+health|analysis\s+pipeline|analysis\s+&\s+transparency|stakeholder|dashboard|pipeline\s+snapshot|political\s+intelligence|further\s+reading|related|appendix|table\s+of\s+contents|deep\s+analysis)/iu;

/**
 * Patterns indicating a heading contains analytical/political content
 * (e.g., specific legislation names, political dynamics, policy topics).
 */
const ANALYTICAL_HEADING_PATTERN =
  /(?:directive|regulation|resolution|reform|crisis|alliance|coalition|division|bloc|breakthrough|deadlock|amendment|trilogue|committee|parliament|council|commission|veto|mandate|sovereignty|trade|climate|digital|security|defense|defence|budget|migration|energy|sanctions|treaty|accession|withdrawal|election|referendum|impeach|censure|confidence|no.confidence)/iu;

/**
 * Build a content-aware title by extracting the most politically
 * significant heading or analytical finding from the article body.
 *
 * **Priority order** (per ai-driven-analysis-guide Rule 9):
 * 1. Analytical headings containing political/legislative substance
 * 2. Non-generic section headings with meaningful length
 * 3. Data statistics as a last resort only
 *
 * This ensures titles reflect AI-analysed political intelligence
 * rather than mechanical data counts like "5 Votes, 2 Anomalies".
 *
 * @param content - Article HTML body
 * @param baseTitle - Localized base title from the strategy
 * @returns Enriched title string
 */
function buildContentTitle(content: string, baseTitle: string): string {
  // If the strategy already appended a suffix (contains em-dash), do not double-suffix
  if (baseTitle.includes('—')) return baseTitle;

  const headings = extractHeadings(content);

  // Priority 1: Find a heading with real political/legislative substance
  const analyticalHeading = headings.find(
    (h) =>
      h.length > 12 &&
      h.length <= 80 &&
      ANALYTICAL_HEADING_PATTERN.test(h) &&
      !GENERIC_HEADING_PATTERN.test(h)
  );

  if (analyticalHeading) {
    return `${baseTitle} — ${analyticalHeading}`;
  }

  // Priority 2: Find any non-generic heading with meaningful length
  const topHeading = headings.find(
    (h) => h.length > 12 && h.length <= 80 && !GENERIC_HEADING_PATTERN.test(h)
  );

  if (topHeading) {
    return `${baseTitle} — ${topHeading}`;
  }

  // Priority 3 (last resort): Use a key statistic — but only when no
  // analytical heading is available
  const stats = extractStatistics(content);
  const topStat = stats[0];
  if (topStat) {
    return `${baseTitle} — ${topStat}`;
  }

  return baseTitle;
}

/**
 * Build a content-aware description by extracting the AI-written lede
 * paragraph from the article body.  The lede should contain the
 * political significance of the article content — not data counts.
 *
 * Falls back to the strategy-provided subtitle only when no
 * substantive lede paragraph is found.
 *
 * @param content - Article HTML body
 * @param baseSubtitle - Subtitle from the strategy as fallback
 * @returns SEO-friendly description string (≤ {@link MAX_DESCRIPTION_LENGTH} chars)
 */
function buildContentDescription(content: string, baseSubtitle: string): string {
  const lede = extractLede(content);
  if (lede.length > 30) {
    // Truncate at sentence boundary when possible for clean SEO descriptions
    if (lede.length > MAX_DESCRIPTION_LENGTH) {
      const truncated = lede.slice(0, MAX_DESCRIPTION_LENGTH - 3);
      // Find the last sentence boundary (period, exclamation, or question mark followed by space)
      const lastSentence = Math.max(
        truncated.lastIndexOf('. '),
        truncated.lastIndexOf('! '),
        truncated.lastIndexOf('? ')
      );
      if (lastSentence > MAX_DESCRIPTION_LENGTH * MIN_SENTENCE_TRUNCATION_RATIO) {
        return truncated.slice(0, lastSentence + 1);
      }
      return truncated + '...';
    }
    return lede;
  }
  return baseSubtitle;
}

/**
 * Enrich article metadata by analysing the rendered article content.
 *
 * This function is the main entry point — called by the generation pipeline
 * **after** {@link buildContent} produces the article HTML body but
 * **before** the HTML is wrapped in the full page template.
 *
 * It refines the strategy-provided base metadata with content-derived
 * insights so that titles, descriptions, and keywords reflect the
 * actual article coverage rather than generic template text.
 *
 * @param content - Rendered article HTML body (from strategy.buildContent)
 * @param baseMetadata - Base metadata from strategy.getMetadata
 * @returns Enriched metadata with content-aware title, description, and keywords
 */
export function enrichMetadataFromContent(
  content: string,
  baseMetadata: ArticleMetadata
): ArticleMetadata {
  const title = buildContentTitle(content, baseMetadata.title);
  const subtitle = buildContentDescription(content, baseMetadata.subtitle);
  const keywords = extractContentKeywords(content, baseMetadata.keywords);

  return {
    ...baseMetadata,
    title,
    subtitle,
    keywords,
  };
}
