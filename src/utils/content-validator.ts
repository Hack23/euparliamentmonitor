// SPDX-FileCopyrightText: 2024-2026 Hack23 AB
// SPDX-License-Identifier: Apache-2.0

/**
 * @module Utils/ContentValidator
 * @description Post-generation content quality validation for news articles.
 *
 * Validates generated article HTML for minimum word counts, placeholder text,
 * required structural HTML elements, language consistency, meta tag alignment,
 * read-time accuracy, and keyword localization. Produces a structured quality report.
 */

import { ArticleCategory } from '../types/index.js';
import { stripScriptBlocks } from './html-sanitize.js';

// ─── Types ────────────────────────────────────────────────────────────────────

/** Quality metrics collected during content validation */
export interface ContentValidationMetrics {
  /** Approximate word count of plain text extracted from HTML */
  wordCount: number;
  /** Whether all required structural HTML elements are present */
  htmlValid: boolean;
  /** Whether placeholder/template markers were detected in the output */
  hasPlaceholders: boolean;
  /** Computed read-time based on actual word count (words / 250, min 1) */
  computedReadTime: number;
  /** Claimed read-time extracted from the article (0 if not found) */
  claimedReadTime: number;
  /** Whether the html lang attribute matches the expected language */
  langAttributeValid: boolean;
  /** Whether the dir attribute is correctly set for RTL languages */
  dirAttributeValid: boolean;
  /** Whether meta tags (title, og:title, twitter:title) are synchronized */
  metaTagsSynced: boolean;
  /** Whether keywords contain at least some localized terms for non-English articles */
  keywordsLocalized: boolean;
}

/** Result returned by {@link validateArticleContent} */
export interface ContentValidationResult {
  /** true when no errors were found (warnings are allowed) */
  valid: boolean;
  /** Non-fatal quality notices */
  warnings: string[];
  /** Fatal quality failures */
  errors: string[];
  /** Collected numeric and boolean quality metrics */
  metrics: ContentValidationMetrics;
}

/** Quality metrics collected during translation completeness validation */
export interface TranslationValidationMetrics {
  /** Ratio of ASCII printable characters to total text (0–1). High values in CJK articles suggest untranslated content. */
  asciiRatio: number;
  /** Ratio of CJK characters to total text (0–1). Low values in ja/ko/zh articles suggest untranslated content. */
  cjkCharRatio: number;
  /** Whether the `dir="rtl"` attribute is present on the `<html>` element */
  hasRtlDir: boolean;
  /** Whether Unicode bidi control characters or `&lrm;`/`&rlm;` markers are present */
  hasBidiMarkers: boolean;
  /** English phrases found in non-English articles that likely should have been translated */
  untranslatedPhrases: readonly string[];
}

/**
 * Result returned by {@link validateTranslationCompleteness}.
 *
 * Translation validation is non-blocking — it produces warnings only.
 */
export interface TranslationValidationResult {
  /** true when no translation quality issues were detected */
  valid: boolean;
  /** Non-fatal translation quality notices */
  warnings: string[];
  /** Collected translation quality metrics */
  metrics: TranslationValidationMetrics;
}

// ─── Constants ────────────────────────────────────────────────────────────────

/** Minimum word counts (plain text) required per article category */
const MIN_WORD_COUNTS: Readonly<Record<string, number>> = {
  [ArticleCategory.WEEK_AHEAD]: 500,
  [ArticleCategory.MONTH_AHEAD]: 500,
  [ArticleCategory.BREAKING_NEWS]: 300,
  [ArticleCategory.COMMITTEE_REPORTS]: 400,
  [ArticleCategory.PROPOSITIONS]: 300,
  [ArticleCategory.MOTIONS]: 300,
  [ArticleCategory.WEEK_IN_REVIEW]: 300,
  [ArticleCategory.MONTH_IN_REVIEW]: 600,
} as const;

/** Default minimum word count when category is not listed */
const DEFAULT_MIN_WORDS = 300;

/** Words per minute for read-time calculation */
const WORDS_PER_MINUTE = 250;

/** Maximum read-time deviation (minutes) before a warning is triggered */
const READ_TIME_TOLERANCE = 2;

/** RTL language codes requiring dir="rtl" */
const RTL_LANGUAGES: ReadonlySet<string> = new Set(['ar', 'he']);

/** Patterns that indicate un-replaced template markers */
const PLACEHOLDER_PATTERNS: ReadonlyArray<RegExp> = [
  /\{\{[^}]+\}\}/u,
  /\[TODO[^\]]*\]/iu,
  /\bPLACEHOLDER\b/u,
] as const;

/** Required structural HTML elements that every article must contain */
const REQUIRED_HTML_ELEMENTS: ReadonlyArray<{
  selector: string | readonly string[];
  label: string;
}> = [
  {
    selector: ['class="site-header__langs"', 'class="language-switcher"'],
    label: 'language switcher nav',
  },
  { selector: 'class="article-top-nav"', label: 'article-top-nav (back button)' },
  { selector: 'class="site-header"', label: 'site-header' },
  { selector: '<main id="main"', label: 'main content wrapper' },
] as const;

/**
 * Localized keyword indicators per language.
 * If a non-English article's keywords contain at least one of these
 * language-specific terms, keyword localization is considered acceptable.
 * This catches the common issue of English-only keywords in translated articles.
 */
