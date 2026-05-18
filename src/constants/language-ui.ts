// SPDX-FileCopyrightText: 2024-2026 Hack23 AB
// SPDX-License-Identifier: Apache-2.0

/**
 * @module Constants/LanguageUI
 * @description Thin re-export barrel preserving the legacy import path.
 *
 * The implementation now lives split by UI surface under {@link Constants/UI}:
 *
 * - `ui/page-titles.ts`                 — `PAGE_TITLES`, `PAGE_DESCRIPTIONS`
 * - `ui/section-headings.ts`            — section/nav/comparison/header labels
 * - `ui/footer-labels.ts`               — every `FOOTER_*_LABELS` map
 * - `ui/article-category-labels.ts`     — `ARTICLE_TYPE_LABELS`, `ARTICLE_TYPE_ICONS`
 * - `ui/accessibility.ts`               — skip-link / TOC / ARIA labels
 * - `ui/reading-time.ts`                — `READ_TIME_LABELS`
 * - `ui/ai-content.ts`                  — `AI_SECTION_CONTENT` + `AISection`
 * - `ui/related-analysis.ts`            — `SECTION_TITLE_LABELS`, `RELATED_ANALYSIS_LABELS`
 * - `ui/tradecraft-cards.ts`            — tradecraft / analysis-index labels
 * - `ui/methodology-framework-labels.ts` — analytical framework labels
 * - `ui/risk-threat-labels.ts`          — risk / threat / stakeholder labels
 * - `ui/pwa-labels.ts`                  — PWA install/update/offline labels
 *
 * New code should import from `../constants/ui/index.js` directly.
 */

export * from './ui/index.js';
