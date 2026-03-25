// SPDX-FileCopyrightText: 2024-2026 Hack23 AB
// SPDX-License-Identifier: Apache-2.0

/**
 * @module Constants/Config
 * @description Shared configuration constants
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { ArticleCategory } from '../types/index.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

/** Project root directory */
export const PROJECT_ROOT: string = path.resolve(__dirname, '..', '..');

/** News directory */
export const NEWS_DIR: string = path.join(PROJECT_ROOT, 'news');

/** Metadata directory */
export const METADATA_DIR: string = path.join(NEWS_DIR, 'metadata');

/** Base URL for the production site */
export const BASE_URL = 'https://euparliamentmonitor.com';

/** Article filename pattern regex */
export const ARTICLE_FILENAME_PATTERN = /^(\d{4}-\d{2}-\d{2})-(.+)-([a-z]{2})\.html$/;

/** Words per minute for read time calculation */
export const WORDS_PER_MINUTE = 250;

/** Valid article categories for generation — all values of the ArticleCategory enum */
export const VALID_ARTICLE_CATEGORIES: readonly ArticleCategory[] = Object.values(
  ArticleCategory
) as ArticleCategory[];

/** @deprecated Use ArticleCategory enum directly */
export const VALID_ARTICLE_TYPES = VALID_ARTICLE_CATEGORIES;

/** Week ahead article category constant */
export const ARTICLE_TYPE_WEEK_AHEAD = ArticleCategory.WEEK_AHEAD;

/** Breaking news article category constant */
export const ARTICLE_TYPE_BREAKING = ArticleCategory.BREAKING_NEWS;

/** Committee reports article category constant */
export const ARTICLE_TYPE_COMMITTEE_REPORTS = ArticleCategory.COMMITTEE_REPORTS;

/** Propositions article category constant */
export const ARTICLE_TYPE_PROPOSITIONS = ArticleCategory.PROPOSITIONS;

/** Motions article category constant */
export const ARTICLE_TYPE_MOTIONS = ArticleCategory.MOTIONS;

/** Month ahead article category constant */
export const ARTICLE_TYPE_MONTH_AHEAD = ArticleCategory.MONTH_AHEAD;

/** Week in review article category constant */
export const ARTICLE_TYPE_WEEK_IN_REVIEW = ArticleCategory.WEEK_IN_REVIEW;

/** Month in review article category constant */
export const ARTICLE_TYPE_MONTH_IN_REVIEW = ArticleCategory.MONTH_IN_REVIEW;

/** CLI argument separator */
export const ARG_SEPARATOR = '=';

/** Application version read from package.json */
export const APP_VERSION: string = (() => {
  try {
    const pkgPath = path.join(PROJECT_ROOT, 'package.json');
    const parsed: unknown = JSON.parse(fs.readFileSync(pkgPath, 'utf-8'));

    if (typeof parsed === 'object' && parsed !== null && 'version' in parsed) {
      const versionValue = (parsed as { version: unknown }).version;
      if (typeof versionValue === 'string' && versionValue.trim() !== '') {
        return versionValue;
      }
    }

    console.warn('Invalid or missing "version" in package.json, falling back to default 0.0.0');
    return '0.0.0';
  } catch (err) {
    console.warn('Failed to read version from package.json:', err);
    return '0.0.0';
  }
})();

/**
 * Generate theme toggle HTML button markup with a localized aria-label.
 * Renders a moon (light→dark) and sun (dark→light) icon; CSS controls visibility.
 *
 * @param ariaLabel - Localized accessible label for the theme toggle button
 * @returns HTML string for the theme toggle button
 */
export function createThemeToggleButton(ariaLabel: string): string {
  return `<button type="button" class="theme-toggle" aria-label="${ariaLabel}"><span class="theme-toggle__icon--light" aria-hidden="true">🌙</span><span class="theme-toggle__icon--dark" aria-hidden="true">☀️</span></button>`;
}

/**
 * Theme toggle HTML button markup for site headers (English default).
 * @deprecated Use {@link createThemeToggleButton} with a localized aria-label instead.
 */
export const THEME_TOGGLE_BUTTON: string = createThemeToggleButton('Toggle dark/light theme');

/**
 * Raw theme toggle script content (without wrapping `<script>` tags).
 * Used as single source of truth for both the injected `<script>` block
 * and the CSP hash computation in article-template.ts.
 */
export const THEME_TOGGLE_SCRIPT_CONTENT = `
  (function(){
    var docEl=document.documentElement;
    var t=localStorage.getItem('ep-theme');
    var storedTheme=t==='light'?'light':t==='dark'?'dark':null;
    if(storedTheme){
      docEl.setAttribute('data-theme',storedTheme);
    }else if(t){
      localStorage.removeItem('ep-theme');
    }
    var btn=document.querySelector('.theme-toggle');
    if(!btn)return;
    btn.addEventListener('click',function(){
      var cur=docEl.getAttribute('data-theme');
      if(!cur){
        cur=(window.matchMedia&&window.matchMedia('(prefers-color-scheme: dark)').matches)?'dark':'light';
      }
      var next=cur==='dark'?'light':'dark';
      docEl.setAttribute('data-theme',next);
      localStorage.setItem('ep-theme',next);
    });
  })();
  `;

/**
 * Theme toggle inline script block (complete `<script>…</script>` markup).
 * Reads/writes localStorage key "ep-theme" and sets `data-theme` on `<html>`.
 * Detects system theme on first click when no explicit preference is saved.
 */
export const THEME_TOGGLE_SCRIPT = `
  <script>${THEME_TOGGLE_SCRIPT_CONTENT}</script>`;
