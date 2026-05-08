<!-- SPDX-FileCopyrightText: 2024-2026 Hack23 AB -->
<!-- SPDX-License-Identifier: Apache-2.0 -->

# 📑 Analysis Index — EU Parliament Year Ahead 2026-05-07

**Date:** 2026-05-07 | **Article Type:** year-ahead | **Stage:** B1 Complete / B2 Pass 2

---

## Complete Artifact Inventory

### Root Level
| File | Description | Size Est. | Quality |
|---|---|---|---|
| `executive-brief.md` | BLUF + top 5 triggers + calendar + key legislation | ~6KB | 🟢 PASS |

### Classification (4 artifacts)
| File | Description | Quality |
|---|---|---|
| `classification/significance-classification.md` | Tier 1 significance + quadrant chart + dimensional scores | 🟢 PASS |
| `classification/actor-mapping.md` | 9 EP groups + external actors + 4 coalition configs | 🟢 PASS |
| `classification/forces-analysis.md` | Driving/restraining forces by domain | 🟢 PASS |
| `classification/impact-matrix.md` | 10-file impact matrix + stakeholder impact | 🟢 PASS |

### Intelligence (10 artifacts)
| File | Description | Quality |
|---|---|---|
| `intelligence/pestle-analysis.md` | Full 6-dimension PESTLE analysis | 🟢 PASS |
| `intelligence/stakeholder-map.md` | 7 primary stakeholders + power/interest chart | 🟢 PASS |
| `intelligence/scenario-forecast.md` | 4 scenarios A-D with ACH methodology | 🟢 PASS |
| `intelligence/economic-context.md` | IMF degraded mode; EP budget + structural data | 🟢 PASS (IMF waiver) |
| `intelligence/historical-baseline.md` | EP9 vs EP10 comparison; voting precedents | 🟢 PASS |
| `intelligence/coalition-dynamics.md` | Deep 4-config coalition analysis | 🟢 PASS |
| `intelligence/wildcards-blackswans.md` | LPHI analysis; 6 major wildcards | 🟢 PASS |
| `intelligence/synthesis-summary.md` | Cross-domain synthesis + 5 critical determinations | 🟢 PASS |
| `intelligence/mcp-reliability-audit.md` | Tool reliability log; IMF degraded | 🟢 PASS |
| `intelligence/workflow-audit.md` | Stage execution audit; timing | 🟢 PASS |

### Risk Scoring (4 artifacts)
| File | Description | Quality |
|---|---|---|
| `risk-scoring/risk-matrix.md` | 10-item risk register + probability×impact matrix | 🟢 PASS |
| `risk-scoring/quantitative-swot.md` | 4S + 3W + 3O + 3T with ≥80 words each + weighted scores | 🟢 PASS |
| `risk-scoring/political-capital-risk.md` | Group capital assessment + institutional balance | 🟢 PASS |
| `risk-scoring/legislative-velocity-risk.md` | Throughput modelling + bottleneck analysis | 🟢 PASS |

### Threat Assessment (4 artifacts)
| File | Description | Quality |
|---|---|---|
| `threat-assessment/political-threat-landscape.md` | 6-dimension model (not STRIDE) | 🟢 PASS |
| `threat-assessment/actor-threat-profiles.md` | 4 actor profiles + threat matrix | 🟢 PASS |
| `threat-assessment/consequence-trees.md` | 4 decision trees + joint probability | 🟢 PASS |
| `threat-assessment/legislative-disruption.md` | Disruption risk by dossier + systemic scenarios | 🟢 PASS |

### Extended (3 year-ahead specific artifacts)
| File | Description | Quality |
|---|---|---|
| `extended/forward-projection.md` | 365-day Q2 2026–Q1 2027 projection | 🟢 PASS |
| `extended/parliamentary-calendar-projection.md` | Verified session calendar + committee workload | 🟢 PASS |
| `extended/legislative-pipeline-forecast.md` | Pipeline status (API gap documented) + forecast | 🟢 PASS |

### Final Step 10.5 Artifacts (to create)
| File | Status |
|---|---|
| `intelligence/analysis-index.md` | ✅ THIS FILE |
| `intelligence/methodology-reflection.md` | ⏳ NEXT |
| `manifest.json` | ⏳ TO CREATE |

---

## Artifact Count Summary

- **Total artifacts created (B1+B2):** 28 (including this index)
- **Remaining to create:** methodology-reflection.md + manifest.json
- **Quality gate:** All artifacts above marked 🟢 PASS

---

## Data Source Index

| Source | Availability | Artifacts Informed |
|---|---|---|
| EP `generate_political_landscape` | ✅ Full | All political analysis |
| EP `get_plenary_sessions` (2026) | ✅ Full | Calendar projection; forward projection |
| EP `get_adopted_texts` (2026) | ✅ Full | Pipeline forecast; historical-baseline; executive-brief |
| EP `early_warning_system` | ✅ Full | Coalition analysis; risk scoring |
| EP `get_meeting_foreseen_activities` | ⚠️ May only | Calendar projection |
| EP `get_speeches` | ⚠️ Metadata only | Historical-baseline (limited) |
| IMF SDMX probe | ❌ Unavailable | economic-context.md (degraded mode) |
| World Bank | Not probed | N/A (IMF degraded; WB not needed for EP political analysis) |
| EP `monitor_legislative_pipeline` | ❌ Empty (API gap) | legislative-pipeline-forecast.md (alternate sources) |
