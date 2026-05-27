# Cross-Reference Map — Breaking News, 2026-05-27

**Purpose**: Navigation map for the full artifact set; shows analytical cross-dependencies

---

## Artifact Dependency Graph

```
DATA LAYER
├── data-availability-assessment.md
│   └── feeds: intelligence/mcp-reliability-audit.md
│
INTELLIGENCE LAYER (Primary)
├── executive-brief.md ← synthesis-summary.md
├── intelligence/analysis-index.md ← all artifacts
├── intelligence/synthesis-summary.md
│   ├── ← intelligence/significance-scoring.md
│   ├── ← intelligence/coalition-dynamics.md
│   ├── ← intelligence/economic-context.md
│   └── ← intelligence/scenario-forecast.md
│
├── intelligence/economic-context.md (IMF baseline)
├── intelligence/historical-baseline.md
├── intelligence/pestle-analysis.md
├── intelligence/political-threat-landscape.md
│   └── ← threat-assessment/actor-threat-profiles.md
├── intelligence/scenario-forecast.md
│   └── ← threat-assessment/consequence-trees.md
│       └── ← extended/forward-indicators.md
├── intelligence/significance-scoring.md
├── intelligence/stakeholder-map.md
│   └── ← classification/actor-mapping.md
├── intelligence/threat-model.md
│   └── ← threat-assessment/actor-threat-profiles.md
├── intelligence/wildcards-blackswans.md
├── intelligence/coalition-dynamics.md
│   └── ← extended/coalition-mathematics.md
├── intelligence/voting-patterns.md
│   └── ← extended/coalition-mathematics.md
├── intelligence/cross-run-diff.md
├── intelligence/workflow-audit.md
├── intelligence/cross-session-intelligence.md
├── intelligence/methodology-reflection.md (SAT attestation)
│
RISK LAYER
├── risk-scoring/risk-matrix.md
├── risk-scoring/quantitative-swot.md
│   └── ← intelligence/synthesis-summary.md
│       ← intelligence/economic-context.md
├── risk-scoring/political-capital-risk.md
└── risk-scoring/legislative-velocity-risk.md
│
CLASSIFICATION LAYER
├── classification/significance-classification.md
│   └── ← intelligence/significance-scoring.md
├── classification/actor-mapping.md
│   └── ← intelligence/stakeholder-map.md
├── classification/forces-analysis.md
│   └── ← intelligence/coalition-dynamics.md
│       ← intelligence/political-threat-landscape.md
└── classification/impact-matrix.md
    └── ← classification/actor-mapping.md
        ← intelligence/significance-scoring.md
│
DOCUMENTS LAYER
└── documents/document-analysis-index.md
    └── ← classification/significance-classification.md
│
THREAT ASSESSMENT LAYER
├── threat-assessment/consequence-trees.md
│   └── ← intelligence/scenario-forecast.md
│       ← risk-scoring/risk-matrix.md
├── threat-assessment/legislative-disruption.md
│   └── ← threat-assessment/consequence-trees.md
└── threat-assessment/actor-threat-profiles.md
    └── ← intelligence/threat-model.md
        ← classification/actor-mapping.md
│
EXTENDED LAYER
├── extended/devils-advocate.md ← whole artifact set
├── extended/historical-parallels.md ← intelligence/historical-baseline.md
├── extended/coalition-mathematics.md ← intelligence/coalition-dynamics.md
├── extended/forward-indicators.md ← intelligence/scenario-forecast.md
├── extended/intelligence-assessment.md ← whole artifact set
├── extended/implementation-feasibility.md ← threat-assessment/legislative-disruption.md
├── extended/media-framing-analysis.md ← intelligence/synthesis-summary.md
├── extended/comparative-international.md ← classification/significance-classification.md
├── extended/voter-segmentation.md ← intelligence/stakeholder-map.md
├── extended/cross-reference-map.md (THIS FILE)
└── extended/data-download-manifest.md
```

---

## Article-to-Artifact Mapping

For Stage D article renderer, the key cross-references per article section:

| Article Section | Primary Artifacts |
|----------------|------------------|
| Headline/BLUF | executive-brief.md, intelligence/synthesis-summary.md |
| FDI Screening Analysis | risk-scoring/quantitative-swot.md, extended/comparative-international.md |
| Afghanistan Coverage | intelligence/stakeholder-map.md, threat-assessment/consequence-trees.md |
| Strategic Context | intelligence/economic-context.md, intelligence/scenario-forecast.md |
| SAFE Instrument | extended/implementation-feasibility.md, extended/coalition-mathematics.md |
| Forward Look | extended/forward-indicators.md, intelligence/wildcards-blackswans.md |

---

## Cross-References

- `intelligence/analysis-index.md` for the flat artifact inventory
- `manifest.json` for the machine-readable file listing
