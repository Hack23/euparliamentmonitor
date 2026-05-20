// SPDX-FileCopyrightText: 2024-2026 Hack23 AB
// SPDX-License-Identifier: Apache-2.0

/**
 * @module Constants/WorldBank/CategoryMapLegislative
 * @description Legislative cycle category indicator mappings.
 */

import { ArticleCategory } from '../../types/index.js';
import { WB_INDICATORS, N, PRI, SEC } from './indicator-catalog.js';
import type { IndicatorMapping } from './committee-map.js';

/** Legislative cycle category indicator mappings */
export const CATEGORY_INDICATOR_MAP_LEGISLATIVE: Partial<Record<ArticleCategory, IndicatorMapping>> = {
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
};
