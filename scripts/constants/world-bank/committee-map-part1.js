// SPDX-FileCopyrightText: 2024-2026 Hack23 AB
// SPDX-License-Identifier: Apache-2.0
/**
 * @module Constants/WorldBank/CommitteeMapPart1
 * @description First half of committee → World Bank indicator entries.
 * Merged with part2 in committee-map.ts.
 */
import { WB_INDICATORS, N, PRI, SEC } from './indicator-catalog.js';
import { AnalysisPerspective } from '../../types/index.js';
export const COMMITTEE_INDICATOR_MAP_PART1 = {
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
};
//# sourceMappingURL=committee-map-part1.js.map