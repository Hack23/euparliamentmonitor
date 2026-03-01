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
export const PROJECT_ROOT = path.resolve(__dirname, '..', '..');
/** News directory */
export const NEWS_DIR = path.join(PROJECT_ROOT, 'news');
/** Metadata directory */
export const METADATA_DIR = path.join(NEWS_DIR, 'metadata');
/** Base URL for the production site */
export const BASE_URL = 'https://euparliamentmonitor.com';
/** Article filename pattern regex */
export const ARTICLE_FILENAME_PATTERN = /^(\d{4}-\d{2}-\d{2})-(.+)-([a-z]{2})\.html$/;
/** Words per minute for read time calculation */
export const WORDS_PER_MINUTE = 250;
/** Valid article categories for generation — all values of the ArticleCategory enum */
export const VALID_ARTICLE_CATEGORIES = Object.values(ArticleCategory);
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
export const APP_VERSION = (() => {
    try {
        const pkgPath = path.join(PROJECT_ROOT, 'package.json');
        const pkgJson = JSON.parse(fs.readFileSync(pkgPath, 'utf-8'));
        return pkgJson.version;
    }
    catch (err) {
        console.warn('Failed to read version from package.json:', err);
        return '0.0.0';
    }
})();
//# sourceMappingURL=config.js.map