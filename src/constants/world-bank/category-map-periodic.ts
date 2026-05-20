// SPDX-FileCopyrightText: 2024-2026 Hack23 AB
// SPDX-License-Identifier: Apache-2.0

/**
 * @module Constants/WorldBank/CategoryMapPeriodic
 * @description Periodic review category indicator mappings.
 */

import { ArticleCategory } from '../../types/index.js';
import { WB_INDICATORS, N, PRI, SEC } from './indicator-catalog.js';
import type { IndicatorMapping } from './committee-map.js';

/** Periodic review category indicator mappings */
export const CATEGORY_INDICATOR_MAP_PERIODIC: Partial<Record<ArticleCategory, IndicatorMapping>> = {
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
};
