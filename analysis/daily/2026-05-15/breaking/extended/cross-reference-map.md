# Cross-Reference Map — EP Breaking News 2026-05-15
**Article Type:** Breaking | **Analysis Date:** 2026-05-15

---

## 🗺️ Cross-Reference Map

This artifact maps the cross-dependencies and supporting evidence relationships between all analysis artifacts produced in this run.

---

## Primary Evidence Chain

```
EP Adopted Texts (data/adopted-texts.json)
├── TA-10-2026-0160 (DMA enforcement)
│   ├── cited by: documents/document-analysis-index.md
│   ├── classified in: classification/significance-classification.md (Tier 1)
│   ├── scored in: intelligence/significance-scoring.md (item 1)
│   ├── threat modeled in: intelligence/threat-model.md (T1)
│   ├── historically paralleled in: extended/historical-parallels.md (GDPR parallel)
│   └── feasibility assessed in: extended/implementation-feasibility.md (Track 1)
├── TA-10-2026-0161 (Ukraine accountability)
│   ├── cited by: documents/document-analysis-index.md
│   ├── classified in: classification/significance-classification.md (Tier 1)
│   ├── stakeholder analyzed in: intelligence/stakeholder-map.md
│   ├── historically paralleled in: extended/historical-parallels.md (Marshall Plan parallel)
│   └── feasibility assessed in: extended/implementation-feasibility.md (Track 2)
└── TA-10-2026-0112 (Budget 2027)
    ├── cited by: documents/document-analysis-index.md
    ├── classified in: classification/significance-classification.md (Tier 1)
    ├── historically paralleled in: extended/historical-parallels.md (Fontainebleau parallel)
    └── feasibility assessed in: extended/implementation-feasibility.md (Track 3)
```

---

## Artifact Dependency Map

| Artifact | Depends on | Is used by |
|----------|-----------|-----------|
| documents/document-analysis-index.md | data/adopted-texts.json | classification/; intelligence/; extended/ |
| classification/significance-classification.md | document-analysis-index.md | intelligence/analysis-index.md |
| intelligence/significance-scoring.md | document-analysis-index.md | intelligence/synthesis-summary.md |
| intelligence/coalition-dynamics.md | data/meps-feed.json | extended/coalition-mathematics.md |
| extended/coalition-mathematics.md | coalition-dynamics.md | extended/intelligence-assessment.md |
| intelligence/stakeholder-map.md | document-analysis-index.md | intelligence/synthesis-summary.md |
| intelligence/historical-baseline.md | document-analysis-index.md | extended/historical-parallels.md |
| intelligence/scenario-forecast.md | significance-scoring.md; stakeholder-map.md | intelligence/synthesis-summary.md |
| intelligence/threat-model.md | significance-scoring.md | risk-scoring/risk-matrix.md |
| risk-scoring/risk-matrix.md | threat-model.md | intelligence/synthesis-summary.md |
| risk-scoring/quantitative-swot.md | significance-scoring.md; risk-matrix.md | extended/intelligence-assessment.md |
| extended/intelligence-assessment.md | ALL intelligence/ artifacts | manifest.json |
| intelligence/synthesis-summary.md | ALL intelligence/ artifacts | manifest.json |
| intelligence/methodology-reflection.md | ALL artifacts | manifest.json (LAST) |

---

## Cross-Domain Evidence Linkages

### DMA ↔ Trade ↔ Geopolitics Linkage
- `intelligence/pestle-analysis.md` (Political: DMA as sovereignty assertion)
- `intelligence/historical-baseline.md` (US tariff quota parallel — TA-10-2026-0096 from March 2026)
- `extended/historical-parallels.md` (Fontainebleau + GDPR parallels)
- `extended/comparative-international.md` (EU vs. US vs. UK vs. China digital regulation)
- `intelligence/wildcards-blackswans.md` (EU-US tech war wildcard)

### Ukraine ↔ Eastern Security ↔ Coalition Linkage
- `intelligence/stakeholder-map.md` (Ukrainian MEP voices; Eastern European bloc)
- `intelligence/coalition-dynamics.md` (ECR split on Ukraine)
- `extended/coalition-mathematics.md` (Vote Scenario 2)
- `intelligence/cross-session-intelligence.md` (Eastern neighbourhood systemic pattern)
- `extended/voter-segmentation.md` (Segment C: Eastern European security-focused voters)

### Budget ↔ Fiscal Architecture ↔ EP Power Linkage
- `intelligence/economic-context.md` (EU fiscal environment without IMF data)
- `extended/implementation-feasibility.md` (Track 3: legal/political barriers)
- `extended/historical-parallels.md` (Fontainebleau parallel)
- `extended/devils-advocate-analysis.md` (Challenge 3: budget incorporation rate correction)
- `extended/voter-segmentation.md` (Segment B: fiscal caution; Segment D: anti-EU fiscal)

---

## Data Source → Artifact Lineage

| Data source | Artifact | Field |
|-------------|---------|-------|
| data/adopted-texts.json | documents/document-analysis-index.md | document registry |
| data/adopted-texts.json | classification/significance-classification.md | tier assignments |
| data/meps-feed.json | intelligence/coalition-dynamics.md | seat counts |
| data/meps-feed.json | extended/coalition-mathematics.md | fragmentation index |
| MCP Call 1 (get_adopted_texts) | intelligence/significance-scoring.md | scoring evidence |
| MCP Call 2 (get_latest_votes) | intelligence/mcp-reliability-audit.md | call 2 record |
| IMF API (all failed) | intelligence/economic-context.md | unavailability notice |

---

## Confidence Propagation

| Root uncertainty | Artifacts affected | Confidence reduction |
|-----------------|-------------------|---------------------|
| Roll-call vote data unavailable | coalition-dynamics.md; coalition-mathematics.md; voting-patterns.md | 🟡 MEDIUM everywhere |
| DMA text content unavailable | document-analysis-index.md (DMA section); significance-scoring.md | 🟡 MEDIUM for DMA specifics |
| IMF data unavailable | economic-context.md | 🟢 LOW impact (not required for gate) |
| Events feed error | historical-baseline.md (timeline section) | 🟢 LOW impact |

---

*Methodology: Dependency mapping; evidence chain tracing; confidence propagation analysis*
