// SPDX-FileCopyrightText: 2024-2026 Hack23 AB
// SPDX-License-Identifier: Apache-2.0
/**
 * @module Constants/Config
 * @description Shared configuration constants
 */
import path from 'path';
import { fileURLToPath } from 'url';
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
/** Valid article types for generation */
export const VALID_ARTICLE_TYPES = [
    'week-ahead',
    'committee-reports',
    'propositions',
    'motions',
    'breaking',
];
/** Week ahead article type constant */
export const ARTICLE_TYPE_WEEK_AHEAD = 'week-ahead';
/** Breaking news article type constant */
export const ARTICLE_TYPE_BREAKING = 'breaking';
/** Committee reports article type constant */
export const ARTICLE_TYPE_COMMITTEE_REPORTS = 'committee-reports';
/** CLI argument separator */
export const ARG_SEPARATOR = '=';
//# sourceMappingURL=config.js.map