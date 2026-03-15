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
  politicalContextPresent: boolean;
  /** Whether coalition dynamics and inter-group alliances are analysed */
  coalitionDynamicsAnalyzed: boolean;
  /** Whether historical comparison or timeline context is provided */
  historicalContextProvided: boolean;
  /** Whether conclusions are backed by data, figures, or cited evidence */
  evidenceBasedConclusions: boolean;
  /** Whether forward-looking scenarios or projections are presented */
  scenarioPlanning: boolean;
  /** Whether uncertainty or confidence levels are explicitly stated */
  confidenceLevelsIndicated: boolean;
  /** Composite 0–100 score derived from the boolean dimensions above */
  score: number;
}

// ─── Stakeholder Coverage ─────────────────────────────────────────────────────

/**
 * Measures the breadth and balance of stakeholder perspectives in an article.
 */
export interface StakeholderCoverage {
  /** Stakeholder categories whose perspectives are detected in the article */
  perspectivesPresent: string[];
  /** Stakeholder categories whose perspectives appear absent from the article */
  perspectivesMissing: string[];
  /** 0–100 score based on how many of the known stakeholder types are covered */
  balanceScore: number;
  /** 0–100 score based on analytical reasoning quality inferred from text signals */
  reasoningQuality: number;
}

// ─── Visualization Quality ────────────────────────────────────────────────────

/**
 * Measures the quality and completeness of embedded visual elements
 * (SWOT, dashboards, mindmaps, and deep-analysis sections).
 */
export interface VisualizationQuality {
  /** Whether a SWOT analysis section is present */
  swotPresent: boolean;
  /** Number of distinct SWOT dimension elements detected */
  swotDimensions: number;
  /** Whether a data dashboard section is present */
  dashboardPresent: boolean;
  /** Number of individual metrics detected in the dashboard */
  dashboardMetrics: number;
  /** Whether trend indicators (arrows or CSS classes) are present in the dashboard */
  dashboardTrends: boolean;
  /** Whether a mindmap section is present */
  mindmapPresent: boolean;
  /** Number of mindmap branch elements detected (breadth indicator) */
  mindmapBranches: number;
  /** Whether deep-analysis sections are present */
  deepAnalysisPresent: boolean;
  /** Number of evidence items detected inside deep-analysis sections */
  deepAnalysisEvidence: number;
  /** Composite 0–100 score derived from the dimensions above */
  score: number;
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
  articleId: string;
  /** ISO date string (YYYY-MM-DD) of the article */
  date: string;
  /** Article type / category (e.g. "week-ahead") */
  type: string;
  /** Language code of the article (e.g. "en", "de") */
  lang: string;
  /** Plain-text word count of the main article content */
  wordCount: number;
  /** Number of analysis-content sections detected (e.g. analysis, deep-analysis, SWOT, dashboard, mindmap) */
  analysisSections: number;
  /** Number of evidence or document references detected */
  evidenceReferences: number;
  /** Detailed analysis-depth scoring */
  analysisDepth: AnalysisDepthScore;
  /** Stakeholder coverage assessment */
  stakeholderCoverage: StakeholderCoverage;
  /** Visualization quality assessment */
  visualizationQuality: VisualizationQuality;
  /** Composite quality score 0–100 */
  overallScore: number;
  /** Letter grade derived from overallScore */
  grade: ArticleGrade;
  /** Actionable improvement recommendations */
  recommendations: string[];
  /** true when overallScore ≥ 40 (Grade C or better) */
  passesQualityGate: boolean;
}