const LOCALIZED_KEYWORD_INDICATORS: Readonly<Record<string, ReadonlyArray<string>>> = {
  sv: ['parlamentet', 'lagstiftning', 'EU', 'europeisk', 'utskott', 'omröstning', 'förordning'],
  da: ['parlamentet', 'lovgivning', 'udvalg', 'afstemning', 'forordning', 'europæisk'],
  no: ['parlamentet', 'lovgivning', 'komité', 'avstemning', 'forordning', 'europeisk'],
  fi: ['parlamentti', 'lainsäädäntö', 'valiokunta', 'äänestys', 'asetus', 'eurooppalainen'],
  de: ['Parlament', 'Gesetzgebung', 'Ausschuss', 'Abstimmung', 'Verordnung', 'europäisch'],
  fr: ['parlement', 'législation', 'commission', 'vote', 'règlement', 'européen'],
  es: ['parlamento', 'legislación', 'comisión', 'votación', 'reglamento', 'europeo'],
  nl: ['parlement', 'wetgeving', 'commissie', 'stemming', 'verordening', 'Europees'],
  ar: ['البرلمان', 'التشريع', 'اللجنة', 'التصويت', 'الأوروبي', 'القرار'],
  he: ['הפרלמנט', 'חקיקה', 'ועדה', 'הצבעה', 'האירופי', 'תקנה'],
  ja: ['議会', '立法', '委員会', '投票', '規則', '欧州'],
  ko: ['의회', '입법', '위원회', '투표', '규정', '유럽'],
  zh: ['议会', '立法', '委员会', '投票', '条例', '欧洲'],
} as const;

/** CJK language codes requiring ideographic character density checks */
const CJK_LANGUAGES: ReadonlySet<string> = new Set(['ja', 'ko', 'zh']);

/**
 * ASCII ratio threshold above which CJK articles are considered likely untranslated.
 * Real CJK content typically has <50 % ASCII (mostly HTML entities and punctuation).
 */
const CJK_ASCII_RATIO_THRESHOLD = 0.85;

/**
 * Minimum CJK character ratio expected in properly translated CJK articles.
 * Below this value the content is likely still English.
 */
const CJK_CHAR_RATIO_THRESHOLD = 0.05;

/**
 * Common English phrases that should not appear (un-translated) in non-English articles.
 * These are generic header/label/placeholder phrases that a proper translation would replace.
 */
const ENGLISH_PLACEHOLDER_PHRASES: ReadonlyArray<string> = [
  'European Parliament',
  'Read more',
  'Table of Contents',
  'Key Takeaways',
  'Executive Summary',
  'Click here',
  'Learn more',
  'Subscribe',
  'Pipeline health',
  'Throughput rate',
  'legislative processing capacity',
  'Bottlenecked procedures',
  'coalition-building strategies',
  'regulatory implications',
  'democratic participation',
  'inter-institutional relations',
  'Likely scenario',
  'Possible scenario',
  'Earlier intervention',
  'political group dynamics',
  'committee coordinators',
] as const;

// ─── Article Quality Gate Constants ───────────────────────────────────────────

/**
 * Section headings that MUST NOT appear as article keywords.
 * These leak into meta tags when AI agents copy their section headers
 * into the keywords field instead of using policy terms.
 *
 * @see SHARED_PROMPT_PATTERNS.md § Keywords Quality Rules
 */
const BANNED_KEYWORD_PATTERNS: ReadonlyArray<string> = [
  'Deep Political Analysis',
  'What Happened',
  'Key Actors',
  'Timeline',
  'Why It Matters',
  'Why This Matters',
  'Legislative Pipeline Overview',
  'Impact Assessment',
  'Actions → Consequences',
  'Miscalculations & Missed Opportunities',
  'Winners & Losers',
  'Root Causes',
  'Stakeholder Perspectives',
  'Multi-Stakeholder Perspectives',
  'Stakeholder Outcome Matrix',
  'Intelligence Policy Map',
  'Strategic Outlook',
  'SWOT Analysis',
  'Dashboard',
  'Pipeline Health',
  'Analysis Pipeline Insights',
  'Plenary Sessions',
  'Executive Summary',
  'Table of Contents',
  'Political Context',
] as const;

/**
 * Minimum number of non-whitespace characters for a `<section>` to be
 * considered non-empty. Below this threshold the section is treated as empty.
 */
const MIN_SECTION_CONTENT_LENGTH = 10;

/**
 * How many characters to look back from a tag position when checking
 * whether the tag is inside a pipeline-health/pipeline-metrics container.
 */
const PIPELINE_CONTEXT_LOOKBEHIND_CHARS = 2000;

/**
 * HTML entity → decoded character pairs used by the single-pass decoder.
 * Longest entities are listed first so that `&amp;` doesn't greedily match
 * inside `&amp;lt;` before the full entity `&amp;lt;` is checked.
 */
const ENTITY_PAIRS: ReadonlyArray<readonly [string, string]> = [
  ['&mdash;', '—'],
  ['&ndash;', '–'],
  ['&rarr;', '→'],
  ['&quot;', '"'],
  ['&amp;', '&'],
  ['&#39;', "'"],
  ['&lt;', '<'],
  ['&gt;', '>'],
] as const;

// ─── Helpers ──────────────────────────────────────────────────────────────────

// stripScriptBlocks is imported from html-sanitize.ts

/**
 * Extract plain text from the `<main>` element of an article and count words.
 *
 * Restricts counting to the main content area so that JSON-LD scripts,
 * navigation, and header/footer boilerplate do not inflate the word count.
 * Falls back to the full document when no `<main>` element is found.
 *
 * @param html - Raw HTML string
 * @returns Approximate word count of the main content area
 */
function countWordsInHtml(html: string): number {
  const mainMatch = /<main[^>]*>([\s\S]*?)<\/main>/u.exec(html);
  const source = mainMatch?.[1] ?? html;
  const plainText = stripScriptBlocks(source)
    .replace(/<[^>]+>/gu, ' ')
    .replace(/\s+/gu, ' ')
    .trim();
  if (!plainText) return 0;
  return plainText.split(' ').length;
}

/**
 * Detect whether any un-replaced template placeholder patterns remain in the content.
 *
 * @param html - HTML string to inspect
 * @returns true if at least one placeholder pattern is found
 */
function detectPlaceholders(html: string): boolean {
  return PLACEHOLDER_PATTERNS.some((pattern) => pattern.test(html));
}

/**
 * Check that all required structural HTML elements are present.
 *
 * @param html - HTML string to inspect
 * @returns Array of labels for missing elements (empty when all present)
 */
