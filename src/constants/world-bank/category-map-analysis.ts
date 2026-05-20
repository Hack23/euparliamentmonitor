// SPDX-FileCopyrightText: 2024-2026 Hack23 AB
// SPDX-License-Identifier: Apache-2.0

/**
 * @module Constants/WorldBank/CategoryMapAnalysis
 * @description Analytical category indicator mappings.
 */

import { ArticleCategory } from '../../types/index.js';
import { WB_INDICATORS, N, PRI, SEC } from './indicator-catalog.js';
import type { IndicatorMapping } from './committee-map.js';

/** Analytical category indicator mappings */
export const CATEGORY_INDICATOR_MAP_ANALYSIS: Partial<Record<ArticleCategory, IndicatorMapping>> = {
  [ArticleCategory.DEEP_ANALYSIS]: {
    category: ArticleCategory.DEEP_ANALYSIS,
    enrichmentStrategy:
      'Maximum enrichment — deep analysis articles should include comprehensive economic context. Use COMMITTEE_INDICATOR_MAP for the primary committee, plus 2-3 cross-cutting indicators.',
    primaryIndicators: [
      {
        indicatorId: WB_INDICATORS.GDP_GROWTH,
        name: N.GDP_GROWTH,
        relevance: 'Macro context for deep analysis',
        usage: 'Establish economic baseline for multi-perspective analysis',
        priority: PRI,
      },
      {
        indicatorId: WB_INDICATORS.UNEMPLOYMENT,
        name: N.UNEMPLOYMENT,
        relevance: 'Social dimension of policy analysis',
        usage: 'Labor market lens for 5-why analysis',
        priority: PRI,
      },
      {
        indicatorId: WB_INDICATORS.CO2_EMISSIONS,
        name: N.CO2,
        relevance: 'Environmental dimension of policy analysis',
        usage: 'Environmental lens for 5-why analysis',
        priority: PRI,
      },
    ],
    secondaryIndicators: [
      {
        indicatorId: WB_INDICATORS.GINI_INDEX,
        name: N.GINI,
        relevance: 'Inequality dimension',
        usage: 'Social equity lens for distributional analysis',
        priority: SEC,
      },
      {
        indicatorId: WB_INDICATORS.TRADE,
        name: N.TRADE,
        relevance: 'External dimension',
        usage: 'Geopolitical lens for trade impact analysis',
        priority: SEC,
      },
    ],
    maxWBCalls: 5,
  },

  [ArticleCategory.QUARTER_AHEAD]: {
    category: ArticleCategory.QUARTER_AHEAD,
    enrichmentStrategy:
      'Quarterly economic outlook covering the next ~90 days (≈3 plenary sessions). Pair headline growth/inflation indicators with the dominant policy domain of the upcoming dossier pipeline.',
    primaryIndicators: [
      {
        indicatorId: WB_INDICATORS.GDP_GROWTH,
        name: N.GDP_GROWTH,
        relevance: 'Quarterly growth trajectory',
        usage: 'Frame the macro backdrop for the upcoming quarter',
        priority: PRI,
      },
      {
        indicatorId: WB_INDICATORS.INFLATION,
        name: N.INFLATION,
        relevance: 'Quarterly price-stability context',
        usage: 'Anchor monetary-policy salience for the quarter',
        priority: PRI,
      },
    ],
    secondaryIndicators: [
      {
        indicatorId: WB_INDICATORS.UNEMPLOYMENT,
        name: N.UNEMPLOYMENT,
        relevance: 'Quarterly employment outlook',
        usage: 'Preview labour-market salience',
        priority: SEC,
      },
    ],
    maxWBCalls: 3,
  },

  [ArticleCategory.QUARTER_IN_REVIEW]: {
    category: ArticleCategory.QUARTER_IN_REVIEW,
    enrichmentStrategy:
      'Quarterly retrospective comparing start-vs-end indicators across ~90 days. Surface delta vs prior quarter to assess legislative throughput against macro conditions.',
    primaryIndicators: [
      {
        indicatorId: WB_INDICATORS.GDP_GROWTH,
        name: N.GDP_GROWTH,
        relevance: 'Quarterly economic outturn',
        usage: 'Benchmark legislative output against growth',
        priority: PRI,
      },
      {
        indicatorId: WB_INDICATORS.UNEMPLOYMENT,
        name: N.UNEMPLOYMENT,
        relevance: 'Quarterly employment outturn',
        usage: 'Assess labour-market direction',
        priority: PRI,
      },
    ],
    secondaryIndicators: [
      {
        indicatorId: WB_INDICATORS.INFLATION,
        name: N.INFLATION,
        relevance: 'Quarterly inflation outturn',
        usage: 'Place price stability in context',
        priority: SEC,
      },
    ],
    maxWBCalls: 3,
  },

  [ArticleCategory.TERM_OUTLOOK]: {
    category: ArticleCategory.TERM_OUTLOOK,
    enrichmentStrategy:
      'Multi-year structural outlook to next EP election. Lean on long-run growth/employment/climate indicators and trade openness to ground term-end mandate-fulfilment probability.',
    primaryIndicators: [
      {
        indicatorId: WB_INDICATORS.GDP_GROWTH,
        name: N.GDP_GROWTH,
        relevance: 'Long-run growth context to election',
        usage: 'Anchor coalition-trajectory narrative in macro reality',
        priority: PRI,
      },
      {
        indicatorId: WB_INDICATORS.UNEMPLOYMENT,
        name: N.UNEMPLOYMENT,
        relevance: 'Long-run employment trajectory',
        usage: 'Connect mandate fulfilment to labour-market outcomes',
        priority: PRI,
      },
      {
        indicatorId: WB_INDICATORS.CO2_EMISSIONS,
        name: N.CO2,
        relevance: 'Climate-target trajectory through term-end',
        usage: 'Score Green-Deal mandate progress',
        priority: PRI,
      },
    ],
    secondaryIndicators: [
      {
        indicatorId: WB_INDICATORS.RD_EXPENDITURE,
        name: N.RD,
        relevance: 'Innovation investment over the term',
        usage: 'Frame competitiveness mandate progress',
        priority: SEC,
      },
      {
        indicatorId: WB_INDICATORS.TRADE,
        name: N.TRADE,
        relevance: 'Trade openness over the term',
        usage: 'Frame strategic-autonomy posture',
        priority: SEC,
      },
    ],
    maxWBCalls: 4,
  },

  [ArticleCategory.ELECTION_CYCLE]: {
    category: ArticleCategory.ELECTION_CYCLE,
    enrichmentStrategy:
      'Dual retrospective + forecast brief around the EP election window. Use the broadest indicator set to ground both mandate-delivery scorecard and seat-projection bands.',
    primaryIndicators: [
      {
        indicatorId: WB_INDICATORS.GDP_GROWTH,
        name: N.GDP_GROWTH,
        relevance: 'Term-spanning growth performance',
        usage: 'Bridge retrospective and forecast halves',
        priority: PRI,
      },
      {
        indicatorId: WB_INDICATORS.INFLATION,
        name: N.INFLATION,
        relevance: 'Cost-of-living salience pre-election',
        usage: 'Inform voter-segmentation modelling',
        priority: PRI,
      },
      {
        indicatorId: WB_INDICATORS.UNEMPLOYMENT,
        name: N.UNEMPLOYMENT,
        relevance: 'Employment salience pre-election',
        usage: 'Inform voter-segmentation modelling',
        priority: PRI,
      },
    ],
    secondaryIndicators: [
      {
        indicatorId: WB_INDICATORS.CO2_EMISSIONS,
        name: N.CO2,
        relevance: 'Green-Deal salience pre-election',
        usage: 'Quantify incumbent climate track record',
        priority: SEC,
      },
      {
        indicatorId: WB_INDICATORS.TRADE,
        name: N.TRADE,
        relevance: 'Strategic-autonomy salience',
        usage: 'Inform geopolitical voter-segmentation',
        priority: SEC,
      },
    ],
    maxWBCalls: 4,
  },
};
