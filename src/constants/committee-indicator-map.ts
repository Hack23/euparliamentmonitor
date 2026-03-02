// SPDX-FileCopyrightText: 2024-2026 Hack23 AB
// SPDX-License-Identifier: Apache-2.0

/**
 * @module Constants/CommitteeIndicatorMap
 * @description Maps European Parliament committees and article categories to
 * World Bank indicators for economic context enrichment.
 *
 * Each EP standing committee covers a specific policy domain. This module
 * provides a declarative mapping from committee abbreviations (e.g. 'ECON',
 * 'ENVI') and article categories (e.g. PROPOSITIONS, MONTH_AHEAD) to the
 * World Bank indicators most relevant to their legislative mandates.
 *
 * Used by news generation strategies to automatically select the right
 * economic indicators when enriching articles with World Bank data.
 */

import { ArticleCategory } from '../types/common.js';

// ─── Priority Constants ──────────────────────────────────────────────────────

/** Priority value for indicators that should always be fetched */
const PRI = 'primary' as const;

/** Priority value for indicators that are optional enrichment */
const SEC = 'secondary' as const;

// ─── Human-Readable Indicator Names ──────────────────────────────────────────

/** Reusable indicator display names (prevents sonarjs/no-duplicate-string) */
const N = {
  GDP_GROWTH: 'GDP Growth',
  GDP: 'GDP',
  GDP_PER_CAPITA: 'GDP per Capita',
  INFLATION: 'Inflation',
  UNEMPLOYMENT: 'Unemployment',
  TRADE: 'Trade',
  CO2: 'CO₂ Emissions',
  RENEWABLE: 'Renewable Energy',
  ENERGY: 'Energy Use',
  FOREST: 'Forest Area',
  POPULATION: 'Population',
  POP_GROWTH: 'Population Growth',
  LIFE_EXPECTANCY: 'Life Expectancy',
  NET_MIGRATION: 'Net Migration',
  LABOR: 'Labor Participation',
  EMPLOYMENT: 'Employment Ratio',
  YOUTH_UNEMP: 'Youth Unemployment',
  RD: 'R&D Expenditure',
  EDUCATION: 'Education Expenditure',
  TERTIARY: 'Tertiary Enrollment',
  HEALTH: 'Health Expenditure',
  HOSPITAL: 'Hospital Beds',
  AGRICULTURE: 'Agriculture (% of GDP)',
  CEREAL: 'Cereal Yield',
  ARABLE: 'Arable Land',
  TAX: 'Tax Revenue',
  GOV_EXP: 'Government Expenditure',
  MILITARY: 'Military Expenditure',
  INTERNET: 'Internet Users',
  HIGHTECH: 'High-tech Exports',
  FDI: 'FDI Net Inflows',
  GNI: 'GNI per Capita',
  GINI: 'GINI Index',
} as const;

// ─── World Bank Indicator IDs ────────────────────────────────────────────────

/**
 * Extended set of World Bank indicator IDs relevant to EU Parliament policy areas.
 * Superset of {@link PolicyRelevantIndicators} — includes domain-specific indicators
 * that map to individual committee mandates.
 */
