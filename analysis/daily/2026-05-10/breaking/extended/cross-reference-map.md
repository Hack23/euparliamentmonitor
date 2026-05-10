# Cross-Reference Map — EU Parliament Breaking News
## 2026-05-10 | Inter-Document Evidence Network

**Confidence:** 🟢 HIGH
**Purpose:** Map the evidence relationships between all 35 analysis artifacts produced in this run.
**Primary Events:** DMA Enforcement (TA-0160), Ukraine Accountability (TA-0161), Armenia Resilience (TA-0162), Haiti Criminal Networks (TA-0151), CSAM Platforms (TA-0163), EP Budget 2027 Estimates

---

## 1. PRIMARY EVIDENCE NODES

### 1.1 Adopted Texts (Primary Sources)

| ID | Title (Short) | Date | Type | Referenced By |
|----|--------------|------|------|---------------|
| TA-10-2026-0160 | DMA Enforcement | 2026-04-30 | Non-legislative Resolution | pestle, dma-deep-dive, stakeholder-map, coalition-dynamics |
| TA-10-2026-0161 | Ukraine Accountability | 2026-04-30 | Non-legislative Resolution | threat-model, scenario-forecast, ukraine-deep-dive, historical-baseline |
| TA-10-2026-0162 | Armenia Resilience | 2026-04-30 | Non-legislative Resolution | scenario-forecast, geopolitics, armenia-analysis |
| TA-10-2026-0151 | Haiti Criminal Networks | 2026-04-30 | Non-legislative Resolution | threat-assessment, haiti-context, significance-scoring |
| TA-10-2026-0163 | CSAM/Platform Liability | 2026-04-30 | Non-legislative Resolution | threat-model, pestle, dma-deep-dive |
| TA-10-2026-04-30-ANN01 | EP Budget Estimates 2027 | 2026-04-30 | Institutional Document | budget-analysis, economic-context, risk-matrix |

### 1.2 Secondary Data Sources

| Source | Type | Quality | Referenced By |
|--------|------|---------|---------------|
| EP MEP Composition API | Structural Data | 🟢 HIGH | coalition-dynamics, voting-patterns, actor-mapping |
| Coalition Dynamics Analysis | Derived Metric | 🟡 MEDIUM | synthesis-summary, scenario-forecast, risk-matrix |
| EP Parliamentary Fragmentation Index (6.58) | Computed | 🟢 HIGH | coalition-dynamics, quantitative-swot |
| DOCEO XML Votes | Near-Realtime | 🔴 UNAVAILABLE | voting-patterns (noted as gap) |
| IMF SDMX Economic Data | Economic Context | 🟡 MEDIUM | economic-context |
| World Bank Development Data | Development Indicators | 🟡 MEDIUM | armenia-analysis, haiti-context |

---

## 2. ARTIFACT-TO-ARTIFACT REFERENCE MATRIX

### 2.1 Intelligence Layer ↔ Extended Analysis Cross-References

```
intelligence/synthesis-summary.md
    ← reads: coalition-dynamics, pestle-analysis, scenario-forecast,
              stakeholder-map, threat-model, wildcards-blackswans
    → cited by: executive-brief (rollup), methodology-reflection

intelligence/coalition-dynamics.md
    ← reads: EP MEP Composition API (live), coalition pairs analysis
    → cited by: synthesis-summary, scenario-forecast, quantitative-swot,
                 coalition-mathematics (extended), cross-session-intelligence

intelligence/pestle-analysis.md
    ← reads: TA-0160 (DMA), TA-0161 (Ukraine), TA-0162 (Armenia),
              TA-0163 (CSAM), economic-context (IMF proxy)
    → cited by: synthesis-summary, risk-matrix, scenario-forecast

intelligence/stakeholder-map.md
    ← reads: EP MEP data, TA-0160, TA-0161, TA-0162, TA-0163
    → cited by: synthesis-summary, scenario-forecast, actor-mapping

intelligence/threat-model.md
    ← reads: TA-0161 (Ukraine/Russia), TA-0151 (Haiti), TA-0163 (CSAM)
    → cited by: scenario-forecast, risk-matrix, political-threat-landscape

intelligence/scenario-forecast.md
    ← reads: coalition-dynamics, pestle, threat-model, historical-baseline,
              Armenia analysis, Ukraine analysis
    → cited by: synthesis-summary, quantitative-swot, wildcards-blackswans

intelligence/historical-baseline.md
    ← reads: EP procedural history, DMA Phase I/II context, Armenia 2008-2026,
              Ukraine 2014-2026, Budapest Memorandum precedent
    → cited by: scenario-forecast, pestle-analysis, ukraine-deep-dive

intelligence/wildcards-blackswans.md
    ← reads: scenario-forecast, geopolitical data, technology trends
    → cited by: synthesis-summary (risk annex), quantitative-swot
```

### 2.2 Extended Deep Dives ↔ Intelligence Layer Cross-References

