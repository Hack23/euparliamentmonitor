// SPDX-FileCopyrightText: 2024-2026 Hack23 AB
// SPDX-License-Identifier: Apache-2.0

/**
 * @module Constants/WorldBank/CommitteeMapPart2
 * @description Second half of committee → World Bank indicator entries.
 * Merged with part1 in committee-map.ts.
 */

import { WB_INDICATORS, N, PRI, SEC } from './indicator-catalog.js';
import { AnalysisPerspective } from '../../types/index.js';
import type { CommitteeIndicatorEntry } from './committee-map-types.js';

export const COMMITTEE_INDICATOR_MAP_PART2: Readonly<Record<string, CommitteeIndicatorEntry>> = {
  PECH: {
    name: 'Fisheries',
    abbreviation: 'PECH',
    policyDomain: 'Common Fisheries Policy, marine resources',
    analysisPerspectives: [AnalysisPerspective.ENVIRONMENTAL, AnalysisPerspective.ECONOMIC],
    indicators: [
      {
        indicatorId: WB_INDICATORS.GDP_PER_CAPITA,
        name: N.GDP_PER_CAPITA,
        relevance: 'Fishing community livelihoods',
        usage: 'Assess economic impact of fishing quotas on coastal regions',
        priority: SEC,
      },
      {
        indicatorId: WB_INDICATORS.TRADE,
        name: N.TRADE,
        relevance: 'Seafood trade and market access',
        usage: 'Contextualize fisheries agreements and trade impacts',
        priority: SEC,
      },
    ],
  },

  // ── Culture & Education ──
  CULT: {
    name: 'Culture and Education',
    abbreviation: 'CULT',
    policyDomain: 'Education, culture, media, sport, youth',
    analysisPerspectives: [AnalysisPerspective.SOCIAL, AnalysisPerspective.ECONOMIC],
    indicators: [
      {
        indicatorId: WB_INDICATORS.EDUCATION_EXPENDITURE,
        name: N.EDUCATION,
        relevance: 'Erasmus+ and EU education investment benchmarks',
        usage: 'Compare national education spending in skills agenda debates',
        priority: PRI,
      },
      {
        indicatorId: WB_INDICATORS.TERTIARY_ENROLLMENT,
        name: N.TERTIARY,
        relevance: 'Higher education access and European Education Area',
        usage: 'Measure higher education participation across member states',
        priority: PRI,
      },
      {
        indicatorId: WB_INDICATORS.YOUTH_UNEMPLOYMENT,
        name: N.YOUTH_UNEMP,
        relevance: 'Skills mismatch and education-to-employment transition',
        usage: 'Link education policy to labor market outcomes',
        priority: SEC,
      },
    ],
  },

  // ── Legal Affairs ──
  JURI: {
    name: 'Legal Affairs',
    abbreviation: 'JURI',
    policyDomain: 'Legal matters, intellectual property, company law',
    analysisPerspectives: [AnalysisPerspective.LEGAL, AnalysisPerspective.ECONOMIC],
    indicators: [
      {
        indicatorId: WB_INDICATORS.GDP,
        name: N.GDP,
        relevance: 'Scale of economic activity subject to EU legal frameworks',
        usage: 'Contextualize corporate governance and IP law proposals',
        priority: SEC,
      },
      {
        indicatorId: WB_INDICATORS.HIGHTECH_EXPORTS,
        name: N.HIGHTECH,
        relevance: 'IP-intensive sectors affected by legal frameworks',
        usage: 'Frame AI regulation and digital IP debates with trade data',
        priority: SEC,
      },
    ],
  },

  // ── Civil Liberties ──
  LIBE: {
    name: 'Civil Liberties, Justice and Home Affairs',
    abbreviation: 'LIBE',
    policyDomain: 'Fundamental rights, migration, asylum, security',
    analysisPerspectives: [AnalysisPerspective.SOCIAL, AnalysisPerspective.LEGAL],
    indicators: [
      {
        indicatorId: WB_INDICATORS.NET_MIGRATION,
        name: N.NET_MIGRATION,
        relevance: 'Core metric for migration and asylum policy',
        usage: 'Quantify migration flows in asylum reform debates',
        priority: PRI,
      },
      {
        indicatorId: WB_INDICATORS.POPULATION,
        name: N.POPULATION,
        relevance: 'Demographic context for burden-sharing debates',
        usage: 'Proportionality of refugee quotas relative to population',
        priority: SEC,
      },
      {
        indicatorId: WB_INDICATORS.INTERNET_USERS,
        name: N.INTERNET,
        relevance: 'Digital rights and surveillance regulation',
        usage: 'Frame digital privacy debates with connectivity data',
        priority: SEC,
      },
    ],
  },

  // ── Constitutional Affairs ──
  AFCO: {
    name: 'Constitutional Affairs',
    abbreviation: 'AFCO',
    policyDomain: 'EU treaties, institutional reform, electoral law',
    analysisPerspectives: [AnalysisPerspective.INSTITUTIONAL, AnalysisPerspective.POLITICAL],
    indicators: [
      {
        indicatorId: WB_INDICATORS.POPULATION,
        name: N.POPULATION,
        relevance: 'EP seat allocation proportionality',
        usage: 'Contextualize electoral reform and degressive proportionality',
        priority: PRI,
      },
      {
        indicatorId: WB_INDICATORS.GDP_PER_CAPITA,
        name: N.GDP_PER_CAPITA,
        relevance: 'Economic divergence as treaty reform driver',
        usage: 'Frame institutional reform debates with economic data',
        priority: SEC,
      },
    ],
  },

  // ── Foreign Affairs ──
  AFET: {
    name: 'Foreign Affairs',
    abbreviation: 'AFET',
    policyDomain: 'EU external relations, CFSP, neighbourhood policy',
    analysisPerspectives: [AnalysisPerspective.GEOPOLITICAL, AnalysisPerspective.ECONOMIC],
    indicators: [
      {
        indicatorId: WB_INDICATORS.MILITARY_EXPENDITURE,
        name: N.MILITARY,
        relevance: 'Defence spending and CSDP/NATO commitments',
        usage: 'Contextualize EU defence and security policy debates',
        priority: PRI,
      },
      {
        indicatorId: WB_INDICATORS.TRADE,
        name: N.TRADE,
        relevance: 'Trade relationships and sanctions impact',
        usage: 'Assess economic dimensions of foreign policy decisions',
        priority: PRI,
      },
      {
        indicatorId: WB_INDICATORS.FDI_NET,
        name: N.FDI,
        relevance: 'Investment screening and economic sovereignty',
        usage: 'Frame debates on foreign investment controls',
        priority: SEC,
      },
      {
        indicatorId: WB_INDICATORS.GDP,
        name: N.GDP,
        relevance: 'Economic weight in geopolitical negotiations',
        usage: 'Compare EU economic leverage in diplomatic contexts',
        priority: SEC,
      },
    ],
  },

  // ── Development ──
  DEVE: {
    name: 'Development',
    abbreviation: 'DEVE',
    policyDomain: 'Development cooperation, humanitarian aid',
    analysisPerspectives: [AnalysisPerspective.GEOPOLITICAL, AnalysisPerspective.SOCIAL],
    indicators: [
      {
        indicatorId: WB_INDICATORS.GNI_PER_CAPITA,
        name: N.GNI,
        relevance: 'ODA commitments (0.7% GNI target)',
        usage: 'Track EU development aid commitments against GNI',
        priority: PRI,
      },
      {
        indicatorId: WB_INDICATORS.LIFE_EXPECTANCY,
        name: N.LIFE_EXPECTANCY,
        relevance: 'SDG health outcome benchmarks',
        usage: 'Measure development progress in partner countries',
        priority: SEC,
      },
      {
        indicatorId: WB_INDICATORS.POPULATION_GROWTH,
        name: N.POP_GROWTH,
        relevance: 'Demographic trends in development regions',
        usage: 'Contextualize development aid allocation decisions',
        priority: SEC,
      },
    ],
  },

  // ── International Trade ──
  INTA: {
    name: 'International Trade',
    abbreviation: 'INTA',
    policyDomain: 'Trade agreements, trade defence, WTO',
    analysisPerspectives: [AnalysisPerspective.ECONOMIC, AnalysisPerspective.GEOPOLITICAL],
    indicators: [
      {
        indicatorId: WB_INDICATORS.TRADE,
        name: N.TRADE,
        relevance: 'Overall trade openness of EU economy',
        usage: 'Frame trade agreement negotiations with openness metrics',
        priority: PRI,
      },
      {
        indicatorId: WB_INDICATORS.EXPORTS_GDP,
        name: 'Exports (% of GDP)',
        relevance: 'Export dependency and market diversification',
        usage: 'Assess export exposure in trade defence instrument debates',
        priority: PRI,
      },
      {
        indicatorId: WB_INDICATORS.FDI_NET,
        name: N.FDI,
        relevance: 'Investment chapter of trade agreements',
        usage: 'Contextualize investment protection and screening debates',
        priority: PRI,
      },
      {
        indicatorId: WB_INDICATORS.HIGHTECH_EXPORTS,
        name: N.HIGHTECH,
        relevance: 'Technology sovereignty in trade policy',
        usage: 'Frame export controls and strategic autonomy discussions',
        priority: SEC,
      },
    ],
  },

  // ── Petitions ──
  PETI: {
    name: 'Petitions',
    abbreviation: 'PETI',
    policyDomain: 'Citizen petitions, EU ombudsman, fundamental rights',
    analysisPerspectives: [AnalysisPerspective.SOCIAL, AnalysisPerspective.INSTITUTIONAL],
    indicators: [
      {
        indicatorId: WB_INDICATORS.INTERNET_USERS,
        name: N.INTERNET,
        relevance: 'Digital access for citizen engagement',
        usage: 'Assess digital accessibility of petition process',
        priority: SEC,
      },
      {
        indicatorId: WB_INDICATORS.POPULATION,
        name: N.POPULATION,
        relevance: 'Petition volume proportionality',
        usage: 'Normalize petition counts by member state population',
        priority: SEC,
      },
    ],
  },

  // ── Security & Defence (sub-committee) ──
  SEDE: {
    name: 'Security and Defence',
    abbreviation: 'SEDE',
    policyDomain: 'CSDP, defence industry, military cooperation',
    analysisPerspectives: [AnalysisPerspective.GEOPOLITICAL, AnalysisPerspective.ECONOMIC],
    indicators: [
      {
        indicatorId: WB_INDICATORS.MILITARY_EXPENDITURE,
        name: N.MILITARY,
        relevance: 'NATO 2% GDP target and EU defence fund',
        usage: 'Track defence spending commitments across member states',
        priority: PRI,
      },
      {
        indicatorId: WB_INDICATORS.GDP,
        name: N.GDP,
        relevance: 'Economic capacity for defence investment',
        usage: 'Assess defence burden-sharing proportionality',
        priority: SEC,
      },
    ],
  },

  // ── Human Rights (sub-committee) ──
  DROI: {
    name: 'Human Rights',
    abbreviation: 'DROI',
    policyDomain: 'Human rights, democracy, rule of law',
    analysisPerspectives: [AnalysisPerspective.SOCIAL, AnalysisPerspective.GEOPOLITICAL],
    indicators: [
      {
        indicatorId: WB_INDICATORS.GINI_INDEX,
        name: N.GINI,
        relevance: 'Economic inequality as rights context',
        usage: 'Correlate inequality data with human rights assessments',
        priority: SEC,
      },
      {
        indicatorId: WB_INDICATORS.LIFE_EXPECTANCY,
        name: N.LIFE_EXPECTANCY,
        relevance: 'Right to health outcome indicator',
        usage: 'Benchmark health outcomes in human rights reporting',
        priority: SEC,
      },
    ],
  },
} as const;