export const WB_INDICATORS = {
  // ── Macro-economic ──
  /** GDP (current US$) */
  GDP: 'NY.GDP.MKTP.CD',
  /** GDP growth (annual %) */
  GDP_GROWTH: 'NY.GDP.MKTP.KD.ZG',
  /** GDP per capita (current US$) */
  GDP_PER_CAPITA: 'NY.GDP.PCAP.CD',
  /** GNI per capita, Atlas method (current US$) */
  GNI_PER_CAPITA: 'NY.GNP.PCAP.CD',
  /** Inflation, consumer prices (annual %) */
  INFLATION: 'FP.CPI.TOTL.ZG',
  /** Unemployment, total (% of total labor force) */
  UNEMPLOYMENT: 'SL.UEM.TOTL.ZS',

  // ── Trade & investment ──
  /** Trade (% of GDP) */
  TRADE: 'NE.TRD.GNFS.ZS',
  /** Exports of goods and services (% of GDP) */
  EXPORTS_GDP: 'NE.EXP.GNFS.ZS',
  /** Foreign direct investment, net inflows (% of GDP) */
  FDI_NET: 'BX.KLT.DINV.WD.GD.ZS',

  // ── Environment & energy ──
  /** CO2 emissions (metric tons per capita) */
  CO2_EMISSIONS: 'EN.ATM.CO2E.PC',
  /** Renewable energy consumption (% of total final energy consumption) */
  RENEWABLE_ENERGY: 'EG.FEC.RNEW.ZS',
  /** Energy use (kg of oil equivalent per capita) */
  ENERGY_USE: 'EG.USE.PCAP.KG.OE',
  /** Forest area (% of land area) */
  FOREST_AREA: 'AG.LND.FRST.ZS',

  // ── Demographics & social ──
  /** Population, total */
  POPULATION: 'SP.POP.TOTL',
  /** Population growth (annual %) */
  POPULATION_GROWTH: 'SP.POP.GROW',
  /** Life expectancy at birth, total (years) */
  LIFE_EXPECTANCY: 'SP.DYN.LE00.IN',
  /** Net migration */
  NET_MIGRATION: 'SM.POP.NETM',

  // ── Labor ──
  /** Labor force participation rate, total (% of total population ages 15+) */
  LABOR_PARTICIPATION: 'SL.TLF.CACT.ZS',
  /** Employment to population ratio, 15+, total (%) */
  EMPLOYMENT_RATIO: 'SL.EMP.TOTL.SP.ZS',
  /** Youth unemployment rate (% of total labor force ages 15-24) */
  YOUTH_UNEMPLOYMENT: 'SL.UEM.1524.ZS',

  // ── Education & R&D ──
  /** Research and development expenditure (% of GDP) */
  RD_EXPENDITURE: 'GB.XPD.RSDV.GD.ZS',
  /** Government expenditure on education, total (% of GDP) */
  EDUCATION_EXPENDITURE: 'SE.XPD.TOTL.GD.ZS',
  /** School enrollment, tertiary (% gross) */
  TERTIARY_ENROLLMENT: 'SE.TER.ENRR',

  // ── Health ──
  /** Current health expenditure (% of GDP) */
  HEALTH_EXPENDITURE: 'SH.XPD.CHEX.GD.ZS',
  /** Hospital beds (per 1,000 people) */
  HOSPITAL_BEDS: 'SH.MED.BEDS.ZS',

  // ── Agriculture & food ──
  /** Agriculture, forestry, and fishing, value added (% of GDP) */
  AGRICULTURE_GDP: 'NV.AGR.TOTL.ZS',
  /** Cereal yield (kg per hectare) */
  CEREAL_YIELD: 'AG.YLD.CREL.KG',
  /** Arable land (% of land area) */
  ARABLE_LAND: 'AG.LND.ARBL.ZS',

  // ── Governance & fiscal ──
  /** Tax revenue (% of GDP) */
  TAX_REVENUE: 'GC.TAX.TOTL.GD.ZS',
  /** General government final consumption expenditure (% of GDP) */
  GOV_EXPENDITURE: 'NE.CON.GOVT.ZS',
  /** Military expenditure (% of GDP) */
  MILITARY_EXPENDITURE: 'MS.MIL.XPND.GD.ZS',

  // ── Digital & connectivity ──
  /** Individuals using the Internet (% of population) */
  INTERNET_USERS: 'IT.NET.USER.ZS',
  /** High-technology exports (% of manufactured exports) */
  HIGHTECH_EXPORTS: 'TX.VAL.TECH.MF.ZS',

  // ── Inequality & poverty ──
  /** GINI index (World Bank estimate) */
  GINI_INDEX: 'SI.POV.GINI',
} as const;

/** World Bank indicator ID type — string literal union from WB_INDICATORS values */
export type WBIndicatorId = (typeof WB_INDICATORS)[keyof typeof WB_INDICATORS];

// ─── Committee → Indicator Mapping ───────────────────────────────────────────

/**
 * Describes why a specific World Bank indicator is relevant to a committee
 * or article category, and how it should be used in news articles.
 */
