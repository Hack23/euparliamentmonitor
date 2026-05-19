// SPDX-FileCopyrightText: 2024-2026 Hack23 AB
// SPDX-License-Identifier: Apache-2.0

/**
 * @module Utils/Html/Validate
 * @description URL safety and generated-article HTML structural validation.
 */

/**
 * Validate that a URL uses a safe scheme (http or https)
 *
 * @param url - URL string to validate
 * @returns true if URL has a safe scheme
 */
export function isSafeURL(url: string): boolean {
  try {
    const parsed = new URL(url);
    return parsed.protocol === 'http:' || parsed.protocol === 'https:';
  } catch {
    return false;
  }
}

/** Result of article HTML validation */
export interface ArticleValidationResult {
  /** Whether the article passes all structural checks */
  valid: boolean;
  /** List of missing elements */
  errors: readonly string[];
}

/** Required structural elements that every article must contain */
const REQUIRED_ARTICLE_ELEMENTS: ReadonlyArray<{
  selector: string | readonly string[];
  label: string;
}> = [
  {
    selector: ['class="site-header__langs"', 'class="language-switcher"'],
    label: 'language switcher nav',
  },
  { selector: 'class="article-top-nav"', label: 'article-top-nav (back button)' },
  { selector: 'class="site-header"', label: 'site-header' },
  { selector: 'class="skip-link"', label: 'skip-link' },
  { selector: 'class="reading-progress"', label: 'reading-progress bar' },
  { selector: '<main id="main"', label: 'main content wrapper' },
  { selector: 'class="site-footer"', label: 'site-footer' },
] as const;

/**
 * Validate that generated article HTML includes all required structural elements.
 *
 * This is the primary validation gate — articles must be generated correctly
 * by the template. The fix-articles script is only a fallback for historic articles.
 *
 * @param html - Complete HTML string of the article
 * @returns Validation result with errors list (empty if valid)
 */
export function validateArticleHTML(html: string): ArticleValidationResult {
  const errors: string[] = [];

  for (const element of REQUIRED_ARTICLE_ELEMENTS) {
    const sel = element.selector;
    const found = Array.isArray(sel)
      ? sel.some((s) => html.includes(s))
      : html.includes(sel as string);
    if (!found) {
      errors.push(`Missing required element: ${element.label}`);
    }
  }

  return { valid: errors.length === 0, errors };
}
