// SPDX-FileCopyrightText: 2024-2026 Hack23 AB
// SPDX-License-Identifier: Apache-2.0
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
function stripHtml(html) {
    return html
        .replace(/<[^>]+>/gu, ' ')
        .replace(/&amp;/gu, '&')
        .replace(/&lt;/gu, '<')
        .replace(/&gt;/gu, '>')
        .replace(/&quot;/gu, '"')
        .replace(/&#39;/gu, "'")
        .replace(/&mdash;/gu, '—')
        .replace(/&ndash;/gu, '–')
        .replace(/\s+/gu, ' ')
        .trim();
}
/**
 * Extract all h2 and h3 heading texts from article content.
 *
 * @param content - Article HTML body
 * @returns Array of heading text strings
 */
function extractHeadings(content) {
    const headingRegex = /<h[23][^>]*>([^<]+)<\/h[23]>/giu;
    const headings = [];
    let match = headingRegex.exec(content);
    while (match) {
        const text = stripHtml(match[1] ?? '').trim();
        if (text.length > 0)
            headings.push(text);
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
function extractLede(content) {
    // Try class="lede" first — simple non-greedy match
    const ledeMatch = /class="lede"[^>]*>([^<]+)/iu.exec(content);
    if (ledeMatch?.[1]) {
        const text = stripHtml(ledeMatch[1]).trim();
        if (text.length > 20)
            return text;
    }
    // Fall back to first paragraph in article-content
    const paraMatch = /<p[^>]*>([^<]{20,})/iu.exec(content);
    if (paraMatch?.[1]) {
        return stripHtml(paraMatch[1]).trim();
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
function extractStatistics(content) {
    const text = stripHtml(content);
    const stats = [];
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
    let match = countPatterns.exec(text);
    while (match) {
        stats.push(`${match[1]} ${match[2]}`);
        match = countPatterns.exec(text);
    }
    // Match percentages — simple integer/decimal followed by %
    const pctPatterns = /(\d+)%/gu;
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
function extractContentKeywords(content, baseKeywords) {
    const keywords = [...baseKeywords];
    // Add headings as keywords
    const headings = extractHeadings(content);
    for (const h of headings) {
        if (h.length >= MIN_HEADING_KEYWORD_LENGTH && h.length <= MAX_HEADING_KEYWORD_LENGTH) {
            keywords.push(h);
        }
    }
    // Extract committee abbreviations (ENVI, ECON, AFET, etc.)
    const abbrRegex = /\b(ENVI|ECON|AFET|LIBE|AGRI|ITRE|IMCO|TRAN|REGI|PECH|CULT|JURI|BUDG|CONT|EMPL|INTA|DEVE|DROI|SEDE)\b/gu;
    let match = abbrRegex.exec(content);
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
function buildContentTitle(content, baseTitle) {
    // If the base title already contains a long suffix (from agentic override), keep it
    if (baseTitle.includes('—') && baseTitle.length > 60)
        return baseTitle;
    const headings = extractHeadings(content);
    const stats = extractStatistics(content);
    // Build a suffix from the first meaningful statistic
    const topStat = stats[0];
    // Build a suffix from the first heading that isn't a generic section label
    const topHeading = headings.find((h) => h.length > 10 &&
        !/^(introduction|overview|analysis|conclusion|summary|background|context)/iu.test(h));
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
function buildContentDescription(content, baseSubtitle) {
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
export function enrichMetadataFromContent(content, baseMetadata) {
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
//# sourceMappingURL=content-metadata.js.map