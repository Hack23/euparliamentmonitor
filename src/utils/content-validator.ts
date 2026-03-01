// SPDX-FileCopyrightText: 2024-2026 Hack23 AB
// SPDX-License-Identifier: Apache-2.0

/**
 * @module Utils/ContentValidator
 * @description Post-generation content quality validation for news articles.
 *
 * Validates generated article HTML for minimum word counts, placeholder text,
 * and required structural HTML elements, producing a structured quality report.
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

/** Patterns that indicate un-replaced template markers */
const PLACEHOLDER_PATTERNS: ReadonlyArray<RegExp> = [
  /\{\{[^}]+\}\}/u,
  /\[TODO[^\]]*\]/iu,
  /\bPLACEHOLDER\b/u,
] as const;

/** Required structural HTML elements that every article must contain */
const REQUIRED_HTML_ELEMENTS: ReadonlyArray<{ selector: string; label: string }> = [
  { selector: 'class="site-header__langs"', label: 'language switcher nav' },
  { selector: 'class="article-top-nav"', label: 'article-top-nav (back button)' },
  { selector: 'class="site-header"', label: 'site-header' },
  { selector: '<main id="main"', label: 'main content wrapper' },
] as const;

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
  return REQUIRED_HTML_ELEMENTS.filter((el) => !html.includes(el.selector)).map((el) => el.label);
}

// ─── Public API ───────────────────────────────────────────────────────────────

/**
 * Validate the quality of a generated article.
 *
 * Checks performed:
 * - Minimum word count threshold for the given article type
 * - Presence of un-replaced placeholder/template markers
 * - Existence of required structural HTML elements
 *
 * @param html - Complete HTML string of the generated article
 * @param _language - Language code of the article (reserved for future language-consistency checks)
 * @param articleType - Article category string (e.g. `"week-ahead"`)
 * @returns Structured validation result with errors, warnings and metrics
 */
export function validateArticleContent(
  html: string,
  _language: string,
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

  return {
    valid: errors.length === 0,
    warnings,
    errors,
    metrics: { wordCount, htmlValid, hasPlaceholders },
  };
}