function findMissingElements(html: string): string[] {
  return REQUIRED_HTML_ELEMENTS.filter((el) => {
    const sel = el.selector;
    if (Array.isArray(sel)) {
      return !sel.some((s) => html.includes(s));
    }
    return !html.includes(sel as string);
  }).map((el) => el.label);
}

/**
 * Extract the value of the `lang` attribute from the `<html>` tag.
 *
 * @param html - HTML string to inspect
 * @returns The lang value or empty string if not found
 */
function extractLangAttribute(html: string): string {
  const match = /<html[^>]*\slang="([^"]+)"/iu.exec(html);
  return match?.[1] ?? '';
}

/**
 * Extract the value of the `dir` attribute from the `<html>` tag.
 *
 * @param html - HTML string to inspect
 * @returns The dir value or empty string if not found
 */
function extractDirAttribute(html: string): string {
  const match = /<html[^>]*\sdir="([^"]+)"/iu.exec(html);
  return match?.[1] ?? '';
}

/**
 * Extract the claimed read-time from the article.
 * Looks for patterns like "5 min read", "3分で読了", "5分钟阅读", etc.
 *
 * @param html - HTML string to inspect
 * @returns Claimed read time in minutes or 0 if not found
 */
function extractClaimedReadTime(html: string): number {
  // Look for read-time inside the article meta section
  const readTimeMatch =
    /class="article-read-time"[^>]*>([^<]*)/iu.exec(html) ??
    /article-read-time[^>]*>([^<]*)/iu.exec(html);
  if (!readTimeMatch?.[1]) return 0;
  const text = readTimeMatch[1].trim();
  // Extract the numeric portion — handles "5 min read", "5分で読了", "٥ دقائق قراءة"
  const numMatch = /(\d+)/u.exec(text);
  return numMatch?.[1] ? parseInt(numMatch[1], 10) : 0;
}

/**
 * Extract meta tag content by name or property.
 *
 * @param html - HTML string
 * @param attr - Attribute name ('name' or 'property')
 * @param value - Attribute value to match (e.g. 'og:title')
 * @returns The content attribute value or empty string
 */
function extractMetaContent(html: string, attr: string, value: string): string {
  // Handle both orderings: <meta name="x" content="y"> and <meta content="y" name="x">
  const pattern1 = new RegExp(`<meta\\s+${attr}="${value}"\\s+content="([^"]*)"`, 'iu');
  const pattern2 = new RegExp(`<meta\\s+content="([^"]*)"\\s+${attr}="${value}"`, 'iu');
  return pattern1.exec(html)?.[1] ?? pattern2.exec(html)?.[1] ?? '';
}

/**
 * Extract the page title from the `<title>` tag.
 *
 * @param html - HTML string
 * @returns Title text or empty string
 */
function extractTitle(html: string): string {
  const match = /<title>([^<]*)<\/title>/iu.exec(html);
  return match?.[1]?.trim() ?? '';
}

/**
 * Check whether keywords contain language-specific localized terms.
 * For English articles, always returns true.
 * For non-English articles, checks if at least one keyword matches
 * a known localized indicator for that language.
 *
 * @param html - HTML string to extract keywords from
 * @param language - Expected language code
 * @returns true if keywords appear localized for the given language
 */
function checkKeywordLocalization(html: string, language: string): boolean {
  if (language === 'en') return true;

  const keywordsMeta = extractMetaContent(html, 'name', 'keywords');
  if (!keywordsMeta) return true; // No keywords = no localization issue

  const indicators = LOCALIZED_KEYWORD_INDICATORS[language];
  if (!indicators) return true; // Unknown language = skip check

  const keywordsLower = keywordsMeta.toLowerCase();
  return indicators.some((indicator) => keywordsLower.includes(indicator.toLowerCase()));
}

/**
 * Check whether meta tags (title, OG, Twitter) are synchronized.
 *
 * @param html - HTML string to inspect
 * @returns true if the core meta tags are reasonably aligned
 */
function checkMetaTagSync(html: string): boolean {
  const pageTitle = extractTitle(html);
  const ogTitle = extractMetaContent(html, 'property', 'og:title');
  const twitterTitle = extractMetaContent(html, 'name', 'twitter:title');

  // If OG or Twitter title is present, it should match the page title
  // (stripping the " | EU Parliament Monitor" suffix from page title)
  const coreTitle = pageTitle.replace(/\s*\|\s*EU Parliament Monitor$/iu, '').trim();

  if (ogTitle && ogTitle !== coreTitle) return false;
  if (twitterTitle && twitterTitle !== coreTitle) return false;

  // Also check description alignment
  const description = extractMetaContent(html, 'name', 'description');
  const ogDescription = extractMetaContent(html, 'property', 'og:description');
  const twitterDescription = extractMetaContent(html, 'name', 'twitter:description');

  if (ogDescription && description && ogDescription !== description) return false;
  if (twitterDescription && description && twitterDescription !== description) return false;

  return true;
}

/**
 * Decode common HTML entities that appear in meta keyword values.
 * Only covers the entities actually used by the article template engine.
 *
 * Uses a single-pass scan to avoid double-unescaping (e.g. `&amp;lt;`
 * becomes `&lt;`, NOT `<`). Each `&` in the input is checked once;
 * decoded replacements are never re-scanned.
 *
 * @param s - String potentially containing HTML entities
 * @returns The string with common entities decoded
 */
function decodeKeywordEntities(s: string): string {
  const parts: string[] = [];
  let i = 0;
  while (i < s.length) {
    const ch = s[i] ?? '';
    if (ch === '&') {
      const rest = s.slice(i).toLowerCase();
      let matched = false;
      for (const [entity, replacement] of ENTITY_PAIRS) {
        if (rest.startsWith(entity)) {
          parts.push(replacement);
          i += entity.length;
          matched = true;
          break;
        }
      }
      if (!matched) {
        parts.push(ch);
        i++;
      }
    } else {
      parts.push(ch);
      i++;
    }
  }
  return parts.join('');
}