export interface IndicatorMapping {
  /** World Bank indicator ID */
  readonly indicatorId: string;
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
  readonly analysisPerspectives: readonly string[];
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
    analysisPerspectives: ['economic', 'institutional'],
    indicators: [
      { indicatorId: WB_INDICATORS.GDP_GROWTH, name: N.GDP_GROWTH, relevance: 'Core metric for economic policy assessment', usage: 'Contextualize fiscal policy debates and eurozone economic health', priority: PRI },
      { indicatorId: WB_INDICATORS.INFLATION, name: N.INFLATION, relevance: 'Central to ECB monetary policy discussions', usage: 'Frame debates on interest rates, price stability, and cost of living', priority: PRI },
      { indicatorId: WB_INDICATORS.UNEMPLOYMENT, name: N.UNEMPLOYMENT, relevance: 'Key indicator for economic governance resolutions', usage: 'Assess effectiveness of EU economic coordination policies', priority: PRI },
      { indicatorId: WB_INDICATORS.TAX_REVENUE, name: N.TAX, relevance: 'Relevant to EU tax harmonization debates', usage: 'Compare national fiscal capacities in tax policy discussions', priority: SEC },
      { indicatorId: WB_INDICATORS.GOV_EXPENDITURE, name: N.GOV_EXP, relevance: 'Fiscal discipline and stability pact compliance', usage: 'Contextualize budget deficit and debt sustainability debates', priority: SEC },
    ],
  },

  BUDG: {
    name: 'Budgets',
    abbreviation: 'BUDG',
    policyDomain: 'EU budget, Multiannual Financial Framework',
    analysisPerspectives: ['economic', 'institutional'],
    indicators: [
      { indicatorId: WB_INDICATORS.GDP, name: N.GDP, relevance: 'EU budget is proportional to member state GNI', usage: 'Contextualize EU budget contributions and cohesion fund allocations', priority: PRI },
      { indicatorId: WB_INDICATORS.GOV_EXPENDITURE, name: N.GOV_EXP, relevance: 'National spending patterns inform EU budget negotiations', usage: 'Compare public spending priorities across member states', priority: PRI },
      { indicatorId: WB_INDICATORS.TAX_REVENUE, name: N.TAX, relevance: 'Own resources and EU revenue discussions', usage: 'Frame debates on new EU own resources proposals', priority: SEC },
    ],
  },

  CONT: {
    name: 'Budgetary Control',
    abbreviation: 'CONT',
    policyDomain: 'Budget execution, audit, anti-fraud',
    analysisPerspectives: ['institutional', 'economic'],
    indicators: [
      { indicatorId: WB_INDICATORS.GOV_EXPENDITURE, name: N.GOV_EXP, relevance: 'Benchmarks for public spending efficiency', usage: 'Assess EU fund absorption rates against national spending patterns', priority: PRI },
      { indicatorId: WB_INDICATORS.GDP, name: N.GDP, relevance: 'Context for EU fund disbursement scale', usage: 'Proportionality of EU recovery and cohesion fund allocations', priority: SEC },
    ],
  },

  // ── Employment & Social ──
  EMPL: {
    name: 'Employment and Social Affairs',
    abbreviation: 'EMPL',
    policyDomain: 'Employment policy, social protection, working conditions',
    analysisPerspectives: ['social', 'economic'],
    indicators: [
      { indicatorId: WB_INDICATORS.UNEMPLOYMENT, name: N.UNEMPLOYMENT, relevance: 'Primary metric for employment policy effectiveness', usage: 'Track labor market conditions driving legislative action', priority: PRI },
      { indicatorId: WB_INDICATORS.YOUTH_UNEMPLOYMENT, name: N.YOUTH_UNEMP, relevance: 'Central to Youth Guarantee and skills agenda', usage: 'Highlight generational employment gaps in social policy debates', priority: PRI },
      { indicatorId: WB_INDICATORS.LABOR_PARTICIPATION, name: N.LABOR, relevance: 'Measures workforce engagement beyond headline unemployment', usage: 'Assess structural employment challenges and inactivity rates', priority: SEC },
      { indicatorId: WB_INDICATORS.GINI_INDEX, name: N.GINI, relevance: 'Income inequality drives social protection debates', usage: 'Contextualize minimum wage and social pillar discussions', priority: SEC },
      { indicatorId: WB_INDICATORS.EMPLOYMENT_RATIO, name: N.EMPLOYMENT, relevance: 'Broad employment health metric', usage: 'Compare employment outcomes across member states', priority: SEC },
    ],
  },

  // ── Environment ──
  ENVI: {
    name: 'Environment, Public Health and Food Safety',
    abbreviation: 'ENVI',
    policyDomain: 'Climate, environment, public health, food safety',
    analysisPerspectives: ['environmental', 'social'],
    indicators: [
      { indicatorId: WB_INDICATORS.CO2_EMISSIONS, name: N.CO2, relevance: 'Core metric for EU Green Deal and climate targets', usage: 'Track progress toward 55% reduction target and net-zero by 2050', priority: PRI },
      { indicatorId: WB_INDICATORS.RENEWABLE_ENERGY, name: N.RENEWABLE, relevance: 'REPowerEU and renewable energy directive benchmarks', usage: 'Measure clean energy transition across member states', priority: PRI },
      { indicatorId: WB_INDICATORS.HEALTH_EXPENDITURE, name: N.HEALTH, relevance: 'EU health policy and pandemic preparedness', usage: 'Contextualize public health legislation and EU4Health programme', priority: PRI },
      { indicatorId: WB_INDICATORS.FOREST_AREA, name: N.FOREST, relevance: 'Biodiversity strategy and deforestation regulation', usage: 'Assess land-use change in environmental policy debates', priority: SEC },
      { indicatorId: WB_INDICATORS.ENERGY_USE, name: N.ENERGY, relevance: 'Energy efficiency directive benchmarks', usage: 'Track energy consumption trends relevant to climate legislation', priority: SEC },
    ],
  },

  // ── Industry & Research ──
  ITRE: {
    name: 'Industry, Research and Energy',
    abbreviation: 'ITRE',
    policyDomain: 'Industrial policy, research, energy, digital',
    analysisPerspectives: ['economic', 'environmental'],
    indicators: [
      { indicatorId: WB_INDICATORS.RD_EXPENDITURE, name: N.RD, relevance: 'Horizon Europe and 3% GDP R&D target', usage: 'Measure innovation investment gaps across member states', priority: PRI },
      { indicatorId: WB_INDICATORS.RENEWABLE_ENERGY, name: N.RENEWABLE, relevance: 'Energy policy and REPowerEU targets', usage: 'Track energy transition for industrial competitiveness', priority: PRI },
      { indicatorId: WB_INDICATORS.HIGHTECH_EXPORTS, name: N.HIGHTECH, relevance: 'EU industrial competitiveness and strategic autonomy', usage: 'Assess technology sovereignty in trade and industrial debates', priority: PRI },
      { indicatorId: WB_INDICATORS.INTERNET_USERS, name: N.INTERNET, relevance: 'Digital single market and connectivity targets', usage: 'Measure digital divide and broadband access progress', priority: SEC },
      { indicatorId: WB_INDICATORS.ENERGY_USE, name: N.ENERGY, relevance: 'Energy efficiency and industrial energy policy', usage: 'Contextualize energy security and pricing debates', priority: SEC },
    ],
  },

  // ── Internal Market ──
  IMCO: {
    name: 'Internal Market and Consumer Protection',
    abbreviation: 'IMCO',
    policyDomain: 'Single market, consumer rights, product safety',
    analysisPerspectives: ['economic', 'social'],
    indicators: [
      { indicatorId: WB_INDICATORS.TRADE, name: N.TRADE, relevance: 'Intra-EU trade flows reflect single market health', usage: 'Assess single market integration and barriers', priority: PRI },
      { indicatorId: WB_INDICATORS.GDP_PER_CAPITA, name: N.GDP_PER_CAPITA, relevance: 'Consumer purchasing power across member states', usage: 'Contextualize consumer protection and market access debates', priority: PRI },
      { indicatorId: WB_INDICATORS.INTERNET_USERS, name: N.INTERNET, relevance: 'Digital services and e-commerce regulation', usage: 'Frame digital market legislation with connectivity data', priority: SEC },
    ],
  },

  // ── Transport & Tourism ──
  TRAN: {
    name: 'Transport and Tourism',
    abbreviation: 'TRAN',
    policyDomain: 'Transport, mobility, tourism',
    analysisPerspectives: ['economic', 'environmental'],
    indicators: [
      { indicatorId: WB_INDICATORS.CO2_EMISSIONS, name: N.CO2, relevance: 'Transport is ~25% of EU emissions', usage: 'Contextualize transport decarbonization legislation', priority: PRI },
      { indicatorId: WB_INDICATORS.ENERGY_USE, name: N.ENERGY, relevance: 'Transport energy efficiency and alternative fuels', usage: 'Track energy consumption trends in mobility sector', priority: SEC },
      { indicatorId: WB_INDICATORS.GDP_GROWTH, name: N.GDP_GROWTH, relevance: 'Tourism contribution to economic growth', usage: 'Frame tourism recovery and cross-border mobility debates', priority: SEC },
    ],
  },

  // ── Regional Development ──
  REGI: {
    name: 'Regional Development',
    abbreviation: 'REGI',
    policyDomain: 'Cohesion policy, structural funds, territorial development',
    analysisPerspectives: ['economic', 'social'],
    indicators: [
      { indicatorId: WB_INDICATORS.GDP_PER_CAPITA, name: N.GDP_PER_CAPITA, relevance: 'Cohesion fund eligibility threshold (75% of EU average)', usage: 'Identify convergence/divergence across EU regions', priority: PRI },
      { indicatorId: WB_INDICATORS.UNEMPLOYMENT, name: N.UNEMPLOYMENT, relevance: 'ESF+ and regional employment fund targeting', usage: 'Map regional employment disparities for cohesion policy', priority: PRI },
      { indicatorId: WB_INDICATORS.POPULATION_GROWTH, name: N.POP_GROWTH, relevance: 'Demographic challenges in rural/peripheral regions', usage: 'Assess depopulation risks in territorial cohesion debates', priority: SEC },
    ],
  },

  // ── Agriculture ──
  AGRI: {
    name: 'Agriculture and Rural Development',
    abbreviation: 'AGRI',
    policyDomain: 'Common Agricultural Policy, rural development, food systems',
    analysisPerspectives: ['economic', 'environmental'],
    indicators: [
      { indicatorId: WB_INDICATORS.AGRICULTURE_GDP, name: N.AGRICULTURE, relevance: 'CAP budget and agricultural sector weight', usage: 'Contextualize CAP reform debates with sector economic data', priority: PRI },
      { indicatorId: WB_INDICATORS.CEREAL_YIELD, name: N.CEREAL, relevance: 'Productivity and food security metrics', usage: 'Assess agricultural productivity in food security debates', priority: PRI },
      { indicatorId: WB_INDICATORS.ARABLE_LAND, name: N.ARABLE, relevance: 'Land use and environmental conditionality', usage: 'Frame CAP environmental requirements with land-use data', priority: SEC },
      { indicatorId: WB_INDICATORS.CO2_EMISSIONS, name: N.CO2, relevance: 'Agricultural emissions and Farm to Fork strategy', usage: 'Contextualize agricultural sustainability requirements', priority: SEC },
    ],
  },

  // ── Fisheries ──
  PECH: {
    name: 'Fisheries',
    abbreviation: 'PECH',
    policyDomain: 'Common Fisheries Policy, marine resources',
    analysisPerspectives: ['environmental', 'economic'],
    indicators: [
      { indicatorId: WB_INDICATORS.GDP_PER_CAPITA, name: N.GDP_PER_CAPITA, relevance: 'Fishing community livelihoods', usage: 'Assess economic impact of fishing quotas on coastal regions', priority: SEC },
      { indicatorId: WB_INDICATORS.TRADE, name: N.TRADE, relevance: 'Seafood trade and market access', usage: 'Contextualize fisheries agreements and trade impacts', priority: SEC },
    ],
  },

  // ── Culture & Education ──
  CULT: {
    name: 'Culture and Education',
    abbreviation: 'CULT',
    policyDomain: 'Education, culture, media, sport, youth',
    analysisPerspectives: ['social', 'economic'],
    indicators: [
      { indicatorId: WB_INDICATORS.EDUCATION_EXPENDITURE, name: N.EDUCATION, relevance: 'Erasmus+ and EU education investment benchmarks', usage: 'Compare national education spending in skills agenda debates', priority: PRI },
      { indicatorId: WB_INDICATORS.TERTIARY_ENROLLMENT, name: N.TERTIARY, relevance: 'Higher education access and European Education Area', usage: 'Measure higher education participation across member states', priority: PRI },
      { indicatorId: WB_INDICATORS.YOUTH_UNEMPLOYMENT, name: N.YOUTH_UNEMP, relevance: 'Skills mismatch and education-to-employment transition', usage: 'Link education policy to labor market outcomes', priority: SEC },
    ],
  },

  // ── Legal Affairs ──
  JURI: {
    name: 'Legal Affairs',
    abbreviation: 'JURI',
    policyDomain: 'Legal matters, intellectual property, company law',
    analysisPerspectives: ['legal', 'economic'],
    indicators: [
      { indicatorId: WB_INDICATORS.GDP, name: N.GDP, relevance: 'Scale of economic activity subject to EU legal frameworks', usage: 'Contextualize corporate governance and IP law proposals', priority: SEC },
      { indicatorId: WB_INDICATORS.HIGHTECH_EXPORTS, name: N.HIGHTECH, relevance: 'IP-intensive sectors affected by legal frameworks', usage: 'Frame AI regulation and digital IP debates with trade data', priority: SEC },
    ],
  },

  // ── Civil Liberties ──
  LIBE: {
    name: 'Civil Liberties, Justice and Home Affairs',
    abbreviation: 'LIBE',
    policyDomain: 'Fundamental rights, migration, asylum, security',
    analysisPerspectives: ['social', 'legal'],
    indicators: [
      { indicatorId: WB_INDICATORS.NET_MIGRATION, name: N.NET_MIGRATION, relevance: 'Core metric for migration and asylum policy', usage: 'Quantify migration flows in asylum reform debates', priority: PRI },
      { indicatorId: WB_INDICATORS.POPULATION, name: N.POPULATION, relevance: 'Demographic context for burden-sharing debates', usage: 'Proportionality of refugee quotas relative to population', priority: SEC },
      { indicatorId: WB_INDICATORS.INTERNET_USERS, name: N.INTERNET, relevance: 'Digital rights and surveillance regulation', usage: 'Frame digital privacy debates with connectivity data', priority: SEC },
    ],
  },

  // ── Constitutional Affairs ──
  AFCO: {
    name: 'Constitutional Affairs',
    abbreviation: 'AFCO',
    policyDomain: 'EU treaties, institutional reform, electoral law',
    analysisPerspectives: ['institutional', 'political'],
    indicators: [
      { indicatorId: WB_INDICATORS.POPULATION, name: N.POPULATION, relevance: 'EP seat allocation proportionality', usage: 'Contextualize electoral reform and degressive proportionality', priority: PRI },
      { indicatorId: WB_INDICATORS.GDP_PER_CAPITA, name: N.GDP_PER_CAPITA, relevance: 'Economic divergence as treaty reform driver', usage: 'Frame institutional reform debates with economic data', priority: SEC },
    ],
  },

  // ── Foreign Affairs ──
  AFET: {
    name: 'Foreign Affairs',
    abbreviation: 'AFET',
    policyDomain: 'EU external relations, CFSP, neighbourhood policy',
    analysisPerspectives: ['geopolitical', 'economic'],
    indicators: [
      { indicatorId: WB_INDICATORS.MILITARY_EXPENDITURE, name: N.MILITARY, relevance: 'Defence spending and CSDP/NATO commitments', usage: 'Contextualize EU defence and security policy debates', priority: PRI },
      { indicatorId: WB_INDICATORS.TRADE, name: N.TRADE, relevance: 'Trade relationships and sanctions impact', usage: 'Assess economic dimensions of foreign policy decisions', priority: PRI },
      { indicatorId: WB_INDICATORS.FDI_NET, name: N.FDI, relevance: 'Investment screening and economic sovereignty', usage: 'Frame debates on foreign investment controls', priority: SEC },
      { indicatorId: WB_INDICATORS.GDP, name: N.GDP, relevance: 'Economic weight in geopolitical negotiations', usage: 'Compare EU economic leverage in diplomatic contexts', priority: SEC },
    ],
  },

  // ── Development ──
  DEVE: {
    name: 'Development',
    abbreviation: 'DEVE',
    policyDomain: 'Development cooperation, humanitarian aid',
    analysisPerspectives: ['geopolitical', 'social'],
    indicators: [
      { indicatorId: WB_INDICATORS.GNI_PER_CAPITA, name: N.GNI, relevance: 'ODA commitments (0.7% GNI target)', usage: 'Track EU development aid commitments against GNI', priority: PRI },
      { indicatorId: WB_INDICATORS.LIFE_EXPECTANCY, name: N.LIFE_EXPECTANCY, relevance: 'SDG health outcome benchmarks', usage: 'Measure development progress in partner countries', priority: SEC },
      { indicatorId: WB_INDICATORS.POPULATION_GROWTH, name: N.POP_GROWTH, relevance: 'Demographic trends in development regions', usage: 'Contextualize development aid allocation decisions', priority: SEC },
    ],
  },

  // ── International Trade ──
  INTA: {
    name: 'International Trade',
    abbreviation: 'INTA',
    policyDomain: 'Trade agreements, trade defence, WTO',
    analysisPerspectives: ['economic', 'geopolitical'],
    indicators: [
      { indicatorId: WB_INDICATORS.TRADE, name: N.TRADE, relevance: 'Overall trade openness of EU economy', usage: 'Frame trade agreement negotiations with openness metrics', priority: PRI },
      { indicatorId: WB_INDICATORS.EXPORTS_GDP, name: 'Exports (% of GDP)', relevance: 'Export dependency and market diversification', usage: 'Assess export exposure in trade defence instrument debates', priority: PRI },
      { indicatorId: WB_INDICATORS.FDI_NET, name: N.FDI, relevance: 'Investment chapter of trade agreements', usage: 'Contextualize investment protection and screening debates', priority: PRI },
      { indicatorId: WB_INDICATORS.HIGHTECH_EXPORTS, name: N.HIGHTECH, relevance: 'Technology sovereignty in trade policy', usage: 'Frame export controls and strategic autonomy discussions', priority: SEC },
    ],
  },

  // ── Petitions ──
  PETI: {
    name: 'Petitions',
    abbreviation: 'PETI',
    policyDomain: 'Citizen petitions, EU ombudsman, fundamental rights',
    analysisPerspectives: ['social', 'institutional'],
    indicators: [
      { indicatorId: WB_INDICATORS.INTERNET_USERS, name: N.INTERNET, relevance: 'Digital access for citizen engagement', usage: 'Assess digital accessibility of petition process', priority: SEC },
      { indicatorId: WB_INDICATORS.POPULATION, name: N.POPULATION, relevance: 'Petition volume proportionality', usage: 'Normalize petition counts by member state population', priority: SEC },
    ],
  },

  // ── Security & Defence (sub-committee) ──
  SEDE: {
    name: 'Security and Defence',
    abbreviation: 'SEDE',
    policyDomain: 'CSDP, defence industry, military cooperation',
    analysisPerspectives: ['geopolitical', 'economic'],
    indicators: [
      { indicatorId: WB_INDICATORS.MILITARY_EXPENDITURE, name: N.MILITARY, relevance: 'NATO 2% GDP target and EU defence fund', usage: 'Track defence spending commitments across member states', priority: PRI },
      { indicatorId: WB_INDICATORS.GDP, name: N.GDP, relevance: 'Economic capacity for defence investment', usage: 'Assess defence burden-sharing proportionality', priority: SEC },
    ],
  },

  // ── Human Rights (sub-committee) ──
  DROI: {
    name: 'Human Rights',
    abbreviation: 'DROI',
    policyDomain: 'Human rights, democracy, rule of law',
    analysisPerspectives: ['social', 'geopolitical'],
    indicators: [
      { indicatorId: WB_INDICATORS.GINI_INDEX, name: N.GINI, relevance: 'Economic inequality as rights context', usage: 'Correlate inequality data with human rights assessments', priority: SEC },
      { indicatorId: WB_INDICATORS.LIFE_EXPECTANCY, name: N.LIFE_EXPECTANCY, relevance: 'Right to health outcome indicator', usage: 'Benchmark health outcomes in human rights reporting', priority: SEC },
    ],
  },
} as const;

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
    enrichmentStrategy: 'Map each legislative proposal to its policy domain, then fetch the 2-3 most relevant indicators for the dominant domain. Use to explain "why this legislation matters" with economic evidence.',
    primaryIndicators: [
      { indicatorId: WB_INDICATORS.GDP_GROWTH, name: N.GDP_GROWTH, relevance: 'Economic backdrop for legislative proposals', usage: 'Frame the economic context driving new legislation', priority: PRI },
      { indicatorId: WB_INDICATORS.UNEMPLOYMENT, name: N.UNEMPLOYMENT, relevance: 'Employment impact of proposed legislation', usage: 'Assess labor market implications of proposals', priority: PRI },
    ],
    secondaryIndicators: [
      { indicatorId: WB_INDICATORS.INFLATION, name: N.INFLATION, relevance: 'Cost-of-living context for consumer legislation', usage: 'Contextualize price-related regulation proposals', priority: SEC },
      { indicatorId: WB_INDICATORS.TRADE, name: N.TRADE, relevance: 'Trade impact of market regulation proposals', usage: 'Assess trade implications of single market legislation', priority: SEC },
      { indicatorId: WB_INDICATORS.CO2_EMISSIONS, name: N.CO2, relevance: 'Environmental proposals and Green Deal progress', usage: 'Quantify environmental impact of green proposals', priority: SEC },
    ],
    maxWBCalls: 3,
  },

  [ArticleCategory.MONTH_AHEAD]: {
    category: ArticleCategory.MONTH_AHEAD,
    enrichmentStrategy: 'Provide a macroeconomic snapshot for the upcoming month. Focus on 2-3 headline indicators that set the economic backdrop for upcoming parliamentary business.',
    primaryIndicators: [
      { indicatorId: WB_INDICATORS.GDP_GROWTH, name: N.GDP_GROWTH, relevance: 'Economic outlook for upcoming legislative agenda', usage: 'Set the macroeconomic scene for the month ahead', priority: PRI },
      { indicatorId: WB_INDICATORS.INFLATION, name: N.INFLATION, relevance: 'Cost-of-living pressures shaping policy priorities', usage: 'Explain why certain issues dominate the upcoming agenda', priority: PRI },
    ],
    secondaryIndicators: [
      { indicatorId: WB_INDICATORS.UNEMPLOYMENT, name: N.UNEMPLOYMENT, relevance: 'Labor market context for employment legislation', usage: 'Preview employment-related legislative activity', priority: SEC },
    ],
    maxWBCalls: 3,
  },

  [ArticleCategory.MONTH_IN_REVIEW]: {
    category: ArticleCategory.MONTH_IN_REVIEW,
    enrichmentStrategy: 'Retrospective economic assessment: how do the month\'s legislative achievements relate to current economic conditions? Use indicators to measure the "so what" of passed legislation.',
    primaryIndicators: [
      { indicatorId: WB_INDICATORS.GDP_GROWTH, name: N.GDP_GROWTH, relevance: 'Economic context for legislative achievements', usage: 'Assess whether legislation addressed economic realities', priority: PRI },
      { indicatorId: WB_INDICATORS.UNEMPLOYMENT, name: N.UNEMPLOYMENT, relevance: 'Labor market conditions during the review period', usage: 'Evaluate employment-focused legislation effectiveness', priority: PRI },
    ],
    secondaryIndicators: [
      { indicatorId: WB_INDICATORS.INFLATION, name: N.INFLATION, relevance: 'Price stability context for the reviewed period', usage: 'Measure economic conditions during the legislative month', priority: SEC },
      { indicatorId: WB_INDICATORS.FDI_NET, name: N.FDI, relevance: 'Investment climate during the review period', usage: 'Assess investment implications of passed legislation', priority: SEC },
    ],
    maxWBCalls: 3,
  },

  [ArticleCategory.COMMITTEE_REPORTS]: {
    category: ArticleCategory.COMMITTEE_REPORTS,
    enrichmentStrategy: 'Use COMMITTEE_INDICATOR_MAP to select indicators per committee. Each committee section should include 1-2 indicators from its domain mapping.',
    primaryIndicators: [],
    secondaryIndicators: [],
    maxWBCalls: 3,
  },

  [ArticleCategory.WEEK_AHEAD]: {
    category: ArticleCategory.WEEK_AHEAD,
    enrichmentStrategy: 'Light economic context: 1-2 headline indicators to frame the upcoming parliamentary week. Only include when specific agenda items have clear economic dimensions.',
    primaryIndicators: [
      { indicatorId: WB_INDICATORS.GDP_GROWTH, name: N.GDP_GROWTH, relevance: 'Quick economic pulse for the week', usage: 'One-line economic context in the article lede', priority: PRI },
    ],
    secondaryIndicators: [
      { indicatorId: WB_INDICATORS.UNEMPLOYMENT, name: N.UNEMPLOYMENT, relevance: 'Employment context if labor agenda items exist', usage: 'Only include when employment topics are on the agenda', priority: SEC },
    ],
    maxWBCalls: 2,
  },

  [ArticleCategory.WEEK_IN_REVIEW]: {
    category: ArticleCategory.WEEK_IN_REVIEW,
    enrichmentStrategy: 'Retrospective economic context for weekly review. Include when votes or decisions had clear economic implications.',
    primaryIndicators: [
      { indicatorId: WB_INDICATORS.GDP_GROWTH, name: N.GDP_GROWTH, relevance: 'Economic backdrop for the week\'s decisions', usage: 'Frame voting outcomes in economic context', priority: PRI },
    ],
    secondaryIndicators: [
      { indicatorId: WB_INDICATORS.TRADE, name: N.TRADE, relevance: 'If trade-related legislation was debated', usage: 'Only include for trade-relevant weekly activity', priority: SEC },
    ],
    maxWBCalls: 2,
  },

  [ArticleCategory.MOTIONS]: {
    category: ArticleCategory.MOTIONS,
    enrichmentStrategy: 'Selective enrichment: only include economic data when motions/resolutions directly address economic policy. Map voting topics to relevant indicators.',
    primaryIndicators: [],
    secondaryIndicators: [
      { indicatorId: WB_INDICATORS.GDP_GROWTH, name: N.GDP_GROWTH, relevance: 'For economy-related motions', usage: 'Only when motions address economic governance', priority: SEC },
      { indicatorId: WB_INDICATORS.UNEMPLOYMENT, name: N.UNEMPLOYMENT, relevance: 'For employment-related motions', usage: 'Only when motions address labor policy', priority: SEC },
    ],
    maxWBCalls: 2,
  },

  [ArticleCategory.BREAKING_NEWS]: {
    category: ArticleCategory.BREAKING_NEWS,
    enrichmentStrategy: 'Minimal enrichment — breaking news prioritizes speed over depth. Only include one indicator if the breaking event has immediate economic significance.',
    primaryIndicators: [],
    secondaryIndicators: [
      { indicatorId: WB_INDICATORS.GDP_GROWTH, name: N.GDP_GROWTH, relevance: 'Economic context for market-moving decisions', usage: 'Only for economically significant breaking events', priority: SEC },
    ],
    maxWBCalls: 1,
  },

  [ArticleCategory.DEEP_ANALYSIS]: {
    category: ArticleCategory.DEEP_ANALYSIS,
    enrichmentStrategy: 'Maximum enrichment — deep analysis articles should include comprehensive economic context. Use COMMITTEE_INDICATOR_MAP for the primary committee, plus 2-3 cross-cutting indicators.',
    primaryIndicators: [
      { indicatorId: WB_INDICATORS.GDP_GROWTH, name: N.GDP_GROWTH, relevance: 'Macro context for deep analysis', usage: 'Establish economic baseline for multi-perspective analysis', priority: PRI },
      { indicatorId: WB_INDICATORS.UNEMPLOYMENT, name: N.UNEMPLOYMENT, relevance: 'Social dimension of policy analysis', usage: 'Labor market lens for 5-why analysis', priority: PRI },
      { indicatorId: WB_INDICATORS.CO2_EMISSIONS, name: N.CO2, relevance: 'Environmental dimension of policy analysis', usage: 'Environmental lens for 5-why analysis', priority: PRI },
    ],
    secondaryIndicators: [
      { indicatorId: WB_INDICATORS.GINI_INDEX, name: N.GINI, relevance: 'Inequality dimension', usage: 'Social equity lens for distributional analysis', priority: SEC },
      { indicatorId: WB_INDICATORS.TRADE, name: N.TRADE, relevance: 'External dimension', usage: 'Geopolitical lens for trade impact analysis', priority: SEC },
    ],
    maxWBCalls: 5,
  },

  [ArticleCategory.YEAR_AHEAD]: {
    category: ArticleCategory.YEAR_AHEAD,
    enrichmentStrategy: 'Comprehensive economic outlook for the legislative year. Include broad macroeconomic indicators and trend analysis.',
    primaryIndicators: [
      { indicatorId: WB_INDICATORS.GDP_GROWTH, name: N.GDP_GROWTH, relevance: 'Annual economic growth trajectory', usage: 'Set the economic scene for the legislative year', priority: PRI },
      { indicatorId: WB_INDICATORS.INFLATION, name: N.INFLATION, relevance: 'Price stability outlook', usage: 'Frame monetary policy context for the year', priority: PRI },
      { indicatorId: WB_INDICATORS.UNEMPLOYMENT, name: N.UNEMPLOYMENT, relevance: 'Employment outlook', usage: 'Preview employment-related legislative priorities', priority: PRI },
    ],
    secondaryIndicators: [
      { indicatorId: WB_INDICATORS.CO2_EMISSIONS, name: N.CO2, relevance: 'Climate targets for the year', usage: 'Assess Green Deal progress trajectory', priority: SEC },
      { indicatorId: WB_INDICATORS.RD_EXPENDITURE, name: N.RD, relevance: 'Innovation investment trends', usage: 'Preview technology and research policy outlook', priority: SEC },
    ],
    maxWBCalls: 3,
  },

  [ArticleCategory.YEAR_IN_REVIEW]: {
    category: ArticleCategory.YEAR_IN_REVIEW,
    enrichmentStrategy: 'Annual retrospective with comprehensive economic assessment. Compare start-of-year vs end-of-year indicators to measure legislative impact.',
    primaryIndicators: [
      { indicatorId: WB_INDICATORS.GDP_GROWTH, name: N.GDP_GROWTH, relevance: 'Annual economic performance', usage: 'Assess legislative achievements against economic outcomes', priority: PRI },
      { indicatorId: WB_INDICATORS.UNEMPLOYMENT, name: N.UNEMPLOYMENT, relevance: 'Annual employment trend', usage: 'Evaluate employment-focused legislative track record', priority: PRI },
      { indicatorId: WB_INDICATORS.CO2_EMISSIONS, name: N.CO2, relevance: 'Annual climate progress', usage: 'Measure Green Deal legislative impact', priority: PRI },
    ],
    secondaryIndicators: [
      { indicatorId: WB_INDICATORS.INFLATION, name: N.INFLATION, relevance: 'Price stability over the year', usage: 'Retrospective economic conditions assessment', priority: SEC },
    ],
    maxWBCalls: 3,
  },
} as const;

