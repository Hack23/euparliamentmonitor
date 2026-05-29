// SPDX-FileCopyrightText: 2024-2026 Hack23 AB
// SPDX-License-Identifier: Apache-2.0

/**
 * @module Constants/UI
 * @description Barrel re-export for the per-surface UI localization modules.
 *
 * Each module owns one UI surface — editing a translation no longer requires
 * touching every other surface in the same file:
 *
 * - `page-titles.ts`                 — `PAGE_TITLES`, `PAGE_DESCRIPTIONS`
 * - `section-headings.ts`            — generic section headings, nav labels, comparison/timeline labels, header chrome
 * - `footer-labels.ts`               — every `FOOTER_*_LABELS` map (about, quick links, footer nav, company tagline)
 * - `article-category-labels.ts`     — `ARTICLE_TYPE_LABELS`, `ARTICLE_TYPE_ICONS`
 * - `accessibility.ts`               — `SKIP_LINK_TEXTS`, `TOC_ARIA_LABELS`, language-switcher / footer trust-badge ARIA labels
 * - `reading-time.ts`                — `READ_TIME_LABELS` (per-language pluralization)
 * - `progressive-disclosure.ts`      — `PROGRESSIVE_DISCLOSURE_LABELS` (reading layers, expand CTAs, reading-time line, TOC layer badge)
 * - `ai-content.ts`                  — `AI_SECTION_CONTENT` + `AISection` interface
 * - `related-analysis.ts`            — `SECTION_TITLE_LABELS`, `RELATED_ANALYSIS_LABELS`
 * - `tradecraft-cards.ts`            — tradecraft / analysis-index card labels
 * - `methodology-framework-labels.ts` — analytical framework explanation labels
 * - `risk-threat-labels.ts`          — risk / threat / stakeholder analysis labels
 * - `pwa-labels.ts`                  — PWA install/update prompts, offline shell, build-info footer
 */

export { PAGE_TITLES, PAGE_DESCRIPTIONS } from './page-titles.js';

export {
  SECTION_HEADINGS,
  NO_ARTICLES_MESSAGES,
  BACK_TO_NEWS_LABELS,
  ARTICLE_NAV_LABELS,
  RELATED_ARTICLES_NAV_LABELS,
  BREADCRUMB_HOME_LABELS,
  BREADCRUMB_NEWS_LABELS,
  TIMELINE_HEADINGS,
  COMPARISON_BEFORE_LABELS,
  COMPARISON_AFTER_LABELS,
  KEY_FIGURES_HEADINGS,
  FILTER_LABELS,
  THEME_TOGGLE_LABELS,
  HEADER_SUBTITLE_LABELS,
  SOURCES_HEADING_LABELS,
  KEY_TAKEAWAYS_HEADING_LABELS,
  SUPPLEMENTARY_HEADING_LABELS,
  HEADER_CTA_SPONSOR_LABELS,
  HEADER_CTA_BECOME_SPONSOR_LABELS,
  HEADER_CTA_SECURITY_LABELS,
} from './section-headings.js';

export {
  FOOTER_ABOUT_HEADING_LABELS,
  FOOTER_ABOUT_TEXT_LABELS,
  FOOTER_QUICK_LINKS_LABELS,
  FOOTER_BUILT_BY_LABELS,
  FOOTER_LANGUAGES_LABELS,
  FOOTER_HOME_LABELS,
  FOOTER_SITEMAP_LABELS,
  FOOTER_RSS_LABELS,
  FOOTER_GITHUB_REPO_LABELS,
  FOOTER_LICENSE_LABELS,
  FOOTER_EUROPARL_LABELS,
  FOOTER_LINKEDIN_LABELS,
  FOOTER_SECURITY_POLICY_LABELS,
  FOOTER_CONTACT_LABELS,
  FOOTER_DISCLAIMER_LABELS,
  FOOTER_REPORT_ISSUES_LABELS,
  FOOTER_ARTICLES_AVAILABLE_LABELS,
  FOOTER_POLITICAL_INTELLIGENCE_LABELS,
  FOOTER_NEWS_LABELS,
  FOOTER_DASHBOARD_LABELS,
  FOOTER_ANALYSIS_REPORTS_LABELS,
  FOOTER_API_DOCS_LABELS,
  FOOTER_COMPANY_TAGLINE_LABELS,
} from './footer-labels.js';