/**
 * Normalize a keyword token for comparison: decode HTML entities,
 * collapse arrow/dash variants, and normalize whitespace.
 *
 * @param s - Raw keyword token to normalize
 * @returns Lowercased, entity-decoded, dash-normalized token
 */
function normalizeKeywordToken(s: string): string {
  let decoded = decodeKeywordEntities(s);
  // Normalize arrow/dash variants → single canonical form
  decoded = decoded.replace(/→/gu, '->');
  decoded = decoded.replace(/—/gu, '-');
  decoded = decoded.replace(/–/gu, '-');
  // Collapse whitespace and lowercase
  return decoded.replace(/\s+/gu, ' ').trim().toLowerCase();
}

/**
 * Detect section-heading keywords that leaked into the article's meta keywords.
 * Returns the list of banned keywords found.
 *
 * Decodes HTML entities (e.g. `&amp;` → `&`) and normalizes dash/arrow
 * variants so that exact comma-separated tokens can be matched after
 * normalization, for example "Winners &amp; Losers" matching
 * "Winners & Losers". Combined phrases are not split on dash or arrow
 * separators and therefore only match if the full normalized token is banned.
 *
 * @param html - HTML string to inspect
 * @returns Array of section-heading keywords found in the meta tag
 */
function detectBannedKeywords(html: string): string[] {
  const keywordsMeta = extractMetaContent(html, 'name', 'keywords');
  if (!keywordsMeta) return [];

  // Parse comma-separated keywords and normalize each token
  const tokens = keywordsMeta
    .split(',')
    .map((k) => normalizeKeywordToken(k))
    .filter((k) => k.length > 0);

  // Build a normalized banned-set for exact-match comparison
  const bannedNormalized = new Map<string, string>();
  for (const pattern of BANNED_KEYWORD_PATTERNS) {
    bannedNormalized.set(normalizeKeywordToken(pattern), pattern);
  }

  const found: string[] = [];
  for (const token of tokens) {
    const original = bannedNormalized.get(token);
    if (original) {
      found.push(original);
    }
  }
  return found;
}

/**
 * Test whether a character is a boundary before/after the word "class"
 * in an HTML attribute context.
 *
 * @param ch - The character to test (or undefined if at string edge)
 * @param side - Whether to check as a 'before' or 'after' boundary
 * @returns true if the character is a valid boundary
 */
function isAttrBoundary(ch: string | undefined, side: 'before' | 'after'): boolean {
  if (!ch || ch === '') return true;
  if (ch === ' ' || ch === '\t' || ch === '\n' || ch === '\r') return true;
  if (side === 'before') return ch === '"' || ch === "'";
  return ch === '=';
}

/**
 * Extract the quoted value of the `class` attribute starting at a given cursor
 * position (immediately after the word "class"). Returns `null` if the syntax
 * is not `class = "..."` or `class = '...'`.
 *
 * @param tag - The full start-tag string
 * @param cursor - Index right after the word "class" in `tag`
 * @returns `{ value, end }` or `null`
 */
function extractClassValue(tag: string, cursor: number): { value: string; end: number } | null {
  let pos = cursor;
  // Skip whitespace before '='
  while (pos < tag.length && (tag[pos] === ' ' || tag[pos] === '\t')) pos++;
  if (pos >= tag.length || tag[pos] !== '=') return null;
  pos++; // skip '='
  // Skip whitespace before opening quote
  while (pos < tag.length && (tag[pos] === ' ' || tag[pos] === '\t')) pos++;
  if (pos >= tag.length) return null;
  const quote = tag[pos];
  if (quote !== '"' && quote !== "'") return null;
  const valueStart = pos + 1;
  const valueEnd = tag.indexOf(quote, valueStart);
  if (valueEnd === -1) return null;
  return { value: tag.slice(valueStart, valueEnd), end: valueEnd + 1 };
}

/**
 * Check whether an HTML start tag has a specific class token (whitespace-tokenized).
 * Handles both single-quoted and double-quoted class attributes.
 *
 * @param startTag - An opening HTML tag string (e.g. `<span class="metric-value foo">`)
 * @param token - The class token to look for (e.g. `metric-value`)
 * @returns true if the class attribute contains the exact token
 */
function hasClassToken(startTag: string, token: string): boolean {
  const lowerTag = startTag.toLowerCase();
  let searchFrom = 0;

  while (searchFrom < lowerTag.length) {
    const classPos = lowerTag.indexOf('class', searchFrom);
    if (classPos === -1) return false;

    const before = classPos > 0 ? lowerTag[classPos - 1] : undefined;
    const after = classPos + 5 < lowerTag.length ? lowerTag[classPos + 5] : undefined;

    if (!isAttrBoundary(before, 'before') || !isAttrBoundary(after, 'after')) {
      searchFrom = classPos + 5;
      continue;
    }

    const extracted = extractClassValue(startTag, classPos + 5);
    if (!extracted) {
      searchFrom = classPos + 5;
      continue;
    }

    const tokens = extracted.value.split(/\s+/u).filter((t) => t.length > 0);
    if (tokens.includes(token)) return true;

    searchFrom = extracted.end;
  }

  return false;
}

/**
 * Detect metric values showing "0%" in pipeline-health / pipeline-metrics
 * containers, which indicate no-data conditions that should not be rendered
 * as real dashboard metrics.
 *
 * Only flags `0%` inside elements whose surrounding context includes a
 * `pipeline-metrics` or `pipeline-health` class, avoiding false positives
 * on legitimate trend-panel change indicators (e.g. week-over-week 0%).
 *
 * @param html - HTML string to inspect
 * @returns Number of 0% pipeline metric values found
 */
