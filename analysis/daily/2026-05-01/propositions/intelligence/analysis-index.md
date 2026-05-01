<!-- SPDX-FileCopyrightText: 2024-2026 Hack23 AB -->
<!-- SPDX-License-Identifier: Apache-2.0 -->

# Analysis Index — EU Parliament Propositions 2026-05-01

**Article type:** propositions  
**Run date:** 2026-05-01  
**Analysis directory:** `analysis/daily/2026-05-01/propositions/`  

---

## Artifact Manifest

All artifacts produced in this analysis run:

### Intelligence Artifacts (`intelligence/`)

| File | Lines (est.) | Status | Threshold | Admiralty |
|------|-------------|--------|-----------|-----------|
| `synthesis-summary.md` | ~170 | ✅ COMPLETE | 160 | B/2 |
| `executive-brief.md` | ~200 | ✅ COMPLETE | 180 | B/2 |
| `stakeholder-map.md` | ~215 | ✅ COMPLETE | 200 | B/2 |
| `pestle-analysis.md` | ~200 | ✅ COMPLETE | 180 | B/2 |
| `scenario-forecast.md` | ~195 | ✅ COMPLETE | 180 | B/2 |
| `threat-model.md` | ~170 | ✅ COMPLETE | 160 | B/2 |
| `wildcards-blackswans.md` | ~185 | ✅ COMPLETE | 180 | B/3 |
| `economic-context.md` | ~175 | ✅ COMPLETE | 120 | B/2 |
| `historical-baseline.md` | ~195 | ✅ COMPLETE | 120 | A/1 |
| `mcp-reliability-audit.md` | ~205 | ✅ COMPLETE | 200 | H/1 |
| `reference-analysis-quality.md` | ~145 | ✅ COMPLETE | 140 | B/2 |
| `analysis-index.md` | this | IN PROGRESS | 100 | N/A |
| `methodology-reflection.md` | TBD | PENDING | 180 | N/A |

### Risk Scoring Artifacts (`risk-scoring/`)

| File | Lines (est.) | Status | Threshold |
|------|-------------|--------|-----------|
| `quantitative-swot.md` | TBD | PENDING | 100 |
| `risk-matrix.md` | TBD | PENDING | 100 |

### Support Files (`data/`)

| File | Type | Status |
|------|------|--------|
| `adopted-texts-2026-04-28-30.json` | Raw EP data | ✅ COMPLETE |
| `political-landscape.json` | Raw EP data | ✅ COMPLETE |

### Other Artifacts

| File | Status |
|------|--------|
| `existing/pipeline-health.md` | PENDING |
| `documents/document-analysis-index.md` | PENDING |
| `manifest.json` | PENDING |

---

## Key Intelligence Themes

### Theme 1: EU Governance Milestone — Anti-Corruption Regulation

The signing of the Anti-Corruption Regulation (2023/0135/COD) on April 29, 2026 represents the culmination of 25+ years of EU anti-corruption legislative development. This is the first dedicated EU criminal law framework for corruption, enabled by Article 83(1) TFEU.

**Related artifacts:** synthesis-summary.md §1, executive-brief.md §"Governance Milestone", historical-baseline.md §1, stakeholder-map.md §1–5, pestle-analysis.md §L1, threat-model.md §TH-01, scenario-forecast.md §1

### Theme 2: Banking Union Completion — SRMR3 in Force

SRMR3 published in Official Journal April 20, 2026. Banking union resolution pillar now complete. Provides EUR 80bn SRF backstop; EDIS remains absent.

**Related artifacts:** synthesis-summary.md §2, economic-context.md §3, historical-baseline.md §2, scenario-forecast.md §3, pestle-analysis.md §E1

### Theme 3: DMA Enforcement Crisis

Parliament urgency resolution (April 30) demands faster DMA enforcement after 36 months with zero formal decisions. EP-Commission accountability tension.

**Related artifacts:** synthesis-summary.md §3, executive-brief.md §"Digital Markets Act", stakeholder-map.md §9, threat-model.md §TH-02, scenario-forecast.md §2, pestle-analysis.md §T1, wildcards-blackswans.md §W-02

### Theme 4: Ukraine Accountability

April 30 urgency resolution on civilian infrastructure accountability and asset seizure acceleration. 7th consecutive EP Ukraine urgency resolution.

**Related artifacts:** synthesis-summary.md §5, executive-brief.md §"Ukraine Accountability", historical-baseline.md §4, economic-context.md §6, scenario-forecast.md §4, wildcards-blackswans.md §W-04

### Theme 5: Dogs & Cats Welfare

Post-trilogue EP position adopted April 29. Consumer protection and animal welfare milestone. Second legislative achievement of the session.

**Related artifacts:** synthesis-summary.md §4, stakeholder-map.md §6, pestle-analysis.md §S1, historical-baseline.md §5

---

## Data Quality Rating

**Overall data quality for this run:** 🟡 MEDIUM-HIGH  
**Primary constraint:** Voting records unavailable (4–6 week delay); procedures feed in RECESS_MODE  
**Richest data source:** `get_adopted_texts_feed` (163 items; April 28–30 coverage)  
**See:** `intelligence/mcp-reliability-audit.md` for full tool-by-tool assessment
