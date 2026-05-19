// SPDX-FileCopyrightText: 2024-2026 Hack23 AB
// SPDX-License-Identifier: Apache-2.0

/**
 * @module Generators/PoliticalIntelligence/Copy/Types
 * @description Public TypeScript surface for the Political Intelligence
 * landing-page copy: the {@link PICopy} interface and the English
 * {@link DEFAULT_COPY} fallback. Split out of `copy.ts` (Refactor 8/8)
 * so per-language override files can stay narrowly focused.
 */

/** Localized copy strings for the political-intelligence page */
export interface PICopy {
  title: string;
  intro: string;
  heroSubtitle: string;
  home: string;
  breadcrumbCurrent: string;
  breadcrumbLabel: string;
  methodologiesHeading: string;
  methodologiesDescription: string;
  templatesHeading: string;
  templatesDescription: string;
  referenceHeading: string;
  referenceDescription: string;
  statReferenceLabel: string;
  dailyHeading: string;
  dailyDescription: string;
  statMethodologiesLabel: string;
  statTemplatesLabel: string;
  statRunsLabel: string;
  statArtifactsLabel: string;
  viewOnGitHub: string;
  /** "{count} artifacts" label for each run (plural, count > 1) */
  artifactCountLabel: string;
  /** Singular form used when artifactCount === 1 (e.g. "1 artifact") */
  artifactCountLabelSingular: string;
  /** "{count} runs" label in the date-group header (plural, count > 1) */
  runsCountLabel: string;
  /** Singular form used when runs.length === 1 (e.g. "1 run") */
  runsCountLabelSingular: string;
  /** Label for the expandable artifact-file list inside each run (plural, count > 1) */
  artifactsToggleLabel: string;
  /** Singular form of the toggle label used when artifactCount === 1 */
  artifactsToggleLabelSingular: string;
  /**
   * Localized note shown at the top of the methodology/template/reference
   * sections on non-English pages, explaining that the source tradecraft
   * materials themselves are in English. Empty string on English pages.
   */
  sourceInEnglishNote: string;
  /**
   * Comma-separated SEO keywords list in the page language. Emitted as
   * `<meta name="keywords" content="…">`. Each language ships keywords in
   * its own script so search engines index the page under native-language
   * terms (e.g. Japanese `政治インテリジェンス`, Arabic `الاستخبارات السياسية`).
   */
  seoKeywords: string;
}

/**
 * Default English copy for the Political Intelligence hub page. Used as a
 * fallback when a language-specific override is absent and as the canonical
 * reference for shape/keys consumed by the page builder.
 */
export const DEFAULT_COPY: PICopy = {
  title: 'Political Intelligence',
  intro:
    'Every political analysis published on this site is backed by a transparent chain of methodologies, artifact templates, and run-level analysis data. This page gives you a single, fully-linked index into every piece of tradecraft used to produce the news. All sources open in GitHub so you can audit the analysis behind the prose.',
  heroSubtitle: 'Methodologies, templates & daily analysis transparency',
  home: 'Home',
  breadcrumbCurrent: 'Political Intelligence',
  breadcrumbLabel: 'Breadcrumb',
  methodologiesHeading: 'Methodologies',
  methodologiesDescription:
    'Authoritative tradecraft guides — risk frameworks, style standards, and the 10-step AI-driven analysis protocol that every article follows.',
  templatesHeading: 'Analysis Templates',
  templatesDescription:
    'The catalog of artifact templates produced in every daily analysis run — SWOT, PESTLE, threat matrices, coalition dynamics, consequence trees, and more.',
  referenceHeading: 'Reference & Data Sources',
  referenceDescription:
    'ISMS reference adaptations, indicator catalogs, EU country mappings, chart-integration guides, and use-cases from the IMF and World Bank data pipelines — the authoritative sources behind every economic, governance, and risk chart.',
  statReferenceLabel: 'References',
  dailyHeading: 'Daily Analysis Runs',
  dailyDescription:
    'Every published analysis run, grouped by date and ordered newest first. Each run links to the full GitHub tree so you can inspect every artifact file that fed the corresponding article.',
  statMethodologiesLabel: 'Methodologies',
  statTemplatesLabel: 'Templates',
  statRunsLabel: 'Analysis runs',
  statArtifactsLabel: 'Artifacts',
  viewOnGitHub: 'View on GitHub',
  artifactCountLabel: '{count} artifacts',
  artifactCountLabelSingular: '1 artifact',
  runsCountLabel: '{count} runs',
  runsCountLabelSingular: '1 run',
  artifactsToggleLabel: 'Show all {count} artifact files',
  artifactsToggleLabelSingular: 'Show the 1 artifact file',
  sourceInEnglishNote: '',
  seoKeywords:
    'European Parliament, political intelligence, OSINT, SWOT, PESTLE, TOWS, STRIDE, methodology, artifact templates, coalition mathematics, risk assessment, threat model, transparency, EU',
};
