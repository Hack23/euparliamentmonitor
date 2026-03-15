// SPDX-FileCopyrightText: 2024-2026 Hack23 AB
// SPDX-License-Identifier: Apache-2.0

/**
 * @module Types/Quality
 * @description Type definitions for the Article Quality Assurance Pipeline.
 *
 * Provides interfaces for quality scoring, analysis depth assessment,
 * stakeholder coverage evaluation, and visualization quality metrics
 * used by the article-quality-scorer utility.
 */

// ─── Analysis Depth ───────────────────────────────────────────────────────────

/**
 * Measures how deeply an article analyses the political situation.
 * Each boolean dimension maps to a detected signal in the article text.
 */
export interface AnalysisDepthScore {
  /** Whether political context (coalitions, majorities, opposition) is discussed */
  readonly politicalContextPresent: boolean;
  /** Whether coalition dynamics and inter-group alliances are analysed */
  readonly coalitionDynamicsAnalyzed: boolean;
  /** Whether historical comparison or timeline context is provided */
  readonly historicalContextProvided: boolean;
  /** Whether conclusions are backed by data, figures, or cited evidence */
  readonly evidenceBasedConclusions: boolean;
  /** Whether forward-looking scenarios or projections are presented */
  readonly scenarioPlanning: boolean;
  /** Whether uncertainty or confidence levels are explicitly stated */
  readonly confidenceLevelsIndicated: boolean;
  /** Composite 0–100 score derived from the boolean dimensions above */
  readonly score: number;
}

// ─── Stakeholder Coverage ─────────────────────────────────────────────────────

/**
 * Measures the breadth and balance of stakeholder perspectives in an article.
 */
export interface StakeholderCoverage {
  /** Stakeholder categories whose perspectives are detected in the article */
  readonly perspectivesPresent: readonly string[];
  /** Stakeholder categories whose perspectives appear absent from the article */
  readonly perspectivesMissing: readonly string[];
  /** 0–100 score based on how many of the known stakeholder types are covered */
  readonly balanceScore: number;
  /** 0–100 score based on analytical reasoning quality inferred from text signals */
  readonly reasoningQuality: number;
}

// ─── Visualization Quality ────────────────────────────────────────────────────

/**
 * Measures the quality and completeness of embedded visual elements
 * (SWOT, dashboards, mindmaps, and deep-analysis sections).
 */
export interface VisualizationQuality {
  /** Whether a SWOT analysis section is present */
  readonly swotPresent: boolean;
  /** Number of distinct SWOT dimension elements detected */
  readonly swotDimensions: number;
  /** Whether a data dashboard section is present */
  readonly dashboardPresent: boolean;
  /** Number of individual metrics detected in the dashboard */
  readonly dashboardMetrics: number;
  /** Whether trend indicators (arrows or CSS classes) are present in the dashboard */
  readonly dashboardTrends: boolean;
  /** Whether a mindmap section is present */
  readonly mindmapPresent: boolean;
  /** Number of mindmap branch elements detected (breadth indicator) */
  readonly mindmapBranches: number;
  /** Whether deep-analysis sections are present */
  readonly deepAnalysisPresent: boolean;
  /** Number of evidence items detected inside deep-analysis sections */
  readonly deepAnalysisEvidence: number;
  /** Composite 0–100 score derived from the dimensions above */
  readonly score: number;
}

// ─── Article Quality Report ───────────────────────────────────────────────────

/**
 * Letter grade assigned to an article based on its overall quality score.
 *
 * | Grade | Score range |
 * |-------|-------------|
 * | A     | ≥ 80        |
 * | B     | ≥ 65        |
 * | C     | ≥ 40        |
 * | D     | ≥ 25        |
 * | F     | < 25        |
 */
export type ArticleGrade = 'A' | 'B' | 'C' | 'D' | 'F';

/**
 * Comprehensive quality report for a single generated article.
 * Produced by {@link scoreArticleQuality} in article-quality-scorer.
 */
export interface ArticleQualityReport {
  /** Unique identifier for the article (typically the filename slug) */
  readonly articleId: string;
  /** ISO date string (YYYY-MM-DD) of the article */
  readonly date: string;
  /** Article type / category (e.g. "week-ahead") */
  readonly type: string;
  /** Language code of the article (e.g. "en", "de") */
  readonly lang: string;
  /** Plain-text word count of the main article content */
  readonly wordCount: number;
  /** Number of analysis-content sections detected (e.g. analysis, deep-analysis, SWOT, dashboard, mindmap) */
  readonly analysisSections: number;
  /** Number of evidence or document references detected */
  readonly evidenceReferences: number;
  /** Detailed analysis-depth scoring */
  readonly analysisDepth: AnalysisDepthScore;
  /** Stakeholder coverage assessment */
  readonly stakeholderCoverage: StakeholderCoverage;
  /** Visualization quality assessment */
  readonly visualizationQuality: VisualizationQuality;
  /** Composite quality score 0–100 */
  readonly overallScore: number;
  /** Letter grade derived from overallScore */
  readonly grade: ArticleGrade;
  /** Actionable improvement recommendations */
  readonly recommendations: readonly string[];
  /** true when overallScore ≥ 40 (Grade C or better) */
  readonly passesQualityGate: boolean;
}