```
extended/dma-enforcement-deep-dive.md
    ← reads: TA-10-2026-0160 (primary), pestle §Technology,
              stakeholder-map §Big Tech actors, historical-baseline §DMA Phase I
    → cited by: synthesis-summary §Digital Governance,
                 quantitative-swot §Opportunity/Threat

extended/ukraine-accountability-deep-dive.md
    ← reads: TA-10-2026-0161 (primary), threat-model §Russia,
              historical-baseline §Budapest Memorandum, scenario-forecast §Ukraine
    → cited by: synthesis-summary §Security,
                 risk-matrix §Geopolitical Risk tier

extended/armenia-integration-analysis.md
    ← reads: TA-10-2026-0162 (primary), historical-baseline §South Caucasus,
              scenario-forecast §Neighbourhood Policy
    → cited by: synthesis-summary §Enlargement,
                 geopolitical-positioning

extended/budget-2027-analysis.md
    ← reads: TA-10-2026-04-30-ANN01 (primary), economic-context §fiscal data,
              IMF EU fiscal projections
    → cited by: quantitative-swot §fiscal, risk-matrix §institutional

extended/coalition-mathematics.md
    ← reads: coalition-dynamics (live data), MEP composition,
              fragmentation index (6.58), effective number of parties (6.58)
    → cited by: scenario-forecast §majority scenarios, quantitative-swot §political

extended/economic-policy-forecast.md
    ← reads: IMF SDMX data, economic-context, pestle §Economic
    → cited by: synthesis-summary §Economic, risk-matrix §macro
```

### 2.3 Risk-Scoring Layer Cross-References

```
risk-scoring/risk-matrix.md
    ← reads: threat-model, pestle, scenario-forecast, coalition-dynamics,
              economic-context (IMF)
    → cited by: synthesis-summary (risk tier), executive-brief

risk-scoring/quantitative-swot.md
    ← reads: coalition-dynamics, stakeholder-map, historical-baseline,
              scenario-forecast, economic-context
    → cited by: executive-brief, methodology-reflection
```

---

## 3. EVIDENCE STRENGTH BY TOPIC DOMAIN

### 3.1 Digital Governance (DMA Enforcement)

| Evidence Layer | Depth | Confidence |
|---------------|-------|------------|
| Primary Source: TA-10-2026-0160 (indexed, content TBA) | Feed-confirmed | 🟡 MEDIUM |
| DMA enforcement framework 2024-2026 | Well-documented | 🟢 HIGH |
| Big Tech compliance status (live signals) | Partial | 🟡 MEDIUM |
| Coalition support for enforcement posture | Size-proxy | 🟡 MEDIUM |

### 3.2 Security & Geopolitics (Ukraine/Armenia)

| Evidence Layer | Depth | Confidence |
|---------------|-------|------------|
| Primary Source: TA-10-2026-0161 / 0162 (indexed, content TBA) | Feed-confirmed | 🟡 MEDIUM |
| Historical context 2014-2026 (Ukraine), 2008-2026 (Armenia) | Well-documented | 🟢 HIGH |
| ICC/ICJ legal mechanisms | Structural | 🟢 HIGH |
| Russia/Azerbaijan pressure vectors | Assessed | 🟡 MEDIUM |

### 3.3 Criminal Justice & Platform Liability (Haiti/CSAM)

| Evidence Layer | Depth | Confidence |
|---------------|-------|------------|
| Primary Source: TA-10-2026-0151 / 0163 (indexed, content TBA) | Feed-confirmed | 🟡 MEDIUM |
| Criminal network typology | Assessed | 🟡 MEDIUM |
| Platform liability legal framework (EU) | Structural | 🟢 HIGH |

### 3.4 Institutional/Budget (EP 2027 Estimates)

| Evidence Layer | Depth | Confidence |
|---------------|-------|------------|
| Primary Source: TA-10-2026-04-30-ANN01 | Feed-confirmed | 🟡 MEDIUM |
| MFF 2021-2027 reference framework | Well-documented | 🟢 HIGH |
| Interinstitutional negotiations (EP vs. Council) | Structural | 🟢 HIGH |

---

## 4. DATA GAPS AND UNRESOLVED REFERENCES

### 4.1 High-Priority Gaps

| Gap | Impact | Mitigation |
|----|--------|------------|
| DOCEO XML votes unavailable (week of May 4-7) | Cannot compute voting cohesion by group | Coalition size-similarity proxy used; labelled 🟡 |
| Adopted text full-text 404 (TA-0160, 0161, 0162, 0163) | Cannot verify exact amendment language | Title-level + procedural context substituted |
| EP events feed returned empty for today | Missing committee meeting detail | Direct API queries used as fallback |
| Procedures feed returned historical tail (not current) | Cannot confirm in-progress legislation count | Known EP API degraded pattern; STALENESS_WARNING |

### 4.2 Deferred Deep-Fetches (budget cap reached)

Items logged in `manifest.dataVerification.deferredDeepFetches[]`:
- MEP detail lookups beyond cap of 10
- Full procedural history for procedures referenced in adopted texts (processId mismatch between track_legislation and get_procedures)

---

## 5. ARTIFACT PROVENANCE CHAIN

```
Raw Data (EP API feeds)
    → Stage A: data/ directory (JSON snapshots)
        → Stage B Pass 1: intelligence/**, classification/**, risk-scoring/**, extended/**
            → Stage B Pass 2: Read-back and deepen all artifacts
                → Stage C: manifest.json completeness gate
                    → Stage D: npm run generate-article
                        → news/2026-05-10-breaking.en.md (aggregated markdown)
                            → news/2026-05-10-breaking-en.html (rendered article)
```

**Confidence calibration note:** All 🟢 HIGH confidence ratings reflect structural knowledge (legal text, institutional composition, historical record) that is independent of the specific April 30 adopted texts. All 🟡 MEDIUM ratings reflect that the primary adopted-text full-text was unavailable (404) and analysis is based on title + procedural context + feed metadata.
