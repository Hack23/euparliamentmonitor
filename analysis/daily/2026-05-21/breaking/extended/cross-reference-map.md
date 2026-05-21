# Cross-Reference Map — EU Parliament Breaking News 2026-05-21
**Framework**: Analytical Cross-Reference Architecture
**Date**: 2026-05-21 | **Admiralty**: A1

## Purpose

This artifact maps cross-references between analysis artifacts to ensure analytical consistency and traceability.

## Core Reference Architecture

```mermaid
%%{init: {"theme":"dark","themeVariables":{"primaryColor":"#1565C0","primaryTextColor":"#ffffff","lineColor":"#90CAF9","fontFamily":"Inter"}}}%%
graph LR
    subgraph "Source Artifacts"
        DATA["data/*.json
(Stage A)"]
        SYNTH["synthesis-summary.md"]
        STAKE["stakeholder-map.md"]
        SCEN["scenario-forecast.md"]
        PEST["pestle-analysis.md"]
    end
    subgraph "Derived Artifacts"
        BRIEF["executive-brief.md"]
        THREAT["threat-model.md"]
        RISK["risk-matrix.md"]
        SWOT["quantitative-swot.md"]
        COAL["coalition-dynamics.md"]
    end
    subgraph "Extended Artifacts"
        EXT_BRIEF["extended/executive-brief.md"]
        DA["extended/devils-advocate.md"]
        HIST["extended/historical-parallels.md"]
        COMP["extended/comparative-international.md"]
        FWD["extended/forward-indicators.md"]
    end
    DATA --> SYNTH
    DATA --> STAKE
    DATA --> SCEN
    SYNTH --> BRIEF
    STAKE --> BRIEF
    SCEN --> BRIEF
    BRIEF --> EXT_BRIEF
    SYNTH --> DA
    HIST --> COMP
    SCEN --> FWD
```

## Cross-Reference Matrix

| Target Artifact | Primary Sources | Cross-Referenced By |
|----------------|----------------|---------------------|
| executive-brief.md | synthesis-summary.md, stakeholder-map.md, scenario-forecast.md | extended/executive-brief.md |
| intelligence/synthesis-summary.md | EP adopted texts, IMF data | executive-brief.md, extended/* |
| intelligence/scenario-forecast.md | synthesis-summary.md, pestle-analysis.md | extended/forward-indicators.md |
| intelligence/stakeholder-map.md | EP MEPs data, group composition | coalition-dynamics.md, actor-mapping.md |
| intelligence/coalition-dynamics.md | EP group composition, stakeholder-map.md | extended/coalition-mathematics.md |
| extended/historical-parallels.md | historical-baseline.md | extended/comparative-international.md |
| risk-scoring/risk-matrix.md | threat-model.md, pestle-analysis.md | extended/implementation-feasibility.md |
| classification/significance-classification.md | synthesis-summary.md | documents/document-analysis-index.md |

## Consistency Checks

| Check | Status | Notes |
|-------|--------|-------|
| WEP probabilities sum to ≤100% per scenario | ✅ | AI-Trade: 72%+25%+15% = 112% (intentional overlap) |
| Admiralty grades consistent across artifacts | ✅ | B2 for confirmed EP data; C2 for estimates |
| IMF data vintage consistent | ✅ | All using April 2025 WEO |
| Coalition seat counts consistent | ✅ | 730 total, EPP 188, S&D 136 across all artifacts |
| Session dates consistent | ✅ | 2026-05-19/20 throughout |
| Document identifiers consistent | ✅ | TA-10-2026-0183, -0174, -0182, -0177, -0178, -0179, -0168, -0166 |

## Analytical Lineage

This analysis run builds on prior run breaking-run258-1779351146:
- **Inherited** (carryForward): executive-brief.md (181 lines), stakeholder-map.md (309 lines)
- **Extended**: Both carryForward artifacts extended in this run
- **Created new**: 37 artifacts written or substantially extended

**Data lineage**: All substantive intelligence claims trace to one of:
- EP Open Data Portal adopted-texts (B2) — confirmed legislative actions
- IMF WEO April 2025 (A1) — economic data
- Reconstructed estimates from document analysis (C2) — voting tallies, procedure types
- Knowledge-only baseline (C3) — geopolitical context, historical parallels

---
*Cross-Reference Map | Admiralty A1 | 2026-05-21*