function detectZeroPercentMetrics(html: string): number {
  // Use indexOf-based search to avoid regex backtracking (ReDoS-safe)
  let count = 0;
  let searchFrom = 0;
  const zeroValue = '0%';
  const lowerHtml = html.toLowerCase();

  while (searchFrom < html.length) {
    const tagStart = html.indexOf('<', searchFrom);
    if (tagStart === -1) break;

    const tagClose = html.indexOf('>', tagStart);
    if (tagClose === -1) break;

    const startTag = html.slice(tagStart, tagClose + 1);

    // Only check elements that have the 'metric-value' class token
    if (hasClassToken(startTag, 'metric-value')) {
      const contentStart = tagClose + 1;
      const nextTag = html.indexOf('<', contentStart);
      if (nextTag === -1) break;

      const textContent = html.slice(contentStart, nextTag).trim();
      if (textContent === zeroValue && isInPipelineContext(lowerHtml, tagStart)) {
        count++;
      }
      searchFrom = nextTag;
      continue;
    }

    searchFrom = tagClose + 1;
  }
  return count;
}

/**
 * Check whether a position in the HTML is inside a pipeline-health/metrics context.
 * Looks backward up to 2000 chars for pipeline marker class names.
 *
 * If a `trend-panel` marker appears *after* the nearest pipeline marker,
 * the element is inside a trend panel (not pipeline), so return false.
 * This avoids flagging legitimate WoW/MoM 0% deltas rendered by
 * `buildTrendPanel` that happen to fall within the look-behind window.
 *
 * @param lowerHtml - Lowercase HTML string
 * @param position - Current scan position
 * @returns true if inside a pipeline context
 */
function isInPipelineContext(lowerHtml: string, position: number): boolean {
  const precedingHtml = lowerHtml.slice(
    Math.max(0, position - PIPELINE_CONTEXT_LOOKBEHIND_CHARS),
    position
  );
  const pipelineMetricsPos = precedingHtml.lastIndexOf('pipeline-metrics');
  const pipelineHealthPos = precedingHtml.lastIndexOf('pipeline-health');
  const lastPipelinePos = Math.max(pipelineMetricsPos, pipelineHealthPos);
  if (lastPipelinePos === -1) return false;

  // If a trend-panel marker appears after the pipeline marker, the element
  // is inside a trend panel, not the pipeline panel.
  const trendPanelPos = precedingHtml.lastIndexOf('trend-panel');
  if (trendPanelPos !== -1 && trendPanelPos > lastPipelinePos) return false;

  return true;
}

/**
 * Strip HTML tags from a string using a simple character scanner.
 * ReDoS-safe alternative to regex-based tag removal.
 *
 * @param input - HTML string to strip tags from
 * @returns Plain text content with tags removed
 */
function stripHtmlTags(input: string): string {
  const parts: string[] = [];
  let inTag = false;
  for (let i = 0; i < input.length; i++) {
    const ch = input[i] ?? '';
    if (ch === '<') {
      inTag = true;
    } else if (ch === '>') {
      inTag = false;
    } else if (!inTag) {
      parts.push(ch);
    }
  }
  return parts.join('');
}

/**
 * Evaluate whether a section's inner HTML has enough meaningful content.
 *
 * @param innerHtml - The HTML content between `<section>` and `</section>` tags
 * @returns true if the section is empty or near-empty
 */
function isSectionEmpty(innerHtml: string): boolean {
  const plainText = stripHtmlTags(innerHtml).replace(/\s+/gu, ' ').trim();
  return plainText.length < MIN_SECTION_CONTENT_LENGTH;
}

/**
 * Find the next `<section` open or `</section>` close tag from a given cursor.
 * Returns `{ type, pos }` or `null` if no more section tags found.
 *
 * @param lowerHtml - Lowercase HTML string
 * @param cursor - Start position
 * @returns Tag event or null
 */
function findNextSectionTag(
  lowerHtml: string,
  cursor: number
): { type: 'open' | 'close'; pos: number } | null {
  const nextOpen = lowerHtml.indexOf('<section', cursor);
  const nextClose = lowerHtml.indexOf('</section>', cursor);

  if (nextOpen === -1 && nextClose === -1) return null;

  const openFirst = nextOpen !== -1 && (nextClose === -1 || nextOpen < nextClose);
  return openFirst ? { type: 'open', pos: nextOpen } : { type: 'close', pos: nextClose };
}

/**
 * Count empty `<section>` elements — those with little or no visible content.
 * An empty section contains only whitespace or very short boilerplate text.
 * Uses a stack-based scanner to correctly handle nested `<section>` elements.
 *
 * @param html - HTML string to inspect
 * @returns Number of empty sections found
 */
function countEmptySections(html: string): number {
  const lowerHtml = html.toLowerCase();
  let count = 0;
  const stack: number[] = [];
  let cursor = 0;

  let event = findNextSectionTag(lowerHtml, cursor);
  while (event) {
    if (event.type === 'open') {
      const tagEnd = html.indexOf('>', event.pos);
      if (tagEnd === -1) break;
      stack.push(tagEnd + 1);
      cursor = tagEnd + 1;
    } else {
      if (stack.length > 0) {
        const contentStart = stack[stack.length - 1] ?? 0;
        stack.pop();
        if (isSectionEmpty(html.slice(contentStart, event.pos))) {
          count++;
        }
      }
      cursor = event.pos + '</section>'.length;
    }
    event = findNextSectionTag(lowerHtml, cursor);
  }

  return count;
}

// ─── Public API ───────────────────────────────────────────────────────────────

/**
 * Collect warnings from machine-enforceable article quality gates.
 * Extracted to keep `validateArticleContent` within cognitive-complexity limits.
 *
 * @param html - Complete HTML string
 * @param warnings - Mutable warnings array to append to
 */