// ─── Helper Functions ────────────────────────────────────────────────────────

/**
 * Get World Bank indicators relevant to a specific EP committee.
 *
 * @param abbreviation - Committee abbreviation (e.g. 'ECON', 'ENVI')
 * @returns Array of indicator mappings, or empty array if committee not found
 */
export function getCommitteeIndicators(abbreviation: string): readonly IndicatorMapping[] {
  const entry = COMMITTEE_INDICATOR_MAP[abbreviation.toUpperCase()];
  return entry?.indicators ?? [];
}

/**
 * Get primary (must-fetch) indicators for a committee.
 *
 * @param abbreviation - Committee abbreviation
 * @returns Array of primary indicator mappings
 */
export function getCommitteePrimaryIndicators(abbreviation: string): readonly IndicatorMapping[] {
  return getCommitteeIndicators(abbreviation).filter((i) => i.priority === 'primary');
}

/**
 * Get World Bank indicators relevant to an article category.
 *
 * @param category - Article category
 * @returns Category indicator entry with enrichment guidance
 */
export function getCategoryIndicators(category: ArticleCategory): CategoryIndicatorEntry {
  return CATEGORY_INDICATOR_MAP[category];
}

/**
 * Get all unique indicator IDs needed for a set of committees.
 * Useful for batch-fetching indicator data for multi-committee articles.
 *
 * @param abbreviations - Committee abbreviation array
 * @param primaryOnly - If true, only return primary indicators
 * @returns Deduplicated array of World Bank indicator IDs
 */
export function getIndicatorIdsForCommittees(
  abbreviations: readonly string[],
  primaryOnly = false
): readonly string[] {
  const ids = new Set<string>();
  for (const abbr of abbreviations) {
    const indicators = primaryOnly
      ? getCommitteePrimaryIndicators(abbr)
      : getCommitteeIndicators(abbr);
    for (const ind of indicators) {
      ids.add(ind.indicatorId);
    }
  }
  return [...ids];
}

/**
 * Get all indicator IDs needed for an article category, including both
 * primary and secondary indicators.
 *
 * @param category - Article category
 * @returns Deduplicated array of World Bank indicator IDs
 */
export function getAllCategoryIndicatorIds(category: ArticleCategory): readonly string[] {
  const entry = CATEGORY_INDICATOR_MAP[category];
  const ids = new Set<string>();
  for (const ind of entry.primaryIndicators) {
    ids.add(ind.indicatorId);
  }
  for (const ind of entry.secondaryIndicators) {
    ids.add(ind.indicatorId);
  }
  return [...ids];
}
