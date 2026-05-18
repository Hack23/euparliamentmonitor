// SPDX-FileCopyrightText: 2024-2026 Hack23 AB
// SPDX-License-Identifier: Apache-2.0

/**
 * @module Types/ArticleStrings/Propositions
 * @description Localized strings for propositions articles and shared
 * editorial strings reused across article types.
 */

/** Localized strings for propositions articles */
export interface PropositionsStrings {
  lede: string;
  proposalsHeading: string;
  adoptedTextsHeading: string;
  pipelineHeading: string;
  procedureHeading: string;
  analysisHeading: string;
  analysis: string;
  pipelineHealthLabel: string;
  throughputRateLabel: string;
  whyThisMatters: string;
}

/** Localized editorial strings shared across article types */
export interface EditorialStrings {
  /** Heading for "Why This Matters" citizen-impact section */
  whyThisMatters: string;
  /** Heading for key analytical finding */
  keyTakeaway: string;
  /** Heading for parliamentary context section */
  parliamentaryContext: string;
  /** Source attribution phrase (e.g. "According to European Parliament records") */
  sourceAttribution: string;
  /** Analytical note label */
  analysisNote: string;
}
