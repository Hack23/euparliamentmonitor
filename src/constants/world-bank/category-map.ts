// SPDX-FileCopyrightText: 2024-2026 Hack23 AB
// SPDX-License-Identifier: Apache-2.0

/**
 * @module Constants/WorldBank/CategoryMap
 * @description Article category → World Bank indicator declarative map.
 *
 * Not every article type benefits equally from economic data:
 * - **PROPOSITIONS**: High value — legislative proposals often have direct economic impact
 * - **MONTH_AHEAD/MONTH_IN_REVIEW**: High value — monthly economic overview adds depth
 * - **COMMITTEE_REPORTS**: High value — each committee has domain-specific indicators
 * - **WEEK_AHEAD/WEEK_IN_REVIEW**: Medium value — useful for contextualization
 * - **MOTIONS**: Medium value — voting outcomes may relate to economic conditions
 * - **BREAKING_NEWS**: Low value — urgency trumps enrichment
 * - **DEEP_ANALYSIS**: High value — analytical depth benefits from data
 */

import { ArticleCategory } from '../../types/common.js';
import { WB_INDICATORS, N, PRI, SEC } from './indicator-catalog.js';
import type { IndicatorMapping } from './committee-map.js';

// ─── Article Category → Indicator Mapping ────────────────────────────────────

/**
 * Maps an article category to recommended World Bank indicators.
 */
export interface CategoryIndicatorEntry {
  /** Article category value */
  readonly category: ArticleCategory;
  /** Description of how economic data enriches this article type */
  readonly enrichmentStrategy: string;
  /** Primary indicators — always fetch for this category */
  readonly primaryIndicators: readonly IndicatorMapping[];
  /** Secondary indicators — fetch when the article covers specific policy areas */
  readonly secondaryIndicators: readonly IndicatorMapping[];
  /** Maximum recommended World Bank MCP calls per article generation run */
  readonly maxWBCalls: number;
}

/**
 * Maps article categories to World Bank indicators for economic context enrichment.
 *
 * Not every article type benefits equally from economic data:
 * - **PROPOSITIONS**: High value — legislative proposals often have direct economic impact
 * - **MONTH_AHEAD/MONTH_IN_REVIEW**: High value — monthly economic overview adds depth
 * - **COMMITTEE_REPORTS**: High value — each committee has domain-specific indicators
 * - **WEEK_AHEAD/WEEK_IN_REVIEW**: Medium value — useful for contextualization
 * - **MOTIONS**: Medium value — voting outcomes may relate to economic conditions
 * - **BREAKING_NEWS**: Low value — urgency trumps enrichment
 * - **DEEP_ANALYSIS**: High value — analytical depth benefits from data
 */
