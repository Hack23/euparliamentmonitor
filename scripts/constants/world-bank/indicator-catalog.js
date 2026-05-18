// SPDX-FileCopyrightText: 2024-2026 Hack23 AB
// SPDX-License-Identifier: Apache-2.0
/**
 * @module Constants/WorldBank/IndicatorCatalog
 * @description Curated catalog of World Bank indicators used for EU Parliament
 * news enrichment, plus the shared display-name table and priority constants
 * consumed by {@link Constants/WorldBank/CommitteeMap} and
 * {@link Constants/WorldBank/CategoryMap}.
 *
 * ## ⚠️ For AI Agents / Agentic Workflows
 *
 * The 34 indicators in {@link WB_INDICATORS} are a **curated subset** mapped
 * to EP committee mandates. The full World Bank catalog has **thousands** of
 * indicators. For dynamic indicator discovery:
 *
 * 1. Use `search-indicators` MCP tool to find indicators by keyword on demand
 * 2. Read `analysis/worldbank/indicator-catalog.md` for the full **200+ indicator**
 *    reference organized by 10 EP policy domains
 * 3. Use `analysis/worldbank/use-cases.md` to decide when indicators add editorial value
 * 4. Use `analysis/worldbank/chart-integration-guide.md` for visualization templates
 *
 * **Never assume the indicators below are exhaustive.** Always consider whether
 * `search-indicators` would reveal a more specific indicator for the policy topic.
 */
// ─── Priority Constants ──────────────────────────────────────────────────────
/** Priority value for indicators that should always be fetched */
export const PRI = 'primary';
/** Priority value for indicators that are optional enrichment */
export const SEC = 'secondary';
// ─── Human-Readable Indicator Names ──────────────────────────────────────────
/** Reusable indicator display names (prevents sonarjs/no-duplicate-string) */
export const N = {
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
};
// ─── World Bank Indicator IDs ────────────────────────────────────────────────
/**
 * Extended set of World Bank indicator IDs relevant to EU Parliament policy areas.
 * Superset of `PolicyRelevantIndicators` — includes domain-specific indicators
 * that map to individual committee mandates.
 *
 * ⚠️ **AI Agents**: This is a **curated subset of 34 indicators**. The World Bank
 * has thousands more. Use `search-indicators` MCP tool for on-demand discovery.
 * Full reference: `analysis/worldbank/indicator-catalog.md` (200+ indicators).
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
};
//# sourceMappingURL=indicator-catalog.js.map