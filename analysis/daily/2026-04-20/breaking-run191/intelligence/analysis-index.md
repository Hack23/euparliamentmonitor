---
articleType: breaking
runId: 191
date: 2026-04-20
---

# 📂 Analysis Index — Breaking Run 191 (2026-04-20)

## Run Metadata

| Field | Value |
|-------|-------|
| Run ID | 191 |
| Date | 2026-04-20 (Monday — Easter recess Day 8; Easter Sunday was April 5) |
| Recess Day | 8 (of 13, April 14-26) |
| API Outage Day | 11 |
| Article Generated | NO (analysis-only) |
| Significance Score | 16/50 |

## Artifact Registry

### Classification
- [`classification/significance-scoring.md`](../classification/significance-scoring.md)
  - Composite significance scoring (16/50)
  - Forward monitoring priorities
  - Newsworthiness gate decision

### Risk Scoring
- [`risk-scoring/risk-matrix.md`](../risk-scoring/risk-matrix.md)
  - 12-item risk register across 4 categories
  - Quadrant visualisation
  - Trend indicators vs prior runs

- [`risk-scoring/quantitative-swot.md`](../risk-scoring/quantitative-swot.md)
  - Full SWOT with 4 items per quadrant
  - All items ≥80 words with evidence
  - Confidence levels documented

### Threat Assessment
- [`threat-assessment/political-threat-landscape.md`](../threat-assessment/political-threat-landscape.md)
  - Threat classification matrix
  - USTR Section 301 deep analysis
  - Coalition risk vectors
  - Gantt timeline (April 20-30)

### Intelligence
- [`intelligence/coalition-dynamics.md`](../intelligence/coalition-dynamics.md)
  - Grand Centre stability: 84/100
  - Alliance signals
  - Post-recess risk vectors
  - Roll-call voting history analysis

- [`intelligence/cross-run-diff.md`](../intelligence/cross-run-diff.md)
  - Run 190 → Run 191 delta analysis
  - Hypothesis status updates (H1-H4)
  - Probability distribution revision
  - Full series diff table (Runs 179-191)

- [`intelligence/synthesis-summary.md`](../intelligence/synthesis-summary.md) ← **MASTER DOCUMENT**
  - 5 headline intelligence signals
  - Updated probability model
  - Stakeholder intelligence
  - Forward monitoring calendar (7 items)
  - Reference example disclaimer

- [`intelligence/scenario-forecast.md`](../intelligence/scenario-forecast.md) ← **NEW**
  - Four-scenario probability model (A/B/C/D)
  - Bayesian update log with likelihood ratios
  - Decision tree flowchart
  - Sub-scenarios with conditional probabilities
  - Run 192 update triggers

- [`intelligence/stakeholder-map.md`](../intelligence/stakeholder-map.md) ← **NEW**
  - 22-actor power/interest quadrant chart
  - EU institutions, political groups, committees
  - External actors: USTR, PRC, Ukraine
  - Industry and civil society stakeholders
  - ≥150-word perspectives for major actors

- [`intelligence/threat-model.md`](../intelligence/threat-model.md) ← **NEW**
  - STRIDE framework adapted for political institutions
  - Three attack trees (API, Coalition, USTR)
  - Threat actor profiles with capability-intent-opportunity
  - Threat assessment matrix (8 threats)

- [`intelligence/pestle-analysis.md`](../intelligence/pestle-analysis.md) ← **NEW**
  - Six-dimension macro-environment scan
  - Political-Technological nexus analysis
  - Forward matrix (April 21 – May 31)
  - Cross-dimensional interactions

- [`intelligence/workflow-audit.md`](../intelligence/workflow-audit.md) ← **NEW**
  - 22-rule compliance scoring (90%)
  - Evidence for each rule
  - Lessons for Run 192

- [`intelligence/reference-analysis-quality.md`](../intelligence/reference-analysis-quality.md) ← **NEW**
  - 19-artifact depth audit
  - SWOT word-count verification (all ≥80 words)
  - Quality scorecard (14/14 gates pass)

