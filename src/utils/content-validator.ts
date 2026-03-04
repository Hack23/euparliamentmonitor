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

// ─── Helpers ──────────────────────────────────────────────────────────────────

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
  const plainText = source
    .replace(/<script[^>]*>[\s\S]*?<\/script>/giu, ' ')
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
  const pattern1 = new RegExp(
    `<meta\\s+${attr}="${value}"\\s+content="([^"]*)"`,
    'iu'
  );
  const pattern2 = new RegExp(
    `<meta\\s+content="([^"]*)"\\s+${attr}="${value}"`,
    'iu'
  );
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

// ─── Public API ───────────────────────────────────────────────────────────────

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
  const minWords =
    MIN_WORD_COUNTS[articleType] !== undefined ? MIN_WORD_COUNTS[articleType] : DEFAULT_MIN_WORDS;

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
