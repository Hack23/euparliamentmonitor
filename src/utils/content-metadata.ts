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

import type { ArticleMetadata } from '../generators/strategies/article-strategy.js';

/** Maximum length for the enriched description */
const MAX_DESCRIPTION_LENGTH = 200;

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
  const headingRegex = /<h[23][^>]*>([^<]+)<\/h[23]>/giu;
  const headings: string[] = [];
  let match: RegExpExecArray | null = headingRegex.exec(content);
  while (match) {
    const text = stripHtml(match[1] ?? '').trim();
    if (text.length > 0) headings.push(text);
    match = headingRegex.exec(content);
  }
  return headings;
}

/**
 * Extract the lede (first paragraph with class="lede", or first <p>)
 * from article content as a plain-text description base.
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

  // Extract committee abbreviations (ENVI, ECON, AFET, etc.)
  const abbrRegex =
    /\b(ENVI|ECON|AFET|LIBE|AGRI|ITRE|IMCO|TRAN|REGI|PECH|CULT|JURI|BUDG|CONT|EMPL|INTA|DEVE|DROI|SEDE)\b/gu;
  let match: RegExpExecArray | null = abbrRegex.exec(content);
  while (match) {
    keywords.push(match[1] ?? '');
    match = abbrRegex.exec(content);
  }

  // Extract political group names
  const groupRegex = /\b(EPP|S&amp;D|S&D|Renew|Greens\/EFA|ECR|The Left|ID|PfE)\b/gu;
  match = groupRegex.exec(content);
  while (match) {
    keywords.push(match[1]?.replace(/&amp;/gu, '&') ?? '');
    match = groupRegex.exec(content);
  }

  return [...new Set(keywords)].slice(0, MAX_KEYWORDS);
}

/**
 * Build a content-aware title by analysing the article body for key
 * highlights and appending the most significant finding as a suffix.
 *
 * @param content - Article HTML body
 * @param baseTitle - Localized base title from the strategy
 * @returns Enriched title string
 */
function buildContentTitle(content: string, baseTitle: string): string {
  // If the strategy already appended a suffix (contains em-dash), do not double-suffix
  if (baseTitle.includes('—')) return baseTitle;

  const headings = extractHeadings(content);
  const stats = extractStatistics(content);

  // Build a suffix from the first meaningful statistic
  const topStat = stats[0];
  // Build a suffix from the first heading that isn't a generic section label
  const topHeading = headings.find(
    (h) =>
      h.length > 10 &&
      !/^(introduction|overview|analysis|conclusion|summary|background|context)/iu.test(h)
  );

  if (topStat && topHeading) {
    return `${baseTitle} — ${topStat}, ${topHeading}`;
  }
  if (topStat) {
    return `${baseTitle} — ${topStat}`;
  }
  if (topHeading) {
    return `${baseTitle} — ${topHeading}`;
  }

  return baseTitle;
}

/**
 * Build a content-aware description by extracting the lede paragraph
 * from the article body.  Falls back to the strategy-provided subtitle.
 *
 * @param content - Article HTML body
 * @param baseSubtitle - Subtitle from the strategy as fallback
 * @returns SEO-friendly description string (≤ {@link MAX_DESCRIPTION_LENGTH} chars)
 */
function buildContentDescription(content: string, baseSubtitle: string): string {
  const lede = extractLede(content);
  if (lede.length > 30) {
    return lede.length > MAX_DESCRIPTION_LENGTH
      ? lede.slice(0, MAX_DESCRIPTION_LENGTH - 3) + '...'
      : lede;
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