- [`intelligence/economic-context.md`](../intelligence/economic-context.md) ← **NEW**
  - EU27/US/China GDP trajectories
  - Banking Union economic stakes
  - USTR Section 301 economic impact assessment
  - Ukraine Facility fiscal implications

- [`intelligence/mcp-reliability-audit.md`](../intelligence/mcp-reliability-audit.md) ← **NEW**
  - 13-run MCP feed reliability audit
  - Per-tool error profile (13 tools × 13 runs)
  - Two-phase recovery model formalised
  - FeedUnavailableError guard inventory
  - EP API architecture deep dive

- [`intelligence/historical-baseline.md`](../intelligence/historical-baseline.md) ← **NEW**
  - EP9 Easter 2023/2024 comparison
  - EP10 Easter 2025 comparison
  - EP API outage historical ranking
  - Emergency plenary precedent analysis

- [`intelligence/wildcards-blackswans.md`](../intelligence/wildcards-blackswans.md) ← **NEW**
  - 6 wildcards (2-8% probability)
  - 3 black swans (<2% probability)
  - Wildcard interaction analysis
  - Monitoring signals and response playbooks

### Documents
- [`documents/document-analysis-index.md`](../documents/document-analysis-index.md)
  - Full corpus: 22 texts (18 from March 26 + 4 restored)
  - Content availability status table
  - API call efficiency log

## Feed Endpoint Status (Run 191)

| Endpoint | Status | Notes |
|----------|--------|-------|
| `get_plenary_sessions` | ✅ OK | Health gate passed |
| `get_adopted_texts(year:2026)` | ✅ OK | Returns 104 items |
| `get_adopted_texts_feed(today)` | ⚠️ DEGRADED | Returns EP8/2019 data |
| `get_adopted_texts_feed(one-week)` | ✅ OK | 203 items mixed |
| `get_meps_feed` | ✅ OK | Large dataset |
| `analyze_coalition_dynamics` | ⚠️ PARTIAL | EPP memberCount=0 (known gap) |
| `get_events_feed` | ❌ SKIPPED | Tier-2 outage |
| `get_procedures_feed` | ❌ SKIPPED | Tier-2 outage |
| `get_parliamentary_questions_feed` | ❌ SKIPPED | Tier-2 outage |
| `get_all_generated_stats` | ✅ OK | Historical context retrieved |

## Run Comparison Table

| Run | Date | Score | Article | API Count | Key Finding |
|-----|------|-------|---------|-----------|-------------|
| 188 | 2026-04-18 | ~14 | NO | 104 | Recess begins |
| 189 | 2026-04-19 | ~14 | NO | 101 | First regression |
| 190 | 2026-04-20 | 15 | NO | 100 | Second regression, same day |
| **191** | **2026-04-20** | **16** | **NO** | **104** | **Metadata restored** |

## Quality Gates Status (Updated for 19 Artifacts)

- [x] 19 analysis artifacts present (9 original + 10 new intelligence)
- [x] Cross-run diff documented (including full 13-run series table)
- [x] SWOT items ≥80 words each (5 items per quadrant, all verified)
- [x] Forward monitoring ≥15 items across all artifacts
- [x] Data quality delta section present in multiple artifacts
- [x] Zero `[AI_ANALYSIS_REQUIRED]` markers across all 19 files
- [x] ELAPSED_MINUTES footer in synthesis (48 minutes)
- [x] API endpoint status table present
- [x] Significance scoring with methodology appendix
- [x] Mermaid diagrams with canonical init blocks (19+ diagrams)
- [x] Confidence markers (🟢/🟡/🔴) on all analytical claims
- [x] Cross-references between all 19 artifacts
- [x] Reference example disclaimer in synthesis-summary.md
- [x] TOWS strategic matrix in quantitative-swot.md
- [x] Threat actor profiles in political-threat-landscape.md
- [x] Full series diff table in cross-run-diff.md