export const CATEGORY_INDICATOR_MAP: Readonly<Record<ArticleCategory, CategoryIndicatorEntry>> = {
  [ArticleCategory.PROPOSITIONS]: {
    category: ArticleCategory.PROPOSITIONS,
    enrichmentStrategy:
      'Map each legislative proposal to its policy domain, then fetch the 2-3 most relevant indicators for the dominant domain. Use to explain "why this legislation matters" with economic evidence.',
    primaryIndicators: [
      {
        indicatorId: WB_INDICATORS.GDP_GROWTH,
        name: N.GDP_GROWTH,
        relevance: 'Economic backdrop for legislative proposals',
        usage: 'Frame the economic context driving new legislation',
        priority: PRI,
      },
      {
        indicatorId: WB_INDICATORS.UNEMPLOYMENT,
        name: N.UNEMPLOYMENT,
        relevance: 'Employment impact of proposed legislation',
        usage: 'Assess labor market implications of proposals',
        priority: PRI,
      },
    ],
    secondaryIndicators: [
      {
        indicatorId: WB_INDICATORS.INFLATION,
        name: N.INFLATION,
        relevance: 'Cost-of-living context for consumer legislation',
        usage: 'Contextualize price-related regulation proposals',
        priority: SEC,
      },
      {
        indicatorId: WB_INDICATORS.TRADE,
        name: N.TRADE,
        relevance: 'Trade impact of market regulation proposals',
        usage: 'Assess trade implications of single market legislation',
        priority: SEC,
      },
      {
        indicatorId: WB_INDICATORS.CO2_EMISSIONS,
        name: N.CO2,
        relevance: 'Environmental proposals and Green Deal progress',
        usage: 'Quantify environmental impact of green proposals',
        priority: SEC,
      },
    ],
    maxWBCalls: 3,
  },

  [ArticleCategory.MONTH_AHEAD]: {
    category: ArticleCategory.MONTH_AHEAD,
    enrichmentStrategy:
      'Provide a macroeconomic snapshot for the upcoming month. Focus on 2-3 headline indicators that set the economic backdrop for upcoming parliamentary business.',
    primaryIndicators: [
      {
        indicatorId: WB_INDICATORS.GDP_GROWTH,
        name: N.GDP_GROWTH,
        relevance: 'Economic outlook for upcoming legislative agenda',
        usage: 'Set the macroeconomic scene for the month ahead',
        priority: PRI,
      },
      {
        indicatorId: WB_INDICATORS.INFLATION,
        name: N.INFLATION,
        relevance: 'Cost-of-living pressures shaping policy priorities',
        usage: 'Explain why certain issues dominate the upcoming agenda',
        priority: PRI,
      },
    ],
    secondaryIndicators: [
      {
        indicatorId: WB_INDICATORS.UNEMPLOYMENT,
        name: N.UNEMPLOYMENT,
        relevance: 'Labor market context for employment legislation',
        usage: 'Preview employment-related legislative activity',
        priority: SEC,
      },
    ],
    maxWBCalls: 3,
  },

  [ArticleCategory.MONTH_IN_REVIEW]: {
    category: ArticleCategory.MONTH_IN_REVIEW,
    enrichmentStrategy:
      'Retrospective economic assessment: how do the month\'s legislative achievements relate to current economic conditions? Use indicators to measure the "so what" of passed legislation.',
    primaryIndicators: [
      {
        indicatorId: WB_INDICATORS.GDP_GROWTH,
        name: N.GDP_GROWTH,
        relevance: 'Economic context for legislative achievements',
        usage: 'Assess whether legislation addressed economic realities',
        priority: PRI,
      },
      {
        indicatorId: WB_INDICATORS.UNEMPLOYMENT,
        name: N.UNEMPLOYMENT,
        relevance: 'Labor market conditions during the review period',
        usage: 'Evaluate employment-focused legislation effectiveness',
        priority: PRI,
      },
    ],
    secondaryIndicators: [
      {
        indicatorId: WB_INDICATORS.INFLATION,
        name: N.INFLATION,
        relevance: 'Price stability context for the reviewed period',
        usage: 'Measure economic conditions during the legislative month',
        priority: SEC,
      },
      {
        indicatorId: WB_INDICATORS.FDI_NET,
        name: N.FDI,
        relevance: 'Investment climate during the review period',
        usage: 'Assess investment implications of passed legislation',
        priority: SEC,
      },
    ],
    maxWBCalls: 3,
  },

  [ArticleCategory.COMMITTEE_REPORTS]: {
    category: ArticleCategory.COMMITTEE_REPORTS,
    enrichmentStrategy:
      'Use COMMITTEE_INDICATOR_MAP to select indicators per committee. Each committee section should include 1-2 indicators from its domain mapping.',
    primaryIndicators: [],
    secondaryIndicators: [],
    maxWBCalls: 3,
  },

  [ArticleCategory.WEEK_AHEAD]: {
    category: ArticleCategory.WEEK_AHEAD,
    enrichmentStrategy:
      'Light economic context: 1-2 headline indicators to frame the upcoming parliamentary week. Only include when specific agenda items have clear economic dimensions.',
    primaryIndicators: [
      {
        indicatorId: WB_INDICATORS.GDP_GROWTH,
        name: N.GDP_GROWTH,
        relevance: 'Quick economic pulse for the week',
        usage: 'One-line economic context in the article lede',
        priority: PRI,
      },
    ],
    secondaryIndicators: [
      {
        indicatorId: WB_INDICATORS.UNEMPLOYMENT,
        name: N.UNEMPLOYMENT,
        relevance: 'Employment context if labor agenda items exist',
        usage: 'Only include when employment topics are on the agenda',
        priority: SEC,
      },
    ],
    maxWBCalls: 2,
  },

  [ArticleCategory.WEEK_IN_REVIEW]: {
    category: ArticleCategory.WEEK_IN_REVIEW,
    enrichmentStrategy:
      'Retrospective economic context for weekly review. Include when votes or decisions had clear economic implications.',
    primaryIndicators: [
      {
        indicatorId: WB_INDICATORS.GDP_GROWTH,
        name: N.GDP_GROWTH,
        relevance: "Economic backdrop for the week's decisions",
        usage: 'Frame voting outcomes in economic context',
        priority: PRI,
      },
    ],
    secondaryIndicators: [
      {
        indicatorId: WB_INDICATORS.TRADE,
        name: N.TRADE,
        relevance: 'If trade-related legislation was debated',
        usage: 'Only include for trade-relevant weekly activity',
        priority: SEC,
      },
    ],
    maxWBCalls: 2,
  },

  [ArticleCategory.MOTIONS]: {
    category: ArticleCategory.MOTIONS,
    enrichmentStrategy:
      'Selective enrichment: only include economic data when motions/resolutions directly address economic policy. Map voting topics to relevant indicators.',
    primaryIndicators: [],
    secondaryIndicators: [
      {
        indicatorId: WB_INDICATORS.GDP_GROWTH,
        name: N.GDP_GROWTH,
        relevance: 'For economy-related motions',
        usage: 'Only when motions address economic governance',
        priority: SEC,
      },
      {
        indicatorId: WB_INDICATORS.UNEMPLOYMENT,
        name: N.UNEMPLOYMENT,
        relevance: 'For employment-related motions',
        usage: 'Only when motions address labor policy',
        priority: SEC,
      },
    ],
    maxWBCalls: 2,
  },

  [ArticleCategory.BREAKING_NEWS]: {
    category: ArticleCategory.BREAKING_NEWS,
    enrichmentStrategy:
      'Minimal enrichment — breaking news prioritizes speed over depth. Only include one indicator if the breaking event has immediate economic significance.',
    primaryIndicators: [],
    secondaryIndicators: [
      {
        indicatorId: WB_INDICATORS.GDP_GROWTH,
        name: N.GDP_GROWTH,
        relevance: 'Economic context for market-moving decisions',
        usage: 'Only for economically significant breaking events',
        priority: SEC,
      },
    ],
    maxWBCalls: 1,
  },

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

  [ArticleCategory.YEAR_AHEAD]: {
    category: ArticleCategory.YEAR_AHEAD,
    enrichmentStrategy:
      'Comprehensive economic outlook for the legislative year. Include broad macroeconomic indicators and trend analysis.',
    primaryIndicators: [
      {
        indicatorId: WB_INDICATORS.GDP_GROWTH,
        name: N.GDP_GROWTH,
        relevance: 'Annual economic growth trajectory',
        usage: 'Set the economic scene for the legislative year',
        priority: PRI,
      },
      {
        indicatorId: WB_INDICATORS.INFLATION,
        name: N.INFLATION,
        relevance: 'Price stability outlook',
        usage: 'Frame monetary policy context for the year',
        priority: PRI,
      },
      {
        indicatorId: WB_INDICATORS.UNEMPLOYMENT,
        name: N.UNEMPLOYMENT,
        relevance: 'Employment outlook',
        usage: 'Preview employment-related legislative priorities',
        priority: PRI,
      },
    ],
    secondaryIndicators: [
      {
        indicatorId: WB_INDICATORS.CO2_EMISSIONS,
        name: N.CO2,
        relevance: 'Climate targets for the year',
        usage: 'Assess Green Deal progress trajectory',
        priority: SEC,
      },
      {
        indicatorId: WB_INDICATORS.RD_EXPENDITURE,
        name: N.RD,
        relevance: 'Innovation investment trends',
        usage: 'Preview technology and research policy outlook',
        priority: SEC,
      },
    ],
    maxWBCalls: 3,
  },

  [ArticleCategory.YEAR_IN_REVIEW]: {
    category: ArticleCategory.YEAR_IN_REVIEW,
    enrichmentStrategy:
      'Annual retrospective with comprehensive economic assessment. Compare start-of-year vs end-of-year indicators to measure legislative impact.',
    primaryIndicators: [
      {
        indicatorId: WB_INDICATORS.GDP_GROWTH,
        name: N.GDP_GROWTH,
        relevance: 'Annual economic performance',
        usage: 'Assess legislative achievements against economic outcomes',
        priority: PRI,
      },
      {
        indicatorId: WB_INDICATORS.UNEMPLOYMENT,
        name: N.UNEMPLOYMENT,
        relevance: 'Annual employment trend',
        usage: 'Evaluate employment-focused legislative track record',
        priority: PRI,
      },
      {
        indicatorId: WB_INDICATORS.CO2_EMISSIONS,
        name: N.CO2,
        relevance: 'Annual climate progress',
        usage: 'Measure Green Deal legislative impact',
        priority: PRI,
      },
    ],
    secondaryIndicators: [
      {
        indicatorId: WB_INDICATORS.INFLATION,
        name: N.INFLATION,
        relevance: 'Price stability over the year',
        usage: 'Retrospective economic conditions assessment',
        priority: SEC,
      },
    ],
    maxWBCalls: 3,
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
} as const;
