// SPDX-FileCopyrightText: 2024-2026 Hack23 AB
// SPDX-License-Identifier: Apache-2.0

/**
 * @module Constants/WorldBank/CommitteeMapTypes
 * @description Type definitions for committee → indicator mapping.
 */

import { type AnalysisPerspective } from '../../types/index.js';
import { type WBIndicatorId } from './indicator-catalog.js';

/**
 * Describes why a specific World Bank indicator is relevant to a committee
 * or article category, and how it should be used in news articles.
 */
export interface IndicatorMapping {
  /** World Bank indicator ID */
  readonly indicatorId: WBIndicatorId;
  /** Human-readable indicator name */
  readonly name: string;
  /** Why this indicator is relevant to the committee/category */
  readonly relevance: string;
  /** How to use this data in articles (contextual guidance for LLM/generator) */
  readonly usage: string;
  /** Priority: 'primary' indicators should always be fetched; 'secondary' are optional enrichment */
  readonly priority: 'primary' | 'secondary';
}

/**
 * Full mapping entry for a single EP committee.
 */
export interface CommitteeIndicatorEntry {
  /** Official committee name */
  readonly name: string;
  /** Committee abbreviation (e.g. 'ECON') */
  readonly abbreviation: string;
  /** Policy domain this committee covers */
  readonly policyDomain: string;
  /** Relevant analysis perspectives from AnalysisPerspective enum */
  readonly analysisPerspectives: readonly AnalysisPerspective[];
  /** World Bank indicators mapped to this committee */
  readonly indicators: readonly IndicatorMapping[];
}