function collectQualityGateWarnings(html: string, warnings: string[]): void {
  // Keyword quality: detect section-heading keywords leaked into meta tags
  const bannedKeywords = detectBannedKeywords(html);
  if (bannedKeywords.length > 0) {
    warnings.push(
      `Keywords contain ${bannedKeywords.length} section heading(s) that should not be used as keywords: ${bannedKeywords.join(', ')}`
    );
  }

  // Dashboard metric quality: detect 0% metrics rendered as real data
  const zeroMetricCount = detectZeroPercentMetrics(html);
  if (zeroMetricCount > 0) {
    warnings.push(
      `Dashboard renders ${zeroMetricCount} metric(s) showing "0%" — this likely indicates no-data, not a real score. Omit the dashboard when data is unavailable.`
    );
  }

  // Empty section detection: flag sections with no meaningful content
  const emptySectionCount = countEmptySections(html);
  if (emptySectionCount > 0) {
    warnings.push(
      `Article contains ${emptySectionCount} empty or near-empty <section> element(s) that should be removed`
    );
  }
}

/**
 * Validate the quality of a generated article.
 *
 * Checks performed:
 * - Minimum word count threshold for the given article type
 * - Presence of un-replaced placeholder/template markers
 * - Existence of required structural HTML elements
 * - Language attribute consistency (`lang` and `dir`)
 * - Read-time accuracy (computed vs claimed)
 * - Meta tag synchronization (title/OG/Twitter alignment)
 * - Keyword localization for non-English articles
 *
 * @param html - Complete HTML string of the generated article
 * @param language - Language code of the article (e.g. `"en"`, `"de"`, `"ar"`)
 * @param articleType - Article category string (e.g. `"week-ahead"`)
 * @returns Structured validation result with errors, warnings and metrics
 */
export function validateArticleContent(
  html: string,
  language: string,
  articleType: string
): ContentValidationResult {
  const warnings: string[] = [];
  const errors: string[] = [];

  // Word count check
  const wordCount = countWordsInHtml(html);
  const minWords = MIN_WORD_COUNTS[articleType] ?? DEFAULT_MIN_WORDS;

  if (wordCount < minWords) {
    warnings.push(
      `Content too short: ${wordCount} words (minimum ${minWords} for "${articleType}")`
    );
  }

  // Placeholder detection
  const hasPlaceholders = detectPlaceholders(html);
  if (hasPlaceholders) {
    errors.push('Un-replaced template placeholder(s) detected in generated content');
  }

  // Required HTML elements
  const missingElements = findMissingElements(html);
  const htmlValid = missingElements.length === 0;
  if (!htmlValid) {
    errors.push(`Missing required HTML element(s): ${missingElements.join(', ')}`);
  }

  // Read-time accuracy
  const computedReadTime = Math.max(1, Math.ceil(wordCount / WORDS_PER_MINUTE));
  const claimedReadTime = extractClaimedReadTime(html);
  if (claimedReadTime > 0 && Math.abs(computedReadTime - claimedReadTime) > READ_TIME_TOLERANCE) {
    warnings.push(
      `Read-time mismatch: claimed ${claimedReadTime} min but content is ~${computedReadTime} min (${wordCount} words)`
    );
  }

  // Language attribute check
  const langAttr = extractLangAttribute(html);
  const langAttributeValid = langAttr === language;
  if (!langAttributeValid && langAttr) {
    warnings.push(
      `Language attribute mismatch: <html lang="${langAttr}"> but expected "${language}"`
    );
  } else if (!langAttr) {
    warnings.push('Missing lang attribute on <html> element');
  }

  // Dir attribute check for RTL languages
  const dirAttr = extractDirAttribute(html);
  const isRtl = RTL_LANGUAGES.has(language);
  const dirAttributeValid = isRtl ? dirAttr === 'rtl' : dirAttr !== 'rtl';
  if (isRtl && dirAttr !== 'rtl') {
    warnings.push(
      `RTL language "${language}" should have dir="rtl" but found dir="${dirAttr || '(none)'}"`
    );
  }

  // Meta tag synchronization
  const metaTagsSynced = checkMetaTagSync(html);
  if (!metaTagsSynced) {
    warnings.push(
      'Meta tag mismatch: title, og:title, twitter:title, or descriptions are not synchronized'
    );
  }

  // Keyword localization
  const keywordsLocalized = checkKeywordLocalization(html, language);
  if (!keywordsLocalized) {
    warnings.push(
      `Keywords for "${language}" article appear to be entirely in English — consider localizing`
    );
  }

  // Extended validation: cross-reference density, stakeholder balance, temporal coverage
  collectExtendedValidationWarnings(html, warnings);

  // Machine-enforceable article quality gates
  collectQualityGateWarnings(html, warnings);

  return {
    valid: errors.length === 0,
    warnings,
    errors,
    metrics: {
      wordCount,
      htmlValid,
      hasPlaceholders,
      computedReadTime,
      claimedReadTime,
      langAttributeValid,
      dirAttributeValid,
      metaTagsSynced,
      keywordsLocalized,
    },
  };
}

// ─── Translation validation helpers ───────────────────────────────────────────

/**
 * Extract plain body text from `<main>` for character-class analysis.
 * Strips all HTML tags and normalises whitespace.
 *
 * @param html - Raw HTML string
 * @returns Plain text content from the main element
 */