export {
  ARTICLE_TYPE_LABELS,
  ARTICLE_TYPE_ICONS,
  HE_DEEP_ANALYSIS,
} from './article-category-labels.js';

export {
  SKIP_LINK_TEXTS,
  TOC_ARIA_LABELS,
  LANGUAGE_SELECTION_ARIA_LABELS,
  FOOTER_TRUST_BADGES_ARIA_LABELS,
} from './accessibility.js';

export { READ_TIME_LABELS } from './reading-time.js';

export {
  PROGRESSIVE_DISCLOSURE_LABELS,
  type ProgressiveDisclosureStrings,
} from './progressive-disclosure.js';

export { AI_SECTION_CONTENT, type AISection } from './ai-content.js';

export {
  SECTION_TITLE_LABELS,
  RELATED_ANALYSIS_LABELS,
  type RelationshipLabels,
  type RelatedAnalysisStrings,
} from './related-analysis.js';

export {
  TRADECRAFT_HEADING_LABELS,
  TRADECRAFT_INTRO_LABELS,
  TRADECRAFT_METHODOLOGIES_LABELS,
  TRADECRAFT_TEMPLATES_LABELS,
  ANALYSIS_INDEX_HEADING_LABELS,
  ANALYSIS_INDEX_INTRO_LABELS,
  ANALYSIS_INDEX_COL_SECTION_LABELS,
  ANALYSIS_INDEX_COL_ARTIFACT_LABELS,
  ANALYSIS_INDEX_COL_PATH_LABELS,
  VIEW_SOURCE_LABELS,
  VIEW_SOURCE_MARKDOWN_LABELS,
  OPEN_SOURCE_NOTE_LABELS,
} from './tradecraft-cards.js';

export {
  ANALYSIS_TRANSPARENCY_LABELS,
  ANALYSIS_SUMMARY_LABELS,
  METHODOLOGY_LABELS,
  TRANSPARENCY_DISCLOSURE_LABELS,
  CLASSIFICATION_ANALYSIS_LABELS,
  THREAT_ASSESSMENT_LABELS,
  RISK_SCORING_LABELS,
  DEEP_ANALYSIS_LABELS,
  AI_ANALYSIS_GUIDE_LABELS,
  SWOT_FRAMEWORK_LABELS,
  RISK_METHODOLOGY_LABELS,
  THREAT_FRAMEWORK_LABELS,
  CLASSIFICATION_GUIDE_LABELS,
  STYLE_GUIDE_LABELS,
  SIGNIFICANCE_CLASSIFICATION_LABELS,
} from './methodology-framework-labels.js';

export {
  ACTOR_MAPPING_LABELS,
  FORCES_ANALYSIS_LABELS,
  IMPACT_MATRIX_LABELS,
  POLITICAL_THREAT_LANDSCAPE_LABELS,
  ACTOR_THREAT_PROFILING_LABELS,
  CONSEQUENCE_TREES_LABELS,
  LEGISLATIVE_DISRUPTION_LABELS,
  RISK_MATRIX_LABELS,
  QUANTITATIVE_SWOT_LABELS,
  POLITICAL_CAPITAL_RISK_LABELS,
  LEGISLATIVE_VELOCITY_RISK_LABELS,
  AGENT_RISK_WORKFLOW_LABELS,
  STAKEHOLDER_IMPACT_LABELS,
  COALITION_DYNAMICS_LABELS,
  VOTING_PATTERNS_LABELS,
  CROSS_SESSION_INTELLIGENCE_LABELS,
  SYNTHESIS_SUMMARY_LABELS,
  DOCUMENT_ANALYSIS_LABELS,
  SIGNIFICANCE_SCORING_LABELS,
} from './risk-threat-labels.js';

export {
  INSTALL_APP_LABELS,
  UPDATE_AVAILABLE_LABELS,
  UPDATE_REFRESH_CTA_LABELS,
  UPDATE_DISMISS_LABELS,
  OFFLINE_TITLE_LABELS,
  OFFLINE_BODY_LABELS,
  OFFLINE_RETRY_LABELS,
  BUILD_INFO_COMMIT_LABELS,
  BUILD_INFO_DEPLOYED_LABELS,
} from './pwa-labels.js';
