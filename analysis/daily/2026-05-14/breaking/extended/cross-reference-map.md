# Cross-Reference Map — Breaking News 2026-05-14
**Purpose:** Inter-artifact citation map | **Confidence:** 🟢 High

---

## PRIMARY CROSS-REFERENCES

### executive-brief.md → references:
- intelligence/synthesis-summary.md (legislative outcomes)
- intelligence/coalition-dynamics.md (coalition arithmetic)
- intelligence/significance-scoring.md (significance ratings)
- intelligence/economic-context.md (economic data)

### intelligence/synthesis-summary.md → references:
- intelligence/stakeholder-map.md (key actors)
- intelligence/scenario-forecast.md (scenario analysis)
- intelligence/coalition-dynamics.md (coalition data)
- intelligence/historical-baseline.md (historical context)
- intelligence/voting-patterns.md (vote patterns)

### intelligence/coalition-dynamics.md → references:
- extended/coalition-mathematics.md (detailed arithmetic)
- intelligence/voting-patterns.md (voting data)
- intelligence/significance-scoring.md (vote importance)

### intelligence/economic-context.md → references:
- risk-scoring/risk-matrix.md (economic risk R5)
- risk-scoring/quantitative-swot.md (SWOT O1)
- extended/comparative-international.md (global comparison)

### risk-scoring/risk-matrix.md → references:
- intelligence/political-threat-landscape.md (threat identification)
- intelligence/scenario-forecast.md (scenario probabilities)
- risk-scoring/quantitative-swot.md (SWOT threats)

### extended/devils-advocate-analysis.md → references:
- intelligence/coalition-dynamics.md (challenges coalition narrative)
- intelligence/historical-baseline.md (challenges MFF narrative)
- extended/historical-parallels.md (parallel cases)

### extended/historical-parallels.md → references:
- intelligence/historical-baseline.md (EP institutional history)
- extended/coalition-mathematics.md (coalition arithmetic history)
- intelligence/synthesis-summary.md (current events)

### extended/intelligence-assessment.md → references:
- All intelligence/ artifacts (synthesis)
- documents/document-analysis-index.md (source documents)
- intelligence/mcp-reliability-audit.md (data quality)

### extended/comparative-international.md → references:
- intelligence/economic-context.md (economic comparison)
- extended/coalition-mathematics.md (EU institutional comparison)
- intelligence/historical-baseline.md (historical precedent)

---

## ARTIFACT DEPENDENCY CHAIN

```
documents/document-analysis-index.md
    ↓
executive-brief.md
    ↓
intelligence/ [all 14 core intelligence artifacts]
    ↓
risk-scoring/ [risk-matrix.md, quantitative-swot.md]
    ↓
classification/significance-classification.md
    ↓
extended/ [all 10 extended artifacts]
    ↓
intelligence/methodology-reflection.md [FINAL]
```

*Confidence: 🟢 High*

---

## EXTENDED CROSS-REFERENCE MAP — PASS 2

### ARTIFACT CROSS-REFERENCE INDEX (EXTENDED)

#### Issue → Artifact Coverage Matrix

| Issue Area | Primary Artifact | Supporting Artifacts | Data Sources |
|-----------|-----------------|---------------------|-------------|
| MFF Budget | executive-brief.md | coalition-mathematics, pestle, scenario-forecast | adopted-texts-2026.json |
| DMA Enforcement | intelligence/threat-model.md | comparative-international, pestle, stakeholder-map | adopted-texts-2026.json (TA-0160) |
| Ukraine Accountability | intelligence/political-threat-landscape.md | historical-parallels, scenario-forecast, threat-model | adopted-texts-2026.json (TA-0161) |
| Rule of Law | coalition-dynamics.md | stakeholder-map, threat-model, historical-parallels | adopted-texts-2026.json (TA-0147) |
| Discharge Accountability | documents/document-analysis-index.md | reference-analysis-quality, methodology-reflection | adopted-texts-2026.json (TA-0125-0137) |
| Trade Defense | economic-context.md | pestle, scenario-forecast, comparative-international | adopted-texts-2026.json (TA-0149) |
| Digital Safety | intelligence-assessment.md | threat-model, voter-segmentation | adopted-texts-2026.json (TA-0163) |

#### Artifact Interdependency Graph (Key Relationships)

```
stakeholder-map.md
  └── influences → coalition-dynamics.md
  └── informs → scenario-forecast.md
  └── feeds → political-threat-landscape.md

scenario-forecast.md
  └── extends → forward-indicators.md
  └── validates via → historical-parallels.md
  └── stress-tests via → wildcards-blackswans.md

intelligence-assessment.md
  └── consolidates ← stakeholder-map, coalition-dynamics, threat-model
  └── synthesis ← synthesis-summary.md
  └── quality-checks → reference-analysis-quality.md

economic-context.md
  └── informs → pestle-analysis.md (E section)
  └── validates → mff-analysis assumptions
  └── gaps noted in → reference-analysis-quality.md

methodology-reflection.md
  └── assesses all artifacts
  └── documents gaps in → data-download-manifest.md
  └── improvement plan feeds → reference-analysis-quality.md
```

#### Cross-Session Intelligence Links

**Links to prior run (breaking-run-1778722670, same day):**
- Prior run had ANALYSIS_ONLY gate; all artifacts were below floor
- This re-run extends every artifact per the re-run improvement rule
- Data collected in this run (EP adopted texts, plenary sessions) supersedes any prior data assumptions
- Economic context (IMF knowledge base) unchanged between runs

**Links to other article type runs (structural):**
- `week-ahead` analysis: April 28-30 session was the major week-ahead story for week of April 27
- `month-in-review` analysis: April 2026 plenary session will be the centerpiece of April month-in-review
- `committee-reports` analysis: BUDG committee MFF work feeds the breaking news MFF story

### ANALYTICAL CHAIN-OF-CUSTODY MAP

**Stage A → Stage B artifact chain:**
```
data/adopted-texts-2026.json
  → documents/document-analysis-index.md (Stage B initial)
  → intelligence/voting-patterns.md (inferred from adopted texts)
  → intelligence/analysis-index.md (master index)
  → [all 38 artifacts via methodology application]

data/plenary-sessions.json
  → intelligence/historical-baseline.md
  → intelligence/analysis-index.md

knowledge-base (IMF WEO April 2026)
  → intelligence/economic-context.md
  → intelligence/pestle-analysis.md (E section)
```

*Extended cross-reference map — 2026-05-14 Pass 2 | Confidence: 🟢 High (structural)*