function extractMainPlainText(html: string): string {
  const mainMatch = /<main[^>]*>([\s\S]*?)<\/main>/u.exec(html);
  const source = mainMatch?.[1] ?? html;
  return stripScriptBlocks(source)
    .replace(/<[^>]+>/gu, ' ')
    .replace(/&(?:[a-z][a-z0-9]+|#\d+|#x[0-9a-f]+);/giu, ' ')
    .replace(/\s+/gu, ' ')
    .trim();
}

/**
 * Compute the ratio of ASCII printable characters (0x20–0x7E) in a string.
 *
 * @param text - Plain text string
 * @returns Ratio from 0 to 1 (1 = all ASCII)
 */
function computeAsciiRatio(text: string): number {
  if (text.length === 0) return 0;
  const asciiCount = (text.match(/[\x20-\x7E]/gu) ?? []).length;
  // Use Array.from to correctly count Unicode characters (handles surrogate pairs)
  const charCount = Array.from(text).length;
  return asciiCount / charCount;
}

/**
 * Compute the ratio of CJK Unified Ideograph characters in a string.
 * Covers CJK Unified Ideographs (U+4E00–U+9FFF), Extension A (U+3400–U+4DBF),
 * Hiragana, Katakana, and Hangul Syllables.
 *
 * @param text - Plain text string
 * @returns Ratio from 0 to 1
 */
function computeCjkCharRatio(text: string): number {
  if (text.length === 0) return 0;
  // CJK Unified Ideographs + Extension A, Hiragana, Katakana, Hangul Syllables
  // Note: Extension B (U+20000–U+2A6DF) is omitted as it triggers unsafe-regex lint
  // and is extremely rare in EU Parliament content.
  const cjkPattern = /[\u4E00-\u9FFF\u3400-\u4DBF\u3040-\u309F\u30A0-\u30FF\uAC00-\uD7AF]/gu;
  const matches = text.match(cjkPattern);
  // Use Array.from to correctly count Unicode characters (handles surrogate pairs)
  const charCount = Array.from(text).length;
  return (matches?.length ?? 0) / charCount;
}

/**
 * Detect common English phrases that should have been translated in non-English articles.
 *
 * @param text - Plain text content
 * @returns Array of detected untranslated English phrases
 */
function findUntranslatedPhrases(text: string): string[] {
  const lowerText = text.toLowerCase();
  return ENGLISH_PLACEHOLDER_PHRASES.filter((phrase) => lowerText.includes(phrase.toLowerCase()));
}

/**
 * Check whether Unicode bidirectional control characters or HTML bidi markers are present.
 *
 * @param html - Raw HTML string
 * @returns true if bidi markers or control characters are found
 */
function detectBidiMarkers(html: string): boolean {
  // Unicode bidi control characters: LRM, RLM, LRE, RLE, PDF, LRO, RLO, LRI, RLI, FSI, PDI
  const bidiControlPattern = /[\u200E\u200F\u202A-\u202E\u2066-\u2069]/u;
  // HTML entities: &lrm; &rlm;
  const bidiEntityPattern = /&(?:lrm|rlm);/iu;
  return bidiControlPattern.test(html) || bidiEntityPattern.test(html);
}

/**
 * Validate translation completeness and cultural adaptation for a generated article.
 *
 * Checks performed:
 * - **RTL languages (ar, he)**: Verify `dir="rtl"` on `<html>`, detect bidi control markers
 * - **CJK languages (ja, ko, zh)**: Check that content has sufficient CJK character density
 *   (high ASCII ratio suggests the article was not actually translated)
 * - **All non-English**: Detect common English phrases that should have been translated
 *
 * This function is purely analytical — no AI calls. It produces warnings only
 * and never blocks article generation.
 *
 * @param html - Complete HTML string of the generated article
 * @param lang - Language code of the article (e.g. `"ar"`, `"ja"`, `"en"`)
 * @returns Structured translation validation result with warnings and metrics
 */
export function validateTranslationCompleteness(
  html: string,
  lang: string
): TranslationValidationResult {
  const warnings: string[] = [];

  const plainText = extractMainPlainText(html);
  const asciiRatio = computeAsciiRatio(plainText);
  const cjkCharRatio = computeCjkCharRatio(plainText);
  const htmlDir = extractDirAttribute(html);
  const hasRtlDir = htmlDir === 'rtl';
  const hasBidiMarkers = detectBidiMarkers(html);
  const untranslatedPhrases = findUntranslatedPhrases(plainText);

  // Skip validation warnings for English — it is the source language,
  // but still compute and return real metrics for telemetry/reporting.
  if (lang === 'en') {
    return {
      valid: true,
      warnings: [],
      metrics: {
        asciiRatio,
        cjkCharRatio,
        hasRtlDir,
        hasBidiMarkers,
        untranslatedPhrases,
      },
    };
  }

  // ── RTL validation ──────────────────────────────────────────────────────
  if (RTL_LANGUAGES.has(lang) && !hasRtlDir) {
    if (!htmlDir) {
      warnings.push(
        `Translation quality: RTL language "${lang}" missing dir="rtl" on <html> element`
      );
    } else {
      warnings.push(
        `Translation quality: RTL language "${lang}" expected dir="rtl" on <html> element but found dir="${htmlDir}"`
      );
    }
  }

  // ── CJK density check ──────────────────────────────────────────────────
  if (CJK_LANGUAGES.has(lang) && plainText.length > 0) {
    if (asciiRatio > CJK_ASCII_RATIO_THRESHOLD) {
      warnings.push(
        `Translation quality: ${lang.toUpperCase()} article has ${(asciiRatio * 100).toFixed(0)}% ASCII characters — content may be untranslated`
      );
    }
    if (cjkCharRatio < CJK_CHAR_RATIO_THRESHOLD) {
      warnings.push(
        `Translation quality: ${lang.toUpperCase()} article has only ${(cjkCharRatio * 100).toFixed(1)}% CJK characters — expected native script content`
      );
    }
  }

  // ── Untranslated English phrase detection ───────────────────────────────
  if (untranslatedPhrases.length > 0) {
    warnings.push(
      `Translation quality: found ${untranslatedPhrases.length} likely untranslated English phrase(s): ${untranslatedPhrases.slice(0, 3).join(', ')}`
    );
  }

  return {
    valid: warnings.length === 0,
    warnings,
    metrics: {
      asciiRatio,
      cjkCharRatio,
      hasRtlDir,
      hasBidiMarkers,
      untranslatedPhrases,
    },
  };
}

// ─── Extended validation rules ────────────────────────────────────────────────

/**
 * Collect warnings from extended validation rules (cross-reference density,
 * stakeholder group balance, temporal coverage). Extracted to keep
 * {@link validateArticleContent} within cognitive-complexity limits.
 *
 * @param html - Complete article HTML
 * @param warnings - Mutable array to push warning strings into
 */
function collectExtendedValidationWarnings(html: string, warnings: string[]): void {
  const crossRefWarning = validateCrossReferenceDensity(html);
  if (crossRefWarning) warnings.push(crossRefWarning);

  const balanceWarning = validateStakeholderGroupBalance(html);
  if (balanceWarning) warnings.push(balanceWarning);

  const temporalWarning = validateTemporalCoverage(html);
  if (temporalWarning) warnings.push(temporalWarning);
}

/**
 * Patterns matching known EP document reference formats.
 * Uses separate patterns to avoid alternation complexity.
 * Covers: TA-10-2026-0123, PE-123, PE-123.456, A9-0123, B9-0123, C9-0123, P9_TA(2024)0001
 */
const CV_EP_DOC_PATTERNS: ReadonlyArray<RegExp> = [
  /\bTA-\d+-\d+-\d+\b/gu,
  /\bPE-\d+\.\d+\b/gu,
  /\bPE-\d+(?!\.\d)\b/gu,
  /\b[A-C]\d-\d+\b/gu,
  /\bP\d_TA\(\d{4}\)\d+\b/gu,
];

/** Pattern matching EP legislative procedure references (e.g. 2024/0001(COD)) */
const CV_PROCEDURE_REF_PATTERN = /\b\d{4}\/\d+\([A-Z]{2,4}\)/gu;

/**
 * Known EP political groups for stakeholder balance validation.
 * Each entry must be a single canonical, non-overlapping group name so
 * independent matching does not double-count aliases such as "Renew Europe"
 * and "Renew".
 */
const EP_POLITICAL_GROUPS: ReadonlyArray<string> = [
  'EPP',
  'S&D',
  'Renew Europe',
  'Greens/EFA',
  'ECR',
  'Identity and Democracy',
  'The Left',
  'Patriots for Europe',
];

/** Patterns indicating forward-looking content (temporal coverage validation) */
const FORWARD_LOOKING_PATTERNS: ReadonlyArray<RegExp> = [
  /\bforecast\b/iu,
  /\bprojection\b/iu,
  /\bexpected\b/iu,
  /\banticipated\b/iu,
  /\bupcoming\b/iu,
  /\bfuture\b/iu,
  /\bscenario\b/iu,
  /\bcould\b/iu,
  /\bwill\b/iu,
  /\boutlook\b/iu,
  /\bpredict\b/iu,
  /\bnext\b/iu,
  /\bforthcoming\b/iu,
];

/**
 * Validate that an article cites a minimum number of EP document references
 * (TA-, PE-, A9-, procedure IDs). Articles lacking document citations may rely
 * on unsupported assertions.
 *
 * @param html - Complete article HTML
 * @param minRefs - Minimum number of unique EP references required (default: 2)
 * @returns Warning message if density is insufficient, or null if acceptable
 */
export function validateCrossReferenceDensity(html: string, minRefs = 2): string | null {
  const htmlNoScripts = stripScriptBlocks(html);
  const found = new Set<string>();

  for (const pattern of CV_EP_DOC_PATTERNS) {
    pattern.lastIndex = 0;
    const hits = htmlNoScripts.match(pattern);
    if (hits) {
      for (const hit of hits) found.add(hit);
    }
  }

  CV_PROCEDURE_REF_PATTERN.lastIndex = 0;
  const procHits = htmlNoScripts.match(CV_PROCEDURE_REF_PATTERN);
  if (procHits) {
    for (const hit of procHits) found.add(hit);
  }

  if (found.size < minRefs) {
    return `Cross-reference density too low: ${found.size} EP document reference(s) found (minimum ${minRefs} required)`;
  }
  return null;
}

/**
 * Validate that no single EP political group dominates the article's coverage.
 * Single-group dominance (one group with > 60% of all group mentions) may indicate
 * bias or unbalanced perspective coverage.
 *
 * @param html - Complete article HTML
 * @returns Warning message if one group dominates, or null if balanced
 */
export function validateStakeholderGroupBalance(html: string): string | null {
  const text = stripScriptBlocks(html)
    .replace(/<[^>]+>/gu, ' ')
    .replace(/\s+/gu, ' ');

  const counts: Record<string, number> = Object.create(null) as Record<string, number>;
  let total = 0;
  for (const group of EP_POLITICAL_GROUPS) {
    const escaped = group.replace(/[.*+?^${}()|[\]\\]/gu, '\\$&');
    // eslint-disable-next-line security/detect-non-literal-regexp
    const pattern = new RegExp(`\\b${escaped}\\b`, 'giu');
    const matches = text.match(pattern);
    const count = matches?.length ?? 0;
    counts[group] = count;
    total += count;
  }

  if (total < 3) return null; // Too few mentions to assess balance

  for (const group of EP_POLITICAL_GROUPS) {
    const groupCount = counts[group] ?? 0;
    if (groupCount / total > 0.6) {
      return `Stakeholder balance concern: "${group}" accounts for ${Math.round((groupCount / total) * 100)}% of political group mentions — consider covering other groups`;
    }
  }
  return null;
}

/**
 * Validate that an article includes forward-looking content (temporal coverage).
 * Articles lacking any forward-looking language may not provide actionable intelligence.
 *
 * @param html - Complete article HTML
 * @returns Warning message if no forward-looking content is detected, or null if present
 */
export function validateTemporalCoverage(html: string): string | null {
  const text = stripScriptBlocks(html)
    .replace(/<[^>]+>/gu, ' ')
    .replace(/\s+/gu, ' ')
    .toLowerCase();

  const hasForwardLooking = FORWARD_LOOKING_PATTERNS.some((pattern) => pattern.test(text));

  if (!hasForwardLooking) {
    return 'Temporal coverage: article lacks forward-looking content — add forecasts, scenarios, or outlook sections for actionable intelligence';
  }
  return null;
}
