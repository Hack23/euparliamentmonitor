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

export {
  ALL_LANGUAGES,
  LANGUAGE_PRESETS,
  LANGUAGE_FLAGS,
  LANGUAGE_NAMES,
  getLocalizedString,
  isSupportedLanguage,
  getTextDirection,
} from './language-core.js';

export {
  PAGE_TITLES,
  PAGE_DESCRIPTIONS,
  SECTION_HEADINGS,
  NO_ARTICLES_MESSAGES,
  SKIP_LINK_TEXTS,
  ARTICLE_TYPE_LABELS,
  READ_TIME_LABELS,
  BACK_TO_NEWS_LABELS,
  ARTICLE_NAV_LABELS,
  AI_SECTION_CONTENT,
  FILTER_LABELS,
  SOURCES_HEADING_LABELS,
  HEADER_SUBTITLE_LABELS,
  FOOTER_ABOUT_HEADING_LABELS,
  FOOTER_ABOUT_TEXT_LABELS,
  FOOTER_QUICK_LINKS_LABELS,
  FOOTER_BUILT_BY_LABELS,
  FOOTER_LANGUAGES_LABELS,
  TOC_ARIA_LABELS,
  RELATED_ANALYSIS_LABELS,
} from './language-ui.js';

export type { AISection, RelationshipLabels, RelatedAnalysisStrings } from './language-ui.js';

export {
  WEEK_AHEAD_TITLES,
  MONTH_AHEAD_TITLES,
  WEEKLY_REVIEW_TITLES,
  MONTHLY_REVIEW_TITLES,
  MOTIONS_TITLES,
  BREAKING_NEWS_TITLES,
  COMMITTEE_REPORTS_TITLES,
  PROPOSITIONS_TITLES,
  PROPOSITIONS_STRINGS,
  EDITORIAL_STRINGS,
  MOTIONS_STRINGS,
  WEEK_AHEAD_STRINGS,
  BREAKING_STRINGS,
  DEEP_ANALYSIS_STRINGS,
  COMMITTEE_ANALYSIS_CONTENT_STRINGS,
  SWOT_STRINGS,
  DASHBOARD_STRINGS,
  SWOT_BUILDER_STRINGS,
  DASHBOARD_BUILDER_STRINGS,
  MULTI_DIMENSIONAL_SWOT_STRINGS,
  LOCALIZED_KEYWORDS,
} from './language-articles.js';
