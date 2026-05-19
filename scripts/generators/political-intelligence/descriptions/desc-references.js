// SPDX-FileCopyrightText: 2024-2026 Hack23 AB
// SPDX-License-Identifier: Apache-2.0
export const REFERENCE_DESCRIPTIONS = {
    'analysis/reference/isms-classification-adaptation.md': {
        description: 'Adaptation of the Hack23 ISMS information-classification scheme (Public, Internal, Confidential, Restricted) to EU political intelligence artifacts.',
    },
    'analysis/reference/isms-risk-assessment-adaptation.md': {
        description: 'Adaptation of the Hack23 ISMS risk-assessment methodology to EU political risk — reuses the 5×5 Likelihood × Impact matrix on coalition, policy and institutional risks.',
    },
    'analysis/reference/isms-style-guide-adaptation.md': {
        description: 'Adaptation of the Hack23 ISMS documentation style guide to EU political intelligence writing — structure, tone, citation and multi-language conventions.',
    },
    'analysis/reference/isms-threat-modeling-adaptation.md': {
        description: 'Adaptation of the Hack23 ISMS threat-modelling methodology to EU political threats — STRIDE-style enumeration over EP institutional trust boundaries.',
    },
    // ========================================================================
    // IMF data pipeline
    // ========================================================================
    'analysis/imf/README.md': {
        description: 'IMF data integration overview — how EU Parliament Monitor consumes the IMF SDMX 3.0 REST API via a native TypeScript client for economic, fiscal and monetary context.',
    },
    'analysis/imf/chart-integration-guide.md': {
        description: 'IMF chart integration guide — how to render IMF indicator series as Chart.js visualisations embedded in EU Parliament Monitor articles.',
    },
    'analysis/imf/eu-country-mapping.md': {
        description: 'IMF country and aggregation codelist — maps every EU-27 member state plus EU/EA aggregates to their canonical IMF 3-letter country codes.',
    },
    'analysis/imf/indicator-catalog.md': {
        description: 'Complete IMF indicator catalog — every WEO, Fiscal Monitor, IFS, BOP, ER and PCPS series available to article workflows, keyed to article-type policies.',
    },
    'analysis/imf/use-cases.md': {
        description: 'IMF data use cases — worked examples showing how to anchor breaking, week-ahead, committee-report and proposition articles in IMF economic data.',
    },
    // ========================================================================
    // World Bank data pipeline
    // ========================================================================
    'analysis/worldbank/README.md': {
        description: 'World Bank indicator integration overview — how EU Parliament Monitor consumes the worldbank-mcp server for non-economic development indicators.',
    },
    'analysis/worldbank/chart-integration-guide.md': {
        description: 'Chart integration guide for World Bank data in EU Parliament Monitor articles — accessible Chart.js rendering with WCAG 2.1 AA contrast and SR labels.',
    },
    'analysis/worldbank/eu-country-mapping.md': {
        description: 'EU-27 → World Bank country-code mapping plus a guard for aggregate codes (EUU, EMU, ECS, OED, WLD) that the worldbank-mcp 1.0.1 server rejects.',
    },
    'analysis/worldbank/indicator-catalog.md': {
        description: 'Complete World Bank indicator reference — every non-economic indicator (health, education, social, environment, demographics, governance, innovation) keyed to article types.',
    },
    'analysis/worldbank/use-cases.md': {
        description: 'World Bank indicator use cases — worked examples showing how to weave non-economic World Bank data into EP article narratives.',
    },
};
//# sourceMappingURL=desc-references.js.map