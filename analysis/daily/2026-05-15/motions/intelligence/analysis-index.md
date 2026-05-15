<!-- SPDX-FileCopyrightText: 2026 Hack23 AB -->
<!-- SPDX-License-Identifier: Apache-2.0 -->

# Analysis Index — EU Parliament Motions · 2026-05-15

## Run Metadata

| Field | Value |
|-------|-------|
| Article Type | `motions` |
| Analysis Date | 2026-05-15 |
| Data Window | 2026-04-28 to 2026-05-15 |
| EP Session Reference | Strasbourg Plenary, 28–30 April 2026 |
| IMF Data | Available (live, 449 records: WEO DEU/FRA/ITA GDP/CPI/Fiscal) |
| EP Adopted Texts | 51 texts retrieved (2026 term) |
| Analysis Pass | Pass 1 (primary) + Pass 2 (depth extension) |

---

## Artifact Registry

### Root-Level

| Artifact | Path | Status | Lines Floor |
|----------|------|--------|-------------|
| Executive Brief | `executive-brief.md` | ✅ Written | 180 |

### Intelligence Folder

| Artifact | Path | Status | Lines Floor |
|----------|------|--------|-------------|
| Analysis Index | `intelligence/analysis-index.md` | ✅ Written | 100 |
| Synthesis Summary | `intelligence/synthesis-summary.md` | ✅ Written | 160 |
| Historical Baseline | `intelligence/historical-baseline.md` | ✅ Written | 120 |
| Economic Context | `intelligence/economic-context.md` | ✅ Written | 120 |
| PESTLE Analysis | `intelligence/pestle-analysis.md` | ✅ Written | 180 |
| Stakeholder Map | `intelligence/stakeholder-map.md` | ✅ Written | 200 |
| Scenario Forecast | `intelligence/scenario-forecast.md` | ✅ Written | 180 |
| Threat Model | `intelligence/threat-model.md` | ✅ Written | 160 |
| Wildcards & Black Swans | `intelligence/wildcards-blackswans.md` | ✅ Written | 180 |
| MCP Reliability Audit | `intelligence/mcp-reliability-audit.md` | ✅ Written | 200 |
| Reference Analysis Quality | `intelligence/reference-analysis-quality.md` | ✅ Written | 140 |
| Voting Patterns | `intelligence/voting-patterns.md` | ✅ Written | 200 |
| Workflow Audit | `intelligence/workflow-audit.md` | ✅ Written | 100 |
| Cross-Session Intelligence | `intelligence/cross-session-intelligence.md` | ✅ Written | 220 |
| Session Baseline | `intelligence/session-baseline.md` | ✅ Written | 200 |
| Methodology Reflection | `intelligence/methodology-reflection.md` | ✅ Written | 200 |

### Classification Folder

| Artifact | Path | Status |
|----------|------|--------|
| Significance Classification | `classification/significance-classification.md` | ✅ Written |
| Actor Mapping | `classification/actor-mapping.md` | ✅ Written |
| Forces Analysis | `classification/forces-analysis.md` | ✅ Written |
| Impact Matrix | `classification/impact-matrix.md` | ✅ Written |

### Risk-Scoring Folder

| Artifact | Path | Status | Lines Floor |
|----------|------|--------|-------------|
| Risk Matrix | `risk-scoring/risk-matrix.md` | ✅ Written | 100 |
| Quantitative SWOT | `risk-scoring/quantitative-swot.md` | ✅ Written | 100 |
| Political Capital Risk | `risk-scoring/political-capital-risk.md` | ✅ Written | — |
| Legislative Velocity Risk | `risk-scoring/legislative-velocity-risk.md` | ✅ Written | — |

### Threat-Assessment Folder

| Artifact | Path | Status |
|----------|------|--------|
| Political Threat Landscape | `threat-assessment/political-threat-landscape.md` | ✅ Written |
| Actor Threat Profiles | `threat-assessment/actor-threat-profiles.md` | ✅ Written |
| Consequence Trees | `threat-assessment/consequence-trees.md` | ✅ Written |
| Legislative Disruption | `threat-assessment/legislative-disruption.md` | ✅ Written |

### Existing / Legacy Folder

| Artifact | Path | Status | Lines Floor |
|----------|------|--------|-------------|
| Deep Analysis | `existing/deep-analysis.md` | ✅ Written | 400 |
| Session Baseline | `existing/session-baseline.md` | ✅ Written | 200 |
| Stakeholder Impact | `existing/stakeholder-impact.md` | ✅ Written | — |

### Extended Folder

| Artifact | Path | Status | Lines Floor |
|----------|------|--------|-------------|
| Media Framing Analysis | `extended/media-framing-analysis.md` | ✅ Written | 200 |

---

## Key Motions Analyzed (April 28–30, 2026 Strasbourg Plenary)

1. **TA-10-2026-0160** — Enforcement of the Digital Markets Act (Apr 30)
2. **TA-10-2026-0163** — Criminal provisions for cyberbullying/online harassment (Apr 30)
3. **TA-10-2026-0162** — Supporting democratic resilience in Armenia (Apr 30)
4. **TA-10-2026-0161** — Ukraine accountability / Russia attacks on civilians (Apr 30)
5. **TA-10-2026-0157** — EU livestock sector and food security (Apr 30)
6. **TA-10-2026-0151** — Trafficking in Haiti (Apr 30)
7. **TA-10-2026-0112** — 2027 Budget guidelines (Apr 28)
8. **TA-10-2026-0119** — EIB annual report 2024 (Apr 28)
9. **TA-10-2026-0115** — Dog and cat welfare and traceability (Apr 28)

---

## Data Sources

| Source | Tool | Result |
|--------|------|--------|
| EP Adopted Texts 2026 | `european-parliament-get_adopted_texts` | 51 texts ✅ |
| EP Adopted Texts Feed | `european-parliament-get_adopted_texts_feed` | 131 items ✅ |
| Plenary Sessions 2026 | `european-parliament-get_plenary_sessions` | 11 sessions ✅ |
| Voting Records | `european-parliament-get_voting_records` | 0 (EP delay) |
| Latest DOCEO Votes | `european-parliament-get_latest_votes` | 0 (week unavailable) |
| IMF WEO Live | `fetch-proxy` → `api.imf.org/sdmx/3.0` | 449 records ✅ |

*Note: EP Roll-call voting data has a multi-week publication delay. Voting patterns analysis uses structural political group alignment data and adopted-text outcomes.*
