// SPDX-FileCopyrightText: 2024-2026 Hack23 AB
// SPDX-License-Identifier: Apache-2.0

/**
 * @module Constants/WorldBank/CommitteeMap
 * @description EP standing committee → World Bank indicator declarative map.
 *
 * Covers all 20 EP standing committees. Each entry includes:
 * - Committee metadata (name, policy domain)
 * - Primary indicators (core to the committee's mandate)
 * - Secondary indicators (useful context)
 * - Analysis perspectives for editorial framing
 */

import { AnalysisPerspective } from '../../types/common.js';
import { WB_INDICATORS, N, PRI, SEC, type WBIndicatorId } from './indicator-catalog.js';

// ─── Committee → Indicator Mapping ───────────────────────────────────────────

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

/**
 * Maps EP committee abbreviations to their World Bank indicator mappings.
 *
 * Covers all 20 EP standing committees. Each entry includes:
 * - Committee metadata (name, policy domain)
 * - Primary indicators (core to the committee's mandate)
 * - Secondary indicators (useful context)
 * - Analysis perspectives for editorial framing
 */
export const COMMITTEE_INDICATOR_MAP: Readonly<Record<string, CommitteeIndicatorEntry>> = {
  // ── Economic & Financial ──
  ECON: {
    name: 'Economic and Monetary Affairs',
    abbreviation: 'ECON',
    policyDomain: 'Economic governance, monetary policy, financial regulation',
    analysisPerspectives: [AnalysisPerspective.ECONOMIC, AnalysisPerspective.INSTITUTIONAL],
    indicators: [
      {
        indicatorId: WB_INDICATORS.GDP_GROWTH,
        name: N.GDP_GROWTH,
        relevance: 'Core metric for economic policy assessment',
        usage: 'Contextualize fiscal policy debates and eurozone economic health',
        priority: PRI,
      },
      {
        indicatorId: WB_INDICATORS.INFLATION,
        name: N.INFLATION,
        relevance: 'Central to ECB monetary policy discussions',
        usage: 'Frame debates on interest rates, price stability, and cost of living',
        priority: PRI,
      },
      {
        indicatorId: WB_INDICATORS.UNEMPLOYMENT,
        name: N.UNEMPLOYMENT,
        relevance: 'Key indicator for economic governance resolutions',
        usage: 'Assess effectiveness of EU economic coordination policies',
        priority: PRI,
      },
      {
        indicatorId: WB_INDICATORS.TAX_REVENUE,
        name: N.TAX,
        relevance: 'Relevant to EU tax harmonization debates',
        usage: 'Compare national fiscal capacities in tax policy discussions',
        priority: SEC,
      },
      {
        indicatorId: WB_INDICATORS.GOV_EXPENDITURE,
        name: N.GOV_EXP,
        relevance: 'Fiscal discipline and stability pact compliance',
        usage: 'Contextualize budget deficit and debt sustainability debates',
        priority: SEC,
      },
    ],
  },

  BUDG: {
    name: 'Budgets',
    abbreviation: 'BUDG',
    policyDomain: 'EU budget, Multiannual Financial Framework',
    analysisPerspectives: [AnalysisPerspective.ECONOMIC, AnalysisPerspective.INSTITUTIONAL],
    indicators: [
      {
        indicatorId: WB_INDICATORS.GDP,
        name: N.GDP,
        relevance: 'EU budget is proportional to member state GNI',
        usage: 'Contextualize EU budget contributions and cohesion fund allocations',
        priority: PRI,
      },
      {
        indicatorId: WB_INDICATORS.GOV_EXPENDITURE,
        name: N.GOV_EXP,
        relevance: 'National spending patterns inform EU budget negotiations',
        usage: 'Compare public spending priorities across member states',
        priority: PRI,
      },
      {
        indicatorId: WB_INDICATORS.TAX_REVENUE,
        name: N.TAX,
        relevance: 'Own resources and EU revenue discussions',
        usage: 'Frame debates on new EU own resources proposals',
        priority: SEC,
      },
    ],
  },

  CONT: {
    name: 'Budgetary Control',
    abbreviation: 'CONT',
    policyDomain: 'Budget execution, audit, anti-fraud',
    analysisPerspectives: [AnalysisPerspective.INSTITUTIONAL, AnalysisPerspective.ECONOMIC],
    indicators: [
      {
        indicatorId: WB_INDICATORS.GOV_EXPENDITURE,
        name: N.GOV_EXP,
        relevance: 'Benchmarks for public spending efficiency',
        usage: 'Assess EU fund absorption rates against national spending patterns',
        priority: PRI,
      },
      {
        indicatorId: WB_INDICATORS.GDP,
        name: N.GDP,
        relevance: 'Context for EU fund disbursement scale',
        usage: 'Proportionality of EU recovery and cohesion fund allocations',
        priority: SEC,
      },
    ],
  },

  // ── Employment & Social ──
  EMPL: {
    name: 'Employment and Social Affairs',
    abbreviation: 'EMPL',
    policyDomain: 'Employment policy, social protection, working conditions',
    analysisPerspectives: [AnalysisPerspective.SOCIAL, AnalysisPerspective.ECONOMIC],
    indicators: [
      {
        indicatorId: WB_INDICATORS.UNEMPLOYMENT,
        name: N.UNEMPLOYMENT,
        relevance: 'Primary metric for employment policy effectiveness',
        usage: 'Track labor market conditions driving legislative action',
        priority: PRI,
      },
      {
        indicatorId: WB_INDICATORS.YOUTH_UNEMPLOYMENT,
        name: N.YOUTH_UNEMP,
        relevance: 'Central to Youth Guarantee and skills agenda',
        usage: 'Highlight generational employment gaps in social policy debates',
        priority: PRI,
      },
      {
        indicatorId: WB_INDICATORS.LABOR_PARTICIPATION,
        name: N.LABOR,
        relevance: 'Measures workforce engagement beyond headline unemployment',
        usage: 'Assess structural employment challenges and inactivity rates',
        priority: SEC,
      },
      {
        indicatorId: WB_INDICATORS.GINI_INDEX,
        name: N.GINI,
        relevance: 'Income inequality drives social protection debates',
        usage: 'Contextualize minimum wage and social pillar discussions',
        priority: SEC,
      },
      {
        indicatorId: WB_INDICATORS.EMPLOYMENT_RATIO,
        name: N.EMPLOYMENT,
        relevance: 'Broad employment health metric',
        usage: 'Compare employment outcomes across member states',
        priority: SEC,
      },
    ],
  },

  // ── Environment ──
  ENVI: {
    name: 'Environment, Public Health and Food Safety',
    abbreviation: 'ENVI',
    policyDomain: 'Climate, environment, public health, food safety',
    analysisPerspectives: [AnalysisPerspective.ENVIRONMENTAL, AnalysisPerspective.SOCIAL],
    indicators: [
      {
        indicatorId: WB_INDICATORS.CO2_EMISSIONS,
        name: N.CO2,
        relevance: 'Core metric for EU Green Deal and climate targets',
        usage: 'Track progress toward 55% reduction target and net-zero by 2050',
        priority: PRI,
      },
      {
        indicatorId: WB_INDICATORS.RENEWABLE_ENERGY,
        name: N.RENEWABLE,
        relevance: 'REPowerEU and renewable energy directive benchmarks',
        usage: 'Measure clean energy transition across member states',
        priority: PRI,
      },
      {
        indicatorId: WB_INDICATORS.HEALTH_EXPENDITURE,
        name: N.HEALTH,
        relevance: 'EU health policy and pandemic preparedness',
        usage: 'Contextualize public health legislation and EU4Health programme',
        priority: PRI,
      },
      {
        indicatorId: WB_INDICATORS.FOREST_AREA,
        name: N.FOREST,
        relevance: 'Biodiversity strategy and deforestation regulation',
        usage: 'Assess land-use change in environmental policy debates',
        priority: SEC,
      },
      {
        indicatorId: WB_INDICATORS.ENERGY_USE,
        name: N.ENERGY,
        relevance: 'Energy efficiency directive benchmarks',
        usage: 'Track energy consumption trends relevant to climate legislation',
        priority: SEC,
      },
    ],
  },

  // ── Industry & Research ──
  ITRE: {
    name: 'Industry, Research and Energy',
    abbreviation: 'ITRE',
    policyDomain: 'Industrial policy, research, energy, digital',
    analysisPerspectives: [AnalysisPerspective.ECONOMIC, AnalysisPerspective.ENVIRONMENTAL],
    indicators: [
      {
        indicatorId: WB_INDICATORS.RD_EXPENDITURE,
        name: N.RD,
        relevance: 'Horizon Europe and 3% GDP R&D target',
        usage: 'Measure innovation investment gaps across member states',
        priority: PRI,
      },
      {
        indicatorId: WB_INDICATORS.RENEWABLE_ENERGY,
        name: N.RENEWABLE,
        relevance: 'Energy policy and REPowerEU targets',
        usage: 'Track energy transition for industrial competitiveness',
        priority: PRI,
      },
      {
        indicatorId: WB_INDICATORS.HIGHTECH_EXPORTS,
        name: N.HIGHTECH,
        relevance: 'EU industrial competitiveness and strategic autonomy',
        usage: 'Assess technology sovereignty in trade and industrial debates',
        priority: PRI,
      },
      {
        indicatorId: WB_INDICATORS.INTERNET_USERS,
        name: N.INTERNET,
        relevance: 'Digital single market and connectivity targets',
        usage: 'Measure digital divide and broadband access progress',
        priority: SEC,
      },
      {
        indicatorId: WB_INDICATORS.ENERGY_USE,
        name: N.ENERGY,
        relevance: 'Energy efficiency and industrial energy policy',
        usage: 'Contextualize energy security and pricing debates',
        priority: SEC,
      },
    ],
  },

  // ── Internal Market ──
  IMCO: {
    name: 'Internal Market and Consumer Protection',
    abbreviation: 'IMCO',
    policyDomain: 'Single market, consumer rights, product safety',
    analysisPerspectives: [AnalysisPerspective.ECONOMIC, AnalysisPerspective.SOCIAL],
    indicators: [
      {
        indicatorId: WB_INDICATORS.TRADE,
        name: N.TRADE,
        relevance: 'Intra-EU trade flows reflect single market health',
        usage: 'Assess single market integration and barriers',
        priority: PRI,
      },
      {
        indicatorId: WB_INDICATORS.GDP_PER_CAPITA,
        name: N.GDP_PER_CAPITA,
        relevance: 'Consumer purchasing power across member states',
        usage: 'Contextualize consumer protection and market access debates',
        priority: PRI,
      },
      {
        indicatorId: WB_INDICATORS.INTERNET_USERS,
        name: N.INTERNET,
        relevance: 'Digital services and e-commerce regulation',
        usage: 'Frame digital market legislation with connectivity data',
        priority: SEC,
      },
    ],
  },

  // ── Transport & Tourism ──
  TRAN: {
    name: 'Transport and Tourism',
    abbreviation: 'TRAN',
    policyDomain: 'Transport, mobility, tourism',
    analysisPerspectives: [AnalysisPerspective.ECONOMIC, AnalysisPerspective.ENVIRONMENTAL],
    indicators: [
      {
        indicatorId: WB_INDICATORS.CO2_EMISSIONS,
        name: N.CO2,
        relevance: 'Transport is ~25% of EU emissions',
        usage: 'Contextualize transport decarbonization legislation',
        priority: PRI,
      },
      {
        indicatorId: WB_INDICATORS.ENERGY_USE,
        name: N.ENERGY,
        relevance: 'Transport energy efficiency and alternative fuels',
        usage: 'Track energy consumption trends in mobility sector',
        priority: SEC,
      },
      {
        indicatorId: WB_INDICATORS.GDP_GROWTH,
        name: N.GDP_GROWTH,
        relevance: 'Tourism contribution to economic growth',
        usage: 'Frame tourism recovery and cross-border mobility debates',
        priority: SEC,
      },
    ],
  },

  // ── Regional Development ──
  REGI: {
    name: 'Regional Development',
    abbreviation: 'REGI',
    policyDomain: 'Cohesion policy, structural funds, territorial development',
    analysisPerspectives: [AnalysisPerspective.ECONOMIC, AnalysisPerspective.SOCIAL],
    indicators: [
      {
        indicatorId: WB_INDICATORS.GDP_PER_CAPITA,
        name: N.GDP_PER_CAPITA,
        relevance: 'Cohesion fund eligibility threshold (75% of EU average)',
        usage: 'Identify convergence/divergence across EU regions',
        priority: PRI,
      },
      {
        indicatorId: WB_INDICATORS.UNEMPLOYMENT,
        name: N.UNEMPLOYMENT,
        relevance: 'ESF+ and regional employment fund targeting',
        usage: 'Map regional employment disparities for cohesion policy',
        priority: PRI,
      },
      {
        indicatorId: WB_INDICATORS.POPULATION_GROWTH,
        name: N.POP_GROWTH,
        relevance: 'Demographic challenges in rural/peripheral regions',
        usage: 'Assess depopulation risks in territorial cohesion debates',
        priority: SEC,
      },
    ],
  },

  // ── Agriculture ──
  AGRI: {
    name: 'Agriculture and Rural Development',
    abbreviation: 'AGRI',
    policyDomain: 'Common Agricultural Policy, rural development, food systems',
    analysisPerspectives: [AnalysisPerspective.ECONOMIC, AnalysisPerspective.ENVIRONMENTAL],
    indicators: [
      {
        indicatorId: WB_INDICATORS.AGRICULTURE_GDP,
        name: N.AGRICULTURE,
        relevance: 'CAP budget and agricultural sector weight',
        usage: 'Contextualize CAP reform debates with sector economic data',
        priority: PRI,
      },
      {
        indicatorId: WB_INDICATORS.CEREAL_YIELD,
        name: N.CEREAL,
        relevance: 'Productivity and food security metrics',
        usage: 'Assess agricultural productivity in food security debates',
        priority: PRI,
      },
      {
        indicatorId: WB_INDICATORS.ARABLE_LAND,
        name: N.ARABLE,
        relevance: 'Land use and environmental conditionality',
        usage: 'Frame CAP environmental requirements with land-use data',
        priority: SEC,
      },
      {
        indicatorId: WB_INDICATORS.CO2_EMISSIONS,
        name: N.CO2,
        relevance: 'Agricultural emissions and Farm to Fork strategy',
        usage: 'Contextualize agricultural sustainability requirements',
        priority: SEC,
      },
    ],
  },

  // ── Fisheries ──
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
