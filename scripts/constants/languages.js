// SPDX-FileCopyrightText: 2024-2026 Hack23 AB
// SPDX-License-Identifier: Apache-2.0
/**
 * @module Constants/Languages
 * @description Barrel re-export for all language constants.
 *
 * Bounded contexts:
 * - **language-core** — Codes, flags, names, presets, utility functions
 * - **language-ui** — UI strings (titles, descriptions, labels, accessibility)
 * - **language-articles** — Article-type title generators and body-text strings
 */
export { ALL_LANGUAGES, LANGUAGE_PRESETS, LANGUAGE_FLAGS, LANGUAGE_NAMES, getLocalizedString, isSupportedLanguage, getTextDirection, } from './language-core.js';
export { PAGE_TITLES, PAGE_DESCRIPTIONS, SECTION_HEADINGS, NO_ARTICLES_MESSAGES, SKIP_LINK_TEXTS, ARTICLE_TYPE_LABELS, READ_TIME_LABELS, BACK_TO_NEWS_LABELS, ARTICLE_NAV_LABELS, AI_SECTION_CONTENT, FILTER_LABELS, } from './language-ui.js';
export { WEEK_AHEAD_TITLES, MONTH_AHEAD_TITLES, WEEKLY_REVIEW_TITLES, MONTHLY_REVIEW_TITLES, MOTIONS_TITLES, BREAKING_NEWS_TITLES, COMMITTEE_REPORTS_TITLES, PROPOSITIONS_TITLES, PROPOSITIONS_STRINGS, EDITORIAL_STRINGS, MOTIONS_STRINGS, WEEK_AHEAD_STRINGS, BREAKING_STRINGS, } from './language-articles.js';
//# sourceMappingURL=languages.js.map